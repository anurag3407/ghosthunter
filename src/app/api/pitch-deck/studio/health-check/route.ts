/**
 * ============================================================================
 * PITCH DECK STUDIO - HEALTH CHECK API
 * ============================================================================
 * AI-powered deck analysis and scoring.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { checkDeckHealth } from "@/lib/pitch-deck/ai-generator";
import type { Deck, DeckHealthCheck } from "@/types/pitch-deck";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { deckId } = body as { deckId: string };
    
    if (!deckId) {
      return NextResponse.json(
        { error: "Deck ID is required" },
        { status: 400 }
      );
    }
    
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    
    // Fetch deck
    const deckDoc = await db.collection("pitch-decks").doc(deckId).get();
    if (!deckDoc.exists) {
      return NextResponse.json(
        { error: "Deck not found" },
        { status: 404 }
      );
    }
    
    const deck = deckDoc.data() as Deck;
    
    // Verify ownership
    if (deck.userId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Helper to remove undefined values
    function removeUndefined<T>(obj: T): T {
      if (obj === null || obj === undefined) {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map(item => removeUndefined(item)) as unknown as T;
      }
      if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          if (value !== undefined) {
            result[key] = removeUndefined(value);
          }
        }
        return result as T;
      }
      return obj;
    }
    
    // Check for required API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { 
          error: "AI API not configured",
          details: "GOOGLE_AI_API_KEY environment variable is not set"
        },
        { status: 503 }
      );
    }

    // Run health check
    const healthCheck = await checkDeckHealth(deck);
    
    // Save health check result
    const checkData = removeUndefined({
      deckId,
      userId,
      ...healthCheck,
      checkedAt: new Date().toISOString(),
    });
    
    await db.collection("pitch-deck-health-checks").add(checkData);
    
    return NextResponse.json(healthCheck);
    
  } catch (error) {
    console.error("Health check error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to run health check",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
