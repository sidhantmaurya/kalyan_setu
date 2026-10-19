import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../lib/firebase';
import {
  FirestoreProfile,
  syncUserProfileInFirestore,
  recordLogoutInFirestore,
  mapProfileDoc,
  isBootstrappedAdminEmail,
} from '../lib/firestoreService';

export type UserProfile = FirestoreProfile;

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('kalyansetu_welcome_dismissed') !== 'true';
    }
    return true;
  });

  const openLoginModal = useCallback(() => {
    setAuthError(null);
    setLoginModalOpen(true);
    try {
      sessionStorage.removeItem('kalyansetu_welcome_dismissed');
    } catch {}
  }, []);

  const closeLoginModal = useCallback(() => {
    setAuthError(null);
    setLoginModalOpen(false);
    try {
      sessionStorage.setItem('kalyansetu_welcome_dismissed', 'true');
    } catch {}
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    // Check if user is returning from a redirect-based sign-in flow (common on mobile)
    getRedirectResult(auth)
      .then(async (credential) => {
        if (credential?.user) {
          const synced = await syncUserProfileInFirestore(credential.user, true);
          setProfile(synced);
          setLoginModalOpen(false);
        }
      })
      .catch((err) => {
        if (err?.code !== 'auth/popup-closed-by-user') {
          console.warn('Redirect sign-in notice:', err?.message || err);
        }
      });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        // Immediate optimistic profile so UI renders in 0ms without waiting for Firestore
        const isBootstrapAdmin = isBootstrappedAdminEmail(firebaseUser.email);
        const optimisticProfile: UserProfile = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || `${firebaseUser.uid}@user.kalyansetu.in`,
          fullName: firebaseUser.displayName || 'Member',
          avatarUrl: firebaseUser.photoURL || '',
          phone: '',
          role: isBootstrapAdmin ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setProfile((prev) => prev || optimisticProfile);
        setLoginModalOpen(false);

        try {
          // Fast sync with Firestore; non-blocking fallback if slow
          const syncPromise = syncUserProfileInFirestore(firebaseUser, false);
          const timeoutPromise = new Promise<UserProfile>((resolve) =>
            setTimeout(() => resolve(optimisticProfile), 2500)
          );
          const synced = await Promise.race([syncPromise, timeoutPromise]);
          setProfile(synced);

          const profileRef = doc(db, 'profiles', firebaseUser.uid);
          unsubProfile = onSnapshot(
            profileRef,
            (snap) => {
              if (snap.exists()) {
                setProfile(mapProfileDoc(snap.id, snap.data()));
              }
            },
            (error) => {
              // Ignore offline snapshot errors gracefully
              if (error?.message?.includes('offline')) {
                return;
              }
              console.warn('Profile sync snapshot notice:', error?.message || error);
            }
          );
        } catch (err) {
          console.warn('Profile sync notice:', err);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const isBootstrapAdmin = isBootstrappedAdminEmail(credential.user.email);
      const optimisticProfile: UserProfile = {
        id: credential.user.uid,
        uid: credential.user.uid,
        email: credential.user.email || `${credential.user.uid}@user.kalyansetu.in`,
        fullName: credential.user.displayName || 'Member',
        avatarUrl: credential.user.photoURL || '',
        phone: '',
        role: isBootstrapAdmin ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };
      setUser(credential.user);
      setProfile(optimisticProfile);
      setLoginModalOpen(false);

      // Complete Firestore sync in background or fast await
      try {
        const syncPromise = syncUserProfileInFirestore(credential.user, true);
        const timeoutPromise = new Promise<UserProfile>((resolve) =>
          setTimeout(() => resolve(optimisticProfile), 2500)
        );
        const synced = await Promise.race([syncPromise, timeoutPromise]);
        setProfile(synced);
        return synced;
      } catch {
        return optimisticProfile;
      }
    } catch (err: any) {
      // If mobile or browser blocks popups, fallback to redirect flow seamlessly
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, googleAuthProvider);
          return null;
        } catch (redirectErr) {
          console.error('Redirect sign-in fallback error:', redirectErr);
        }
      }

      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in failed:', err);
        setAuthError("We couldn't sign you in. Please try again.");
      }
      throw err;
    }
  };

  const signOutUser = async () => {
    // Immediate UI feedback so button is 100% responsive
    const currentUser = auth.currentUser;
    const currentProfile = profile;
    setUser(null);
    setProfile(null);
    setLoginModalOpen(false);

    try {
      // Background audit log without blocking user
      if (currentUser) {
        recordLogoutInFirestore(currentUser, currentProfile).catch(() => {});
      }
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase auth signOut notice:', err);
    }
  };

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!auth.currentUser) return null;
    const synced = await syncUserProfileInFirestore(auth.currentUser, false);
    setProfile(synced);
    return synced;
  }, []);

  const authFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers || {});
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(input, {
      ...init,
      headers,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        signInWithGoogle,
        signOutUser,
        refreshProfile,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
