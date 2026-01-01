import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Conversation and Message types
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  query?: string | null;
  results?: Record<string, unknown>[] | null;
  error?: string | null;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  connectionId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTIONS = {
  CONVERSATIONS: "db_conversations",
  MESSAGES: "messages",
};

/**
 * Get Firestore database or throw error
 */
function getDb() {
  const db = getAdminDb();
  if (!db) {
    throw new Error("Firebase not configured");
  }
  return db;
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  connectionId: string,
  title: string = "New Conversation"
): Promise<string> {
  const conversationData = {
    userId,
    connectionId,
    title,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await getDb().collection(COLLECTIONS.CONVERSATIONS).add(conversationData);
  return docRef.id;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const snapshot = await getDb()
    .collection(COLLECTIONS.CONVERSATIONS)
    .where("userId", "==", userId)
    .get();

  const conversations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as Conversation[];
  
  // Sort in memory to avoid composite index
  return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Get conversations for a specific connection
 */
export async function getConnectionConversations(
  userId: string,
  connectionId: string
): Promise<Conversation[]> {
  const snapshot = await getDb()
    .collection(COLLECTIONS.CONVERSATIONS)
    .where("userId", "==", userId)
    .where("connectionId", "==", connectionId)
    .get();

  const conversations = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
  })) as Conversation[];
  
  return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Get a single conversation
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const doc = await getDb().collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).get();
  
  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    id: doc.id,
    userId: data.userId,
    connectionId: data.connectionId,
    title: data.title,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  await getDb().collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).update({
    title,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  query?: string,
  results?: Record<string, unknown>[],
  error?: string
): Promise<string> {
  const messageData = {
    role,
    content,
    query: query || null,
    results: results || null,
    error: error || null,
    timestamp: FieldValue.serverTimestamp(),
  };

  // Add message to subcollection
  const msgRef = await getDb()
    .collection(COLLECTIONS.CONVERSATIONS)
    .doc(conversationId)
    .collection(COLLECTIONS.MESSAGES)
    .add(messageData);

  // Update conversation's updatedAt
  await getDb().collection(COLLECTIONS.CONVERSATIONS).doc(conversationId).update({
    updatedAt: FieldValue.serverTimestamp(),
  });

  return msgRef.id;
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const snapshot = await getDb()
    .collection(COLLECTIONS.CONVERSATIONS)
    .doc(conversationId)
    .collection(COLLECTIONS.MESSAGES)
    .orderBy("timestamp", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp?.toDate?.() || new Date(),
  })) as Message[];
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  // Get all messages
  const messages = await getDb()
    .collection(COLLECTIONS.CONVERSATIONS)
    .doc(conversationId)
    .collection(COLLECTIONS.MESSAGES)
    .get();

  const batch = getDb().batch();
  
  // Delete all messages
  for (const msg of messages.docs) {
    batch.delete(msg.ref);
  }
  
  // Delete the conversation
  batch.delete(getDb().collection(COLLECTIONS.CONVERSATIONS).doc(conversationId));

  await batch.commit();
}

/**
 * Check if user owns a conversation
 */
export async function userOwnsConversation(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const conversation = await getConversation(conversationId);
  return conversation?.userId === userId;
}
