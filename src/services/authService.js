import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
const AUTH_STORAGE_KEY = 'aruna_auth_session_user';
export const getAllowedEmails = () => {
  const envEmails = import.meta.env.VITE_ALLOWED_EMAILS || 'randomrewin879@gmail.com,santhoshsandy81140@gmail.com';
  return envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
};
export const authService = {
  isFirebaseReady() {
    return isFirebaseConfigured() && Boolean(auth) && Boolean(googleProvider);
  },
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (this.isEmailAllowed(user.email)) {
        return user;
      }
      this.logout();
      return null;
    } catch (e) {
      console.error('Failed to parse auth user session:', e);
      return null;
    }
  },
  isEmailAllowed(email) {
    if (!email) return false;
    const normalized = email.trim().toLowerCase();
    const allowed = getAllowedEmails();
    return allowed.includes(normalized);
  },
  async signInWithGoogle() {
    if (!this.isFirebaseReady()) {
      return {
        success: false,
        error: 'Firebase is not yet configured. Please add your Firebase API keys to the .env file.'
      };
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const email = firebaseUser.email;
      if (!this.isEmailAllowed(email)) {
        await signOut(auth);
        return {
          success: false,
          error: `Access Denied: The account "${email}" does not have access permissions.`
        };
      }
      const user = {
        email: email.toLowerCase(),
        name: firebaseUser.displayName || email.split('@')[0],
        photoURL: firebaseUser.photoURL || '',
        uid: firebaseUser.uid,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (err) {
      console.error('Firebase Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in cancelled.' };
      }
      return { success: false, error: err.message || 'Google Sign-In failed.' };
    }
  },
  loginWithEmail(email) {
    if (!email) {
      return { success: false, error: 'Please enter your email.' };
    }
    const normalized = email.trim().toLowerCase();
    if (!this.isEmailAllowed(normalized)) {
      return {
        success: false,
        error: 'Access Denied: You do not have permission to access this billing suite.'
      };
    }
    const user = {
      email: normalized,
      name: normalized.split('@')[0],
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    return { success: true, user };
  },
  async logout() {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Firebase sign-out warning:', e);
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};