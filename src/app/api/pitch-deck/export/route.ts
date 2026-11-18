/**
 * ============================================================================
 * PITCH DECK STUDIO - EXPORT API
 * ============================================================================
 * Export pitch decks to PDF, PPTX, or PNG formats.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Deck } from "@/types/pitch-deck";

// Note: Actual PDF/PPTX generation would require server-side libraries
// like puppeteer for PDF or pptxgenjs for PPTX
// This is a placeholder that would be implemented with those libraries

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { deckId, format } = body as { 
      deckId: string; 
      format: "pdf" | "pptx" | "png" 
    };
    
    if (!deckId || !format) {
      return NextResponse.json(
        { error: "Deck ID and format are required" },
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
    
    // Fetch deck (try standard collection first, then legacy)
    let deckDoc = await db.collection("pitch-decks").doc(deckId).get();
    
    if (!deckDoc.exists) {
      // Try legacy collection name
      deckDoc = await db.collection("pitchDecks").doc(deckId).get();
      
      if (!deckDoc.exists) {
        return NextResponse.json(
          { error: "Deck not found" },
          { status: 404 }
        );
      }
    }
    
    const deck = deckDoc.data() as Deck;
    
    // Verify ownership
    if (deck.userId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Generate export based on format
    switch (format) {
      case "pdf":
      case "pptx":
      case "png":
        return NextResponse.json({
          success: true,
          deck,
          message: "Client-side export active. Use studio canvas exporter for instant rendering.",
        });
        
      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to export deck",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
