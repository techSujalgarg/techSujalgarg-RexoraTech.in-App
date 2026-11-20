import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  auth,
  BLUEPRINT_LIMITS,
  db,
  formatFirestoreUiError,
  handleFirestoreError,
  OperationType,
} from '../firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  authBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

async function ensureUserWorkspace(user: User): Promise<void> {
  if (!user.emailVerified || !user.email) return;

  const userPath = `users/${user.uid}`;
  const privatePath = `users/${user.uid}/private/info`;
  const userRef = doc(db, 'users', user.uid);
  const privateRef = doc(db, 'users', user.uid, 'private', 'info');

  const safeDisplayName = (user.displayName || user.email.split('@')[0] || 'Client')
    .trim()
    .slice(0, BLUEPRINT_LIMITS.maxDisplayNameLength);
  const safeEmail = user.email.trim().slice(0, BLUEPRINT_LIMITS.maxEmailLength);

  let existingUserSnap;
  try {
    existingUserSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }

  if (!existingUserSnap.exists()) {
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: safeDisplayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, userPath);
    }
  } else {
    try {
      await updateDoc(userRef, {
        displayName: safeDisplayName,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userPath);
    }
  }

  let existingPrivateSnap;
  try {
    existingPrivateSnap = await getDoc(privateRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, privatePath);
  }

  if (!existingPrivateSnap.exists()) {
    try {
      await setDoc(privateRef, {
        uid: user.uid,
        email: safeEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, privatePath);
    }
  } else {
    try {
      await updateDoc(privateRef, {
        email: safeEmail,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, privatePath);
    }
  }
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser && nextUser.emailVerified) {
        try {
          await ensureUserWorkspace(nextUser);
        } catch (error) {
          setAuthError(formatFirestoreUiError(error));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to complete Google sign-in right now.'
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Unable to sign out right now.'
      );
    } finally {
      setAuthBusy(false);
    }
  };

  const isVerified = Boolean(user && user.emailVerified);
  const isAdmin = Boolean(isVerified && user?.email === ADMIN_EMAIL);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isVerified,
        isAdmin,
        authBusy,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
