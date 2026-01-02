import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  addMessage,
  getConversationMessages,
  userOwnsConversation,
  updateConversationTitle,
} from "@/lib/agents/database/conversations";
import { generateQueryResponse, type HistoryItem } from "@/lib/agents/database/agent";
import { decrypt } from "@/lib/agents/database/encryption";
import { executeQuery, formatQueryResults } from "@/lib/agents/database/query-executor";

/**
 * ============================================================================
 * DATABASE AGENT - CHAT ENDPOINT (ENHANCED)
 * ============================================================================
 * Uses the Universal Agent Engine with encrypted connection strings.
 */

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
 * Send a message and get AI response with query generation
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

    // Verify user owns this connection
    if (connection.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Add user message
    await addMessage(conversationId, "user", message);

    // Get previous messages for context
    const previousMessages = await getConversationMessages(conversationId);
    
    // Convert to HistoryItem format for agent
    const history: HistoryItem[] = previousMessages.slice(-5).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Decrypt connection string
    let connectionString: string;
    
    if (connection.encryptedUri) {
      // New format: encrypted connection string
      connectionString = decrypt(connection.encryptedUri);
    } else if (connection.encryptedCredentials) {
      // Legacy format: encrypted credentials object - build connection string
      const creds = JSON.parse(decrypt(connection.encryptedCredentials));
      if (connection.type === "mongodb") {
        connectionString = `mongodb://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
      } else {
        connectionString = `postgresql://${creds.username}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${creds.database}`;
      }
    } else {
      return NextResponse.json(
        { error: "Connection credentials not found" },
        { status: 400 }
      );
    }

    // Generate query using Universal Agent
    const agentResponse = await generateQueryResponse(message, connectionString, history);

    // Format response message
    let assistantMessage: string;
    let queryResults: Record<string, unknown>[] | null = null;
    
    if (agentResponse.type === "blocked") {
      assistantMessage = `⚠️ **Safety Block**\n\n${agentResponse.content}`;
      if (agentResponse.warnings?.length) {
        assistantMessage += `\n\n**Reason:** ${agentResponse.warnings.join(", ")}`;
      }
    } else if (agentResponse.type === "error") {
      assistantMessage = `❌ **Error**\n\n${agentResponse.content}`;
    } else if (agentResponse.type === "clarification") {
      assistantMessage = agentResponse.content;
    } else {
      // Query type - generate AND execute the query
      assistantMessage = agentResponse.explanation || agentResponse.content;
      
      if (agentResponse.query) {
        const queryLang = connection.type === "mongodb" ? "json" : "sql";
        assistantMessage += `\n\n**Generated Query:**\n\`\`\`${queryLang}\n${agentResponse.query}\n\`\`\``;
        
        // Execute the query
        try {
          const result = await executeQuery(connectionString, agentResponse.query);
          queryResults = result.data;
          
          // Add execution results to message
          assistantMessage += `\n\n${formatQueryResults(result)}`;
        } catch (execError) {
          assistantMessage += `\n\n❌ **Execution Error**: ${execError instanceof Error ? execError.message : "Failed to execute query"}`;
        }
      }
      
      if (agentResponse.assumptions?.length) {
        assistantMessage += `\n\n**Assumptions:**\n${agentResponse.assumptions.map(a => `- ${a}`).join("\n")}`;
      }
      
      if (agentResponse.warnings?.length) {
        assistantMessage += `\n\n**⚠️ Warnings:**\n${agentResponse.warnings.map(w => `- ${w}`).join("\n")}`;
      }
    }

    // Add assistant message to conversation
    await addMessage(conversationId, "assistant", assistantMessage, agentResponse.query || undefined);

    // Update conversation title if it's the first message
    if (previousMessages.length <= 1) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
      await updateConversationTitle(conversationId, title);
    }

    // Update connection last used
    await adminDb
      .collection("database_connections")
      .doc(connectionId)
      .update({ lastUsedAt: new Date() });

    return NextResponse.json({
      message: assistantMessage,
      query: agentResponse.query,
      results: queryResults,
      type: agentResponse.type,
      warnings: agentResponse.warnings,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process message" },
      { status: 500 }
    );
  }
}

