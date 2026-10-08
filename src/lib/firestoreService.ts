import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, db, OperationType, handleFirestoreError } from './firebase';

export type ActivityEventType =
  | 'signup'
  | 'signin'
  | 'login'
  | 'logout'
  | 'subscriber'
  | 'contact_form';

export interface FirestoreProfile {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt: string | null;
}

export interface FirestoreContactMessage {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  reason: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  notifiedAt: string | null;
  notificationError: string | null;
}

export interface FirestoreSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface FirestoreActivityLog {
  id: string;
  eventType: ActivityEventType;
  userId: string;
  email: string;
  fullName: string;
  details: string;
  createdAt: string;
}

const BOOTSTRAPPED_ADMIN_EMAILS = new Set([
  'sidhantmaurya140@gmail.com',
  'rdivyansh088@gmail.com',
  'divyansh@kalyansetu.in',
]);

export function isBootstrappedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return BOOTSTRAPPED_ADMIN_EMAILS.has(email.toLowerCase().trim());
}

function timestampToIso(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'object' && val !== null && 'seconds' in val) {
    return new Date((val as { seconds: number }).seconds * 1000).toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export function mapProfileDoc(id: string, data: Record<string, any>): FirestoreProfile {
  return {
    id,
    uid: data.uid || id,
    email: data.email || '',
    fullName: data.fullName || 'Member',
    avatarUrl: data.avatarUrl || '',
    phone: data.phone || '',
    role: data.role === 'admin' ? 'admin' : 'user',
    createdAt: timestampToIso(data.createdAt),
    lastLoginAt: data.lastLoginAt ? timestampToIso(data.lastLoginAt) : null,
  };
}

export function mapMessageDoc(id: string, data: Record<string, any>): FirestoreContactMessage {
  return {
    id,
    userId: data.userId === 'guest' ? '' : data.userId || '',
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || null,
    reason: data.reason || 'General Inquiry',
    message: data.message || '',
    status: data.status || 'new',
    adminNotes: data.adminNotes || null,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    notifiedAt: data.notifiedAt ? String(data.notifiedAt) : null,
    notificationError: data.notificationError ? String(data.notificationError) : null,
  };
}

export function mapSubscriberDoc(id: string, data: Record<string, any>): FirestoreSubscriber {
  return {
    id,
    email: data.email || '',
    createdAt: timestampToIso(data.createdAt),
  };
}

export function mapActivityLogDoc(id: string, data: Record<string, any>): FirestoreActivityLog {
  return {
    id,
    eventType: (data.eventType as ActivityEventType) || 'signin',
    userId: data.userId || 'guest',
    email: data.email || '',
    fullName: data.fullName || 'Visitor',
    details: data.details || '',
    createdAt: timestampToIso(data.createdAt),
  };
}

export async function recordActivityLog(input: {
  eventType: ActivityEventType;
  userId?: string | null;
  email: string;
  fullName?: string | null;
  details: string;
}): Promise<string> {
  const logsCollection = collection(db, 'activity_logs');
  const newLogRef = doc(logsCollection);
  const path = `activity_logs/${newLogRef.id}`;

  const cleanUserId = (input.userId || auth.currentUser?.uid || 'guest')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  const cleanEmail = input.email.trim().slice(0, 160);
  const cleanName = (input.fullName || cleanEmail.split('@')[0] || 'Visitor')
    .trim()
    .slice(0, 100);
  const cleanDetails = input.details.trim().slice(0, 1000) || input.eventType;

  try {
    await setDoc(newLogRef, {
      eventType: input.eventType,
      userId: cleanUserId,
      email: cleanEmail,
      fullName: cleanName,
      details: cleanDetails,
      createdAt: serverTimestamp(),
    });
    return newLogRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncUserProfileInFirestore(
  firebaseUser: User,
  recordSignInEvent = false
): Promise<FirestoreProfile> {
  const uid = firebaseUser.uid;
  const email = (firebaseUser.email || `${uid}@user.kalyansetu.in`).slice(0, 160);
  const fullName = (firebaseUser.displayName || email.split('@')[0] || 'Member').slice(0, 100);
  const avatarUrl = (firebaseUser.photoURL || '').slice(0, 500);
  const profilePath = `profiles/${uid}`;
  const profileRef = doc(db, 'profiles', uid);

  let snap;
  try {
    snap = await getDoc(profileRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  const isBootstrapAdmin = isBootstrappedAdminEmail(email);

  if (!snap.exists()) {
    const initialRole: 'user' | 'admin' = isBootstrapAdmin ? 'admin' : 'user';
    const newProfilePayload = {
      uid,
      email,
      fullName,
      avatarUrl,
      phone: '',
      role: initialRole,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    try {
      await setDoc(profileRef, newProfilePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, profilePath);
    }

    if (initialRole === 'admin') {
      const adminRef = doc(db, 'admins', uid);
      try {
        await setDoc(adminRef, {
          uid,
          email,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `admins/${uid}`);
      }
      await seedInitialFirestoreDataIfEmpty();
    }

    // Record signup + initial signin in /activity_logs
    await recordActivityLog({
      eventType: 'signup',
      userId: uid,
      email,
      fullName,
      details: `New account registered via Google (${initialRole.toUpperCase()} role)`,
    }).catch(() => {});

    await recordActivityLog({
      eventType: 'signin',
      userId: uid,
      email,
      fullName,
      details: 'First Google sign-in session started',
    }).catch(() => {});

    const createdSnap = await getDoc(profileRef);
    return mapProfileDoc(uid, createdSnap.data() || newProfilePayload);
  } else {
    const existingData = snap.data();
    try {
      await updateDoc(profileRef, {
        fullName: (firebaseUser.displayName || existingData.fullName || 'Member').slice(0, 100),
        avatarUrl: (firebaseUser.photoURL || existingData.avatarUrl || '').slice(0, 500),
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }

    if (recordSignInEvent) {
      await recordActivityLog({
        eventType: 'signin',
        userId: uid,
        email,
        fullName,
        details: 'User signed in with Google OAuth',
      }).catch(() => {});
    }

    if (existingData.role === 'admin' || isBootstrapAdmin) {
      await seedInitialFirestoreDataIfEmpty();
    }

    const updatedSnap = await getDoc(profileRef);
    return mapProfileDoc(uid, updatedSnap.data() || existingData);
  }
}

export async function recordLogoutInFirestore(
  firebaseUser: User | null,
  profile: FirestoreProfile | null
): Promise<void> {
  if (!firebaseUser) return;
  const email = profile?.email || firebaseUser.email || `${firebaseUser.uid}@user.kalyansetu.in`;
  const fullName = profile?.fullName || firebaseUser.displayName || 'Member';
  await recordActivityLog({
    eventType: 'logout',
    userId: firebaseUser.uid,
    email,
    fullName,
    details: 'User signed out of KalyanSetu',
  }).catch(() => {});
}

export async function updateUserPhoneInFirestore(uid: string, phone: string): Promise<void> {
  const cleanPhone = phone.trim().slice(0, 20);
  const profilePath = `profiles/${uid}`;
  try {
    await updateDoc(doc(db, 'profiles', uid), {
      phone: cleanPhone,
      lastLoginAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }
}

export async function deleteUserAccountFromFirestore(uid: string): Promise<void> {
  const profilePath = `profiles/${uid}`;
  try {
    await deleteDoc(doc(db, 'profiles', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, profilePath);
  }
}

export async function submitContactMessageToFirestore(input: {
  userId: string | null;
  fullName: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
}): Promise<string> {
  const activeUid = input.userId || auth.currentUser?.uid;
  if (!activeUid || !auth.currentUser) {
    throw new Error('Authentication is required to submit the contact form.');
  }

  const msgCollection = collection(db, 'contact_messages');
  const newDocRef = doc(msgCollection);
  const path = `contact_messages/${newDocRef.id}`;

  const nowIso = new Date().toISOString();
  const payload = {
    userId: activeUid,
    fullName: input.fullName.trim().slice(0, 100),
    email: (auth.currentUser.email || input.email).trim().slice(0, 160),
    phone: input.phone.trim().slice(0, 20),
    reason: input.reason,
    message: input.message.trim().slice(0, 5000),
    status: 'new',
    adminNotes: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    notifiedAt: nowIso,
    notificationError: '',
  };

  try {
    await setDoc(newDocRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  // Record contact_form submission in unified /activity_logs collection
  await recordActivityLog({
    eventType: 'contact_form',
    userId: activeUid,
    email: payload.email,
    fullName: payload.fullName,
    details: `[${payload.reason}] ${payload.message.slice(0, 180)}`,
  }).catch(() => {});

  // Trigger backend admin email notification asynchronously
  fetch('/api/contact/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: newDocRef.id,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || null,
      reason: payload.reason,
      message: payload.message,
      isSignedIn: Boolean(input.userId),
      profileEmail: payload.email,
      createdAt: nowIso,
    }),
  }).catch(() => {});

  return newDocRef.id;
}

export async function subscribeNewsletterInFirestore(
  rawEmail: string
): Promise<{ alreadySubscribed: boolean }> {
  const cleanEmail = rawEmail.toLowerCase().trim().slice(0, 160);
  const safeId =
    'sub_' +
    cleanEmail
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 100);
  const subRef = doc(db, 'newsletter_subscribers', safeId);
  const path = `newsletter_subscribers/${safeId}`;

  try {
    await setDoc(subRef, {
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });

    // Record subscriber event in unified /activity_logs collection
    await recordActivityLog({
      eventType: 'subscriber',
      userId: auth.currentUser?.uid || 'guest',
      email: cleanEmail,
      fullName: auth.currentUser?.displayName || cleanEmail.split('@')[0] || 'Subscriber',
      details: `Subscribed to KalyanSetu newsletter (${cleanEmail})`,
    }).catch(() => {});

    return { alreadySubscribed: false };
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      return { alreadySubscribed: true };
    }
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeUserMessages(
  uid: string,
  onData: (messages: FirestoreContactMessage[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, 'contact_messages'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => mapMessageDoc(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'contact_messages');
      } catch (e: any) {
        onError?.(e);
      }
    }
  );
}

export function subscribeAdminData(
  onMessages: (msgs: FirestoreContactMessage[]) => void,
  onUsers: (users: FirestoreProfile[]) => void,
  onSubscribers: (subs: FirestoreSubscriber[]) => void,
  onActivityLogs: (logs: FirestoreActivityLog[]) => void,
  onError?: (err: Error) => void
) {
  const unsubMessages = onSnapshot(
    collection(db, 'contact_messages'),
    (snap) => {
      const list = snap.docs
        .map((d) => mapMessageDoc(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onMessages(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'contact_messages');
      } catch (e: any) {
        onError?.(e);
      }
    }
  );

  const unsubUsers = onSnapshot(
    collection(db, 'profiles'),
    (snap) => {
      const list = snap.docs
        .map((d) => mapProfileDoc(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUsers(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'profiles');
      } catch (e: any) {
        onError?.(e);
      }
    }
  );

  const unsubSubs = onSnapshot(
    collection(db, 'newsletter_subscribers'),
    (snap) => {
      const list = snap.docs
        .map((d) => mapSubscriberDoc(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSubscribers(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'newsletter_subscribers');
      } catch (e: any) {
        onError?.(e);
      }
    }
  );

  const unsubLogs = onSnapshot(
    collection(db, 'activity_logs'),
    (snap) => {
      const list = snap.docs
        .map((d) => mapActivityLogDoc(d.id, d.data()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onActivityLogs(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'activity_logs');
      } catch (e: any) {
        onError?.(e);
      }
    }
  );

  return () => {
    unsubMessages();
    unsubUsers();
    unsubSubs();
    unsubLogs();
  };
}

export async function updateMessageInFirestoreByAdmin(
  messageId: string,
  updates: {
    status?: 'new' | 'read' | 'replied' | 'archived';
    adminNotes?: string;
    notifiedAt?: string;
    notificationError?: string;
  }
): Promise<void> {
  const path = `contact_messages/${messageId}`;
  const cleanUpdates: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };
  if (updates.status !== undefined) cleanUpdates.status = updates.status;
  if (updates.adminNotes !== undefined) {
    cleanUpdates.adminNotes = updates.adminNotes.slice(0, 2000);
  }
  if (updates.notifiedAt !== undefined) {
    cleanUpdates.notifiedAt = updates.notifiedAt.slice(0, 64);
  }
  if (updates.notificationError !== undefined) {
    cleanUpdates.notificationError = updates.notificationError.slice(0, 300);
  }

  try {
    await updateDoc(doc(db, 'contact_messages', messageId), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserRoleInFirestoreByAdmin(
  targetUser: FirestoreProfile,
  nextRole: 'user' | 'admin'
): Promise<void> {
  const profilePath = `profiles/${targetUser.id}`;
  try {
    await updateDoc(doc(db, 'profiles', targetUser.id), {
      role: nextRole,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }

  const adminMarkerPath = `admins/${targetUser.id}`;
  const adminRef = doc(db, 'admins', targetUser.id);
  if (nextRole === 'admin') {
    try {
      await setDoc(adminRef, {
        uid: targetUser.id,
        email: targetUser.email,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, adminMarkerPath);
    }
  } else {
    try {
      const markerSnap = await getDoc(adminRef);
      if (markerSnap.exists()) {
        await deleteDoc(adminRef);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, adminMarkerPath);
    }
  }
}

export async function seedInitialFirestoreDataIfEmpty(): Promise<void> {
  try {
    const existingLogs = await getDocs(collection(db, 'activity_logs'));
    if (existingLogs.empty) {
      await setDoc(doc(db, 'activity_logs', 'seed_log_signup_1'), {
        eventType: 'signup',
        userId: 'supporter-ananya-nair',
        email: 'ananya.nair@cukerala.ac.in',
        fullName: 'Ananya Nair',
        details: 'New account registered via Google (USER role)',
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'activity_logs', 'seed_log_signin_1'), {
        eventType: 'signin',
        userId: 'founder-divyansh-rai',
        email: 'divyansh@kalyansetu.in',
        fullName: 'Divyansh Rai',
        details: 'User signed in with Google OAuth (ADMIN)',
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'activity_logs', 'seed_log_subscriber_1'), {
        eventType: 'subscriber',
        userId: 'guest',
        email: 'rajesh.menon@malabarfoods.org',
        fullName: 'Rajesh Menon',
        details: 'Subscribed to KalyanSetu newsletter (rajesh.menon@malabarfoods.org)',
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'activity_logs', 'seed_log_contact_1'), {
        eventType: 'contact_form',
        userId: 'guest',
        email: 'rajesh.menon@malabarfoods.org',
        fullName: 'Rajesh Menon',
        details:
          '[Partner With Us] Namaste Divyansh, we operate a wholesale rice and pulses cooperative in Kasaragod...',
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'activity_logs', 'seed_log_logout_1'), {
        eventType: 'logout',
        userId: 'supporter-ananya-nair',
        email: 'ananya.nair@cukerala.ac.in',
        fullName: 'Ananya Nair',
        details: 'User signed out of KalyanSetu',
        createdAt: serverTimestamp(),
      });
    }

    const existingMsgs = await getDocs(collection(db, 'contact_messages'));
    if (!existingMsgs.empty) return;

    const nowIso = new Date().toISOString();

    await setDoc(doc(db, 'profiles', 'founder-divyansh-rai'), {
      uid: 'founder-divyansh-rai',
      email: 'divyansh@kalyansetu.in',
      fullName: 'Divyansh Rai',
      avatarUrl: '',
      phone: '+91 98765 43210',
      role: 'admin',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'profiles', 'supporter-ananya-nair'), {
      uid: 'supporter-ananya-nair',
      email: 'ananya.nair@cukerala.ac.in',
      fullName: 'Ananya Nair',
      avatarUrl: '',
      phone: '+91 94470 11223',
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'contact_messages', 'seed_msg_1'), {
      userId: 'guest',
      fullName: 'Rajesh Menon',
      email: 'rajesh.menon@malabarfoods.org',
      phone: '+91 98460 55441',
      reason: 'Partner With Us',
      message:
        'Namaste Divyansh, we operate a wholesale rice and pulses cooperative in Kasaragod and would love to discuss supplying 1-grade grains at direct-from-mill pricing for your pilot kitchen.',
      status: 'new',
      adminNotes: 'High-priority local supplier lead near Central University of Kerala.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notifiedAt: nowIso,
      notificationError: '',
    });

    await setDoc(doc(db, 'contact_messages', 'seed_msg_2'), {
      userId: 'supporter-ananya-nair',
      fullName: 'Ananya Nair',
      email: 'ananya.nair@cukerala.ac.in',
      phone: '+91 94470 11223',
      reason: 'Volunteer',
      message:
        'Hi Divyansh! Fellow student at Central University of Kerala here. Your vision for affordable, dignified thalis near campus really resonates with us. Count me in for weekend community outreach when the pilot launches!',
      status: 'read',
      adminNotes: 'Campus student volunteer — connect during pilot team formation.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notifiedAt: nowIso,
      notificationError: '',
    });

    await setDoc(doc(db, 'newsletter_subscribers', 'sub_ananya_nair_cukerala_ac_in'), {
      email: 'ananya.nair@cukerala.ac.in',
      createdAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'newsletter_subscribers', 'sub_rajesh_menon_malabarfoods_org'), {
      email: 'rajesh.menon@malabarfoods.org',
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-admins cannot seed; silently skip if current user is not an admin
  }
}
