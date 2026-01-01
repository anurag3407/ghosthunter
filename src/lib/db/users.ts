/**
 * ============================================================================
 * USER DATABASE OPERATIONS
 * ============================================================================
 * CRUD operations for user documents in Firestore
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { getDb } from '../firebase/client';
import { User, UserSettings, UserPlan } from '@/types';

const COLLECTION = 'users';

/**
 * Default user settings
 */
export const defaultUserSettings: UserSettings = {
  theme: 'dark',
  emailNotifications: true,
  defaultAgent: undefined,
};

/**
 * Get a user by their Clerk ID
 */
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = getDb();
  const usersRef = collection(db, COLLECTION);
  const q = query(usersRef, where('clerkId', '==', clerkId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

/**
 * Get a user by their document ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return { id: snapshot.id, ...snapshot.data() } as User;
}

/**
 * Create a new user
 */
export async function createUser(data: {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}): Promise<User> {
  const db = getDb();
  const docRef = doc(collection(db, COLLECTION));
  
  const now = Timestamp.now();
  const user: Omit<User, 'id'> = {
    clerkId: data.clerkId,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
    plan: 'free' as UserPlan,
    githubConnected: false,
    createdAt: now,
    updatedAt: now,
    settings: defaultUserSettings,
  };
  
  await setDoc(docRef, user);
  
  return { id: docRef.id, ...user };
}

/**
 * Update a user's profile
 */
export async function updateUser(
  userId: string, 
  data: Partial<Omit<User, 'id' | 'clerkId' | 'createdAt'>>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update a user's settings
 */
export async function updateUserSettings(
  userId: string, 
  settings: Partial<UserSettings>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  const userDoc = await getDoc(docRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const currentSettings = userDoc.data().settings || defaultUserSettings;
  
  await updateDoc(docRef, {
    settings: { ...currentSettings, ...settings },
    updatedAt: Timestamp.now(),
  });
}

/**
 * Connect GitHub to a user's account
 */
export async function connectGitHub(
  userId: string,
  githubUsername: string,
  githubAccessToken: string
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  
  await updateDoc(docRef, {
    githubConnected: true,
    githubUsername,
    githubAccessToken,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Disconnect GitHub from a user's account
 */
export async function disconnectGitHub(userId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  
  await updateDoc(docRef, {
    githubConnected: false,
    githubUsername: null,
    githubAccessToken: null,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Update a user's wallet address
 */
export async function updateWalletAddress(
  userId: string, 
  walletAddress: string
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION, userId);
  
  await updateDoc(docRef, {
    walletAddress,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Sync user from Clerk webhook
 */
export async function syncUserFromClerk(clerkUser: {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}): Promise<User> {
  const existingUser = await getUserByClerkId(clerkUser.id);
  
  const name = [clerkUser.first_name, clerkUser.last_name]
    .filter(Boolean)
    .join(' ') || 'User';
  
  if (existingUser) {
    await updateUser(existingUser.id, {
      email: clerkUser.email_addresses[0]?.email_address || existingUser.email,
      name,
      avatarUrl: clerkUser.image_url || existingUser.avatarUrl,
    });
    return { ...existingUser, name, avatarUrl: clerkUser.image_url || existingUser.avatarUrl };
  }
  
  return createUser({
    clerkId: clerkUser.id,
    email: clerkUser.email_addresses[0]?.email_address || '',
    name,
    avatarUrl: clerkUser.image_url || undefined,
  });
}
