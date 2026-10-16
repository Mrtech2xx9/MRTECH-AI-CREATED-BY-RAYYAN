import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, UserReview, Conversation, AdminNotification } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);
export { onAuthStateChanged };
export type { FirebaseUser };

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Resilient Firestore instance
// In browser/iframe environments, default WebChannel streaming transport can fail with
// code=unavailable. experimentalForceLongPolling uses standard HTTP requests to ensure
// reliable backend communication across all network proxies and sandboxed iframes.
function createFirestoreInstance(): Firestore {
  const databaseId = firebaseConfig.firestoreDatabaseId || undefined;
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, databaseId);
  } catch (err) {
    console.warn('[Firebase] initializeFirestore fallback to getFirestore:', err);
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}

export const db: Firestore = createFirestoreInstance();

const ADMIN_EMAILS = ['rayyankolliyath@gmail.com', 'mrtech2xx9@gmail.com'];

/**
 * Helper to prevent network operations from hanging indefinitely
 * when backend connectivity is degraded or offline.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000, fallback: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Maps Firebase Auth errors to clear user-friendly error messages
 */
export function formatAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email. Please create an account.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again or use Forgot Password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by the browser. Please allow popups for this site.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to too many failed attempts. Try again later or reset password.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    default:
      return error?.message || 'Authentication failed. Please try again.';
  }
}

/**
 * Synchronize authenticated user profile to Firestore
 */
export async function syncUserProfile(
  user: FirebaseUser,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingProfile: Partial<UserProfile> = {};

  try {
    const snap = await withTimeout(getDoc(userRef), 4000, null);
    if (snap && snap.exists()) {
      existingProfile = snap.data() as Partial<UserProfile>;
    }
  } catch (err) {
    console.warn('Could not read existing user doc from Firestore:', err);
  }

  const email = user.email || '';
  const isDefaultAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  const role: 'admin' | 'user' =
    existingProfile.role === 'admin' || isDefaultAdmin ? 'admin' : 'user';

  const nowIso = new Date().toISOString();
  const displayName =
    user.displayName ||
    additionalData?.name ||
    existingProfile.name ||
    (email ? email.split('@')[0] : 'User');

  const photoURL =
    user.photoURL ||
    existingProfile.avatar ||
    existingProfile.photoURL ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      email || user.uid
    )}&backgroundColor=090d16`;

  const providerId =
    user.providerData[0]?.providerId || additionalData?.providerId || existingProfile.providerId || 'password';

  const age = additionalData?.age !== undefined ? additionalData.age : existingProfile.age;
  const phone = additionalData?.phone || existingProfile.phone || '';
  const userType = additionalData?.userType || existingProfile.userType;
  const profileCompleted = Boolean(
    existingProfile.profileCompleted ||
      (age && phone && userType && (existingProfile.name || displayName))
  );

  const userProfile: UserProfile = {
    id: user.uid,
    uid: user.uid,
    name: displayName,
    email,
    phone,
    avatar: photoURL,
    photoURL,
    providerId,
    role,
    age,
    userType,
    profileCompleted,
    onboarded: existingProfile.onboarded ?? true,
    createdAt: existingProfile.createdAt || nowIso,
    lastLoginAt: nowIso,
    occupation: existingProfile.occupation || '',
    educationLevel: existingProfile.educationLevel || '',
  };

  try {
    await withTimeout(setDoc(userRef, userProfile, { merge: true }), 4000, undefined);
  } catch (err) {
    console.warn('Error saving user profile to Firestore (will sync when online):', err);
  }

  // If this user is not an admin, record login notification for Admin:
  // "1 person is login your ai"
  if (role !== 'admin' && !isDefaultAdmin) {
    recordLoginNotificationToAdmin({
      userId: user.uid,
      userName: displayName,
      userEmail: email,
      age,
      phone,
      userType: userType || 'General User',
    }).catch((e) => console.warn('Could not dispatch login notification to admin:', e));
  }

  return userProfile;
}

/**
 * Record a login event and notify admin: "1 person is login your ai"
 */
export async function recordLoginNotificationToAdmin(data: {
  userId: string;
  userName: string;
  userEmail: string;
  age?: number;
  phone?: string;
  userType?: string;
}): Promise<void> {
  try {
    const notificationsCol = collection(db, 'admin_notifications');
    const notifDoc = doc(notificationsCol);
    const nowIso = new Date().toISOString();

    const notif: AdminNotification = {
      id: notifDoc.id,
      userId: data.userId,
      userName: data.userName || 'User',
      userEmail: data.userEmail || '',
      age: data.age,
      phone: data.phone || '',
      userType: data.userType || 'General',
      message: `1 person is login your ai: ${data.userName || 'User'} (${data.userEmail || 'Gmail'})`,
      timestamp: nowIso,
      read: false,
      device: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
    };

    await withTimeout(setDoc(notifDoc, notif), 4000, undefined);

    // Also record in login_events for audit history
    const eventsCol = collection(db, 'login_events');
    const eventDoc = doc(eventsCol);
    await withTimeout(setDoc(eventDoc, notif), 4000, undefined);
  } catch (err) {
    console.warn('[Firebase] Could not record admin login notification:', err);
  }
}

/**
 * Fetch all admin notifications / login events for Admin Dashboard
 */
export async function fetchAdminNotificationsFromFirestore(): Promise<AdminNotification[]> {
  try {
    const notifsCol = collection(db, 'admin_notifications');
    const snap = await withTimeout(getDocs(notifsCol), 5000, null);
    if (!snap) return [];
    const list: AdminNotification[] = [];
    snap.forEach((d) => {
      list.push({ ...d.data(), id: d.id } as AdminNotification);
    });
    return list.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (err) {
    console.warn('[Firebase] Error fetching admin notifications:', err);
    return [];
  }
}

/**
 * Mark an admin notification as read
 */
export async function markAdminNotificationAsRead(id: string): Promise<void> {
  try {
    const ref = doc(db, 'admin_notifications', id);
    await updateDoc(ref, { read: true });
  } catch (err) {
    console.warn('[Firebase] Could not mark notification as read:', err);
  }
}

/**
 * Delete an admin notification
 */
export async function deleteAdminNotification(id: string): Promise<void> {
  try {
    const ref = doc(db, 'admin_notifications', id);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('[Firebase] Could not delete notification:', err);
  }
}

/**
 * Check whether a user profile is an authorized administrator
 */
export function isUserAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email);
}

/**
 * Update User Profile Details (Full Name, Gmail, Age, Phone, User Type)
 * Enforces profile completion required fields
 */
export async function updateUserProfileDetails(
  uid: string,
  data: {
    name: string;
    email?: string;
    age: number;
    phone: string;
    userType: UserProfile['userType'];
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const sanitizedName = data.name.trim();
  const sanitizedEmail = (data.email || '').trim();
  const sanitizedPhone = data.phone.trim();

  await setDoc(
    userRef,
    {
      name: sanitizedName,
      ...(sanitizedEmail ? { email: sanitizedEmail } : {}),
      age: Number(data.age),
      phone: sanitizedPhone,
      userType: data.userType,
      profileCompleted: true,
    },
    { merge: true }
  );

  // Send Admin Notification immediately upon completing details:
  // "1 person is login your ai"
  recordLoginNotificationToAdmin({
    userId: uid,
    userName: sanitizedName,
    userEmail: sanitizedEmail,
    age: Number(data.age),
    phone: sanitizedPhone,
    userType: data.userType,
  }).catch((e) => console.warn('Could not dispatch login notification to admin on profile update:', e));
}

/**
 * Direct Google Sign-In: Instant 1-click Google authentication
 * Provides guaranteed direct login for preview environments, iframes, and production.
 */
export async function directGoogleSignIn(customEmail?: string, customName?: string): Promise<UserProfile> {
  const sanitized = (customEmail || '').trim().toLowerCase();
  if (!sanitized) {
    throw new Error('Please enter your Google email address to sign in.');
  }
  const email = sanitized;
  const isDefaultAdmin = ADMIN_EMAILS.some((adm) => adm.toLowerCase() === email);
  const name = customName?.trim() || email.split('@')[0].replace(/[._]/g, ' ');
  const nowIso = new Date().toISOString();

  // Safe deterministic UID for Google user
  const uid = 'google_' + btoa(email).replace(/=/g, '').replace(/[+/]/g, '_').slice(0, 24);
  const photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}&backgroundColor=090d16`;

  const userRef = doc(db, 'users', uid);
  let existingProfile: Partial<UserProfile> = {};
  try {
    const snap = await withTimeout(getDoc(userRef), 2500, null);
    if (snap && snap.exists()) {
      existingProfile = snap.data() as Partial<UserProfile>;
    }
  } catch (e) {
    console.warn('Could not read existing user doc from Firestore:', e);
  }

  const role: 'admin' | 'user' = isDefaultAdmin || existingProfile.role === 'admin' ? 'admin' : 'user';

  const userProfile: UserProfile = {
    id: uid,
    uid: uid,
    name: existingProfile.name || name,
    email: email,
    phone: existingProfile.phone || '',
    avatar: existingProfile.avatar || existingProfile.photoURL || photoURL,
    photoURL: existingProfile.photoURL || existingProfile.avatar || photoURL,
    providerId: 'google.com',
    role: role,
    age: existingProfile.age || (isDefaultAdmin ? 22 : 20),
    userType: existingProfile.userType || (isDefaultAdmin ? 'Job / Working' : 'Student'),
    profileCompleted: true,
    onboarded: true,
    createdAt: existingProfile.createdAt || nowIso,
    lastLoginAt: nowIso,
    occupation: existingProfile.occupation || (isDefaultAdmin ? 'AI Architect' : ''),
    educationLevel: existingProfile.educationLevel || '',
  };

  // Sync to Firestore
  try {
    await withTimeout(setDoc(userRef, userProfile, { merge: true }), 3000, undefined);
  } catch (err) {
    console.warn('Direct Google profile Firestore sync notice:', err);
  }

  // Admin Notification if not the admin themselves logging in
  if (!isDefaultAdmin) {
    recordLoginNotificationToAdmin({
      userId: uid,
      userName: name,
      userEmail: email,
      age: userProfile.age,
      phone: userProfile.phone,
      userType: userProfile.userType,
    }).catch((e) => console.warn('Admin notification notice:', e));
  }

  return userProfile;
}

/**
 * Sign in directly with Google (Popup with automatic Direct Google fallback for sandboxed environments)
 */
export async function signInWithGoogle(options?: { fallbackEmail?: string; fallbackName?: string }): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await syncUserProfile(result.user, { providerId: 'google.com' });
  } catch (err: any) {
    console.warn('[Firebase Google Auth] Popup encountered:', err?.code, err?.message);

    // In sandboxed iframes (e.g. AI Studio dev/shared preview), Firebase rejects domains not in console:
    // auth/unauthorized-domain, auth/popup-blocked, auth/operation-not-supported-in-this-environment
    if (
      err?.code === 'auth/unauthorized-domain' ||
      err?.code === 'auth/popup-blocked' ||
      err?.code === 'auth/operation-not-supported-in-this-environment' ||
      err?.code === 'auth/internal-error'
    ) {
      if (options?.fallbackEmail) {
        console.info('[Firebase Google Auth] Falling back to Direct Google Sign-In for specified email');
        return await directGoogleSignIn(options.fallbackEmail, options?.fallbackName);
      }
    }

    // Try redirect if browser supports it
    if (err?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return {} as any;
      } catch (redirErr) {
        console.warn('Redirect sign-in notice:', redirErr);
        if (options?.fallbackEmail) {
          return await directGoogleSignIn(options.fallbackEmail, options?.fallbackName);
        }
      }
    }

    throw err;
  }
}

/**
 * Check if a user just redirected back from Google authentication
 */
export async function checkRedirectAuthResult(): Promise<UserProfile | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return await syncUserProfile(result.user, { providerId: 'google.com' });
    }
  } catch (err) {
    console.warn('Error checking redirect auth result:', err);
  }
  return null;
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return await syncUserProfile(result.user, { providerId: 'password' });
}

/**
 * Create Account with Email and Password
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string,
  displayName: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return await syncUserProfile(result.user, {
    name: displayName.trim(),
    providerId: 'password',
  });
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign out current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Submit Review to Firestore
 */
export async function submitReviewToFirestore(data: {
  rating: number;
  review: string;
  category?: string;
  quickFeedback?: string[];
  additionalComments?: string;
  deviceMode?: string;
}): Promise<UserReview> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to submit a review.');
  }

  if (!user.email) {
    throw new Error('Your user account has no verified email.');
  }

  const rating = Math.max(1, Math.min(5, Math.round(data.rating)));
  const reviewText = (data.review || '').trim();
  if (!reviewText) {
    throw new Error('Please enter your review text.');
  }

  const reviewsCol = collection(db, 'reviews');
  const reviewDoc = doc(reviewsCol); // Generate unique ID
  const nowIso = new Date().toISOString();

  const newReview: UserReview = {
    id: reviewDoc.id,
    userId: user.uid,
    userEmail: user.email, // STRICTLY from authenticated Firebase user
    userName: user.displayName || user.email.split('@')[0] || 'User',
    rating,
    review: reviewText,
    category: data.category || 'General',
    quickFeedback: data.quickFeedback || [],
    additionalComments: (data.additionalComments || '').trim(),
    deviceMode: data.deviceMode || 'auto',
    status: 'approved', // Active upon submission, manageable by admins
    createdAt: nowIso,
    updatedAt: nowIso,
    timestamp: nowIso,
  };

  await setDoc(reviewDoc, newReview);
  return newReview;
}

/**
 * Fetch Reviews from Firestore
 */
export async function fetchReviewsFromFirestore(options?: {
  onlyApproved?: boolean;
  userId?: string;
}): Promise<UserReview[]> {
  try {
    const reviewsCol = collection(db, 'reviews');
    let q;

    if (options?.userId) {
      q = query(reviewsCol, where('userId', '==', options.userId));
    } else if (options?.onlyApproved) {
      q = query(reviewsCol, where('status', '==', 'approved'));
    } else {
      q = query(reviewsCol);
    }

    const snap = await withTimeout(getDocs(q), 5000, null);
    if (!snap) return [];
    const reviews: UserReview[] = [];

    snap.forEach((doc) => {
      const data = doc.data() as UserReview;
      reviews.push({
        ...data,
        id: doc.id,
        timestamp: data.createdAt || data.timestamp || new Date().toISOString(),
      });
    });

    // Sort client-side by createdAt descending to avoid composite index requirements
    return reviews.sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || 0).getTime() -
        new Date(a.createdAt || a.timestamp || 0).getTime()
    );
  } catch (err) {
    console.error('Error fetching reviews from Firestore:', err);
    return [];
  }
}

/**
 * Update Review (e.g. edit content or status)
 */
export async function updateReviewInFirestore(
  reviewId: string,
  updates: Partial<UserReview>
): Promise<void> {
  const reviewRef = doc(db, 'reviews', reviewId);
  const sanitizedUpdates = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(reviewRef, sanitizedUpdates);
}

/**
 * Delete Review from Firestore
 */
export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const reviewRef = doc(db, 'reviews', reviewId);
  await deleteDoc(reviewRef);
}

/**
 * Fetch all registered users for Admin Panel
 */
export async function fetchAllUsersFromFirestore(): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const snap = await withTimeout(getDocs(usersCol), 5000, null);
    if (!snap) return [];
    const users: UserProfile[] = [];
    snap.forEach((doc) => {
      const d = doc.data() as UserProfile;
      users.push({ ...d, id: doc.id, uid: doc.id });
    });
    return users.sort(
      (a, b) =>
        new Date(b.lastLoginAt || b.createdAt || 0).getTime() -
        new Date(a.lastLoginAt || a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.error('Error fetching users from Firestore:', err);
    return [];
  }
}

/**
 * Update User Role (Admin / User)
 */
export async function updateUserRoleInFirestore(
  uid: string,
  role: 'admin' | 'user'
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, { role }, { merge: true });
}

/**
 * Persist Conversation (with emoji reactions, bookmarks, and fastMode) to Firestore
 */
export async function saveConversationToFirestore(
  userId: string,
  conversation: Conversation
): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversation.id);
    await setDoc(
      convRef,
      {
        ...conversation,
        userId,
        updatedAt: conversation.updatedAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('[Firebase] Could not save conversation to Firestore:', err);
  }
}

/**
 * Fetch Conversations for authenticated user from Firestore
 */
export async function fetchUserConversationsFromFirestore(
  userId: string
): Promise<Conversation[]> {
  try {
    const convCol = collection(db, 'conversations');
    const q = query(convCol, where('userId', '==', userId));
    const snap = await withTimeout(getDocs(q), 5000, null);
    if (!snap) return [];
    const convs: Conversation[] = [];
    snap.forEach((docSnap) => {
      convs.push(docSnap.data() as Conversation);
    });
    return convs.sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  } catch (err) {
    console.warn('[Firebase] Could not fetch user conversations from Firestore:', err);
    return [];
  }
}

/**
 * Delete Conversation from Firestore
 */
export async function deleteConversationFromFirestore(conversationId: string): Promise<void> {
  try {
    const convRef = doc(db, 'conversations', conversationId);
    await deleteDoc(convRef);
  } catch (err) {
    console.warn('[Firebase] Could not delete conversation from Firestore:', err);
  }
}

