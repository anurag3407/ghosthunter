import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserConversations,
  getConnectionConversations,
  createConversation,
  deleteConversation,
  userOwnsConversation,
} from "@/lib/agents/database/conversations";

/**
 * GET /api/database/conversations
 * Get all conversations for the user or for a specific connection
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get("connectionId");

    let conversations;
    if (connectionId) {
      conversations = await getConnectionConversations(userId, connectionId);
    } else {
      conversations = await getUserConversations(userId);
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/database/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { connectionId, title } = body;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId is required" },
        { status: 400 }
      );
    }

    const conversationId = await createConversation(
      userId,
      connectionId,
      title || "New Conversation"
    );

    return NextResponse.json({ conversationId });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/database/conversations?id=xxx
 * Delete a conversation
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversation id is required" },
        { status: 400 }
      );
    }

    // Check ownership
    const isOwner = await userOwnsConversation(userId, conversationId);
    if (!isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await deleteConversation(conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
