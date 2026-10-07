import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleAuthProvider, OperationType, handleFirestoreError } from '../lib/firebase';
import {
  FirestoreProfile,
  syncUserProfileInFirestore,
  recordLogoutInFirestore,
  mapProfileDoc,
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
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(true);

  const openLoginModal = useCallback(() => {
    setAuthError(null);
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setAuthError(null);
    setLoginModalOpen(false);
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        setLoginModalOpen(false);
        try {
          const synced = await syncUserProfileInFirestore(firebaseUser, false);
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
              try {
                handleFirestoreError(error, OperationType.GET, `profiles/${firebaseUser.uid}`);
              } catch {
                // Handled by structured logger
              }
            }
          );
        } catch (err) {
          console.error('Failed to sync profile with Firestore:', err);
        }
      } else {
        setProfile(null);
        setLoginModalOpen(true);
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
      const synced = await syncUserProfileInFirestore(credential.user, true);
      setProfile(synced);
      setLoginModalOpen(false);
      return synced;
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      setAuthError("We couldn't sign you in. Please try again.");
      throw err;
    }
  };

  const signOutUser = async () => {
    // Record logout event in /activity_logs while user is still authenticated
    await recordLogoutInFirestore(auth.currentUser, profile);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setLoginModalOpen(true);
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
