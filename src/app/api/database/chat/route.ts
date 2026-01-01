import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  addMessage,
  getConversationMessages,
  userOwnsConversation,
  updateConversationTitle,
} from "@/lib/agents/database/conversations";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

/**
 * GET /api/database/chat?conversationId=xxx
 * Get all messages for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const isOwner = await userOwnsConversation(userId, conversationId);
    if (!isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const messages = await getConversationMessages(conversationId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/database/chat
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, connectionId, message } = body;

    if (!conversationId || !connectionId || !message) {
      return NextResponse.json(
        { error: "conversationId, connectionId, and message are required" },
        { status: 400 }
      );
    }

    // Check ownership
    const isOwner = await userOwnsConversation(userId, conversationId);
    if (!isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const adminDb = getAdminDb();
    if (!adminDb) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Get connection details
    const connectionDoc = await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .get();

    if (!connectionDoc.exists) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    const connection = connectionDoc.data()!;

    // Add user message
    await addMessage(conversationId, "user", message);

    // Get previous messages for context
    const previousMessages = await getConversationMessages(conversationId);

    // Build context for AI
    const systemPrompt = `You are a helpful database assistant. The user is connected to a ${connection.type} database named "${connection.database}".

Your job is to:
1. Understand the user's natural language query
2. Generate the appropriate SQL/Query for their database type
3. Explain what the query does

Database type: ${connection.type}
Database name: ${connection.database}

When responding:
- Always provide the generated query in a code block
- Explain what the query does
- If you're unsure about the schema, ask clarifying questions

Previous conversation context:
${previousMessages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}`;

    // Call AI
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      apiKey: process.env.GOOGLE_AI_API_KEY,
      temperature: 0.3,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ]);

    const assistantMessage = response.content as string;

    // Extract SQL query if present
    const queryMatch = assistantMessage.match(/```(?:sql|javascript|js)?\n?([\s\S]*?)```/);
    const generatedQuery = queryMatch ? queryMatch[1].trim() : undefined;

    // Add assistant message
    await addMessage(conversationId, "assistant", assistantMessage, generatedQuery);

    // Update conversation title if it's the first message
    if (previousMessages.length <= 1) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      await updateConversationTitle(conversationId, title);
    }

    return NextResponse.json({
      message: assistantMessage,
      query: generatedQuery,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
