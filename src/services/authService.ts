import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  async register(email: string, pass: string, displayName: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    await this.ensureUserProfile(cred.user);
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // Ignored if emulator or rate-limited
    }
    return cred.user;
  },

  async login(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await this.ensureUserProfile(cred.user);
    return cred.user;
  },

  async loginWithGoogle(): Promise<User> {
    const cred = await signInWithPopup(auth, googleProvider);
    await this.ensureUserProfile(cred.user);
    return cred.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  async ensureUserProfile(user: User): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      role: 'user',
      createdAt: new Date().toISOString(),
      preferences: {
        language: 'en',
        theme: 'light'
      }
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
};
