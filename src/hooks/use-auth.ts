
"use client";
import { useState, useEffect, useCallback } from 'react';
import { getFirebaseAuth } from '@/lib/firebase';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    updateProfile,
    type User,
    type Auth,
    type IdTokenResult,
} from 'firebase/auth';
import { logLogin, logLogout } from '@/app/actions';

interface AppUser extends User {
    claims?: IdTokenResult['claims'];
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  const handleUser = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const userWithClaims: AppUser = firebaseUser as AppUser;
        userWithClaims.claims = idTokenResult.claims;
        setUser(userWithClaims);
    } else {
        setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const authInstance = getFirebaseAuth();
    setAuth(authInstance);

    if (!authInstance) {
      console.error("Firebase Auth is not initialized. Make sure your Firebase environment variables are set.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(authInstance, handleUser);

    return () => unsubscribe();
  }, [handleUser]);
  
  useEffect(() => {
    if (!user || !auth) return;

    const interval = setInterval(async () => {
      try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        if (idTokenResult.claims.blocked) {
          console.log("User is blocked, signing out.");
          await firebaseSignOut(auth);
        } else {
            // Re-run handleUser to update claims if they changed
            handleUser(auth.currentUser);
        }
      } catch (error) {
        console.error("Error refreshing token for block check:", error);
        await firebaseSignOut(auth);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [user, auth, handleUser]);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await logLogin(idToken);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
    }
  };

  const signUpWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await sendEmailVerification(userCredential.user);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error during email/password sign-up:", error);
      throw error;
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
     if (!auth) throw new Error("Firebase Auth is not initialized.");
     try {
       const result = await signInWithEmailAndPassword(auth, email, password);
       if (result.user) {
         const idToken = await result.user.getIdToken();
         await logLogin(idToken);
       }
     } catch(error) {
        console.error("Error during email/password sign-in:", error);
        throw error;
     }
  };

  const sendVerificationEmail = async () => {
    if (!auth?.currentUser) throw new Error("No user is currently signed in.");
    try {
      await sendEmailVerification(auth.currentUser);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  }

  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    try {
        await sendPasswordResetEmail(auth, email);
    } catch(error) {
        console.error("Error sending password reset email:", error);
        throw error;
    }
  }

  const signOut = async () => {
    if (!auth || !auth.currentUser) {
        console.error("Sign-out failed: Firebase Auth not initialized or no user signed in.");
        if (auth) await firebaseSignOut(auth).catch(e => console.error("Error on final sign out attempt:", e));
        return;
    }

    try {
        const idToken = await auth.currentUser.getIdToken();
        logLogout(idToken).catch(e => console.error("Failed to log logout event.", e));
    } catch (e) {
        console.error("Failed to get ID token for logging logout event.", e);
    }
    
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
      throw error;
    }
  };

  return { 
      user, 
      loading, 
      signInWithGoogle, 
      signOut, 
      isAuthAvailable: !!auth,
      signUpWithEmailAndPassword,
      signInWithEmailPassword,
      sendVerificationEmail,
      sendPasswordReset,
    };
}
