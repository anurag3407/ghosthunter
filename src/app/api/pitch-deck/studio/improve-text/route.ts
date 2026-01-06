/**
 * ============================================================================
 * PITCH DECK STUDIO - IMPROVE TEXT API
 * ============================================================================
 * AI-powered text improvement for slide content.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { improveText } from "@/lib/pitch-deck/ai-generator";
import type { SlideType, GenerationTone, ContentTone } from "@/types/pitch-deck";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { text, action, slideType, tone, projectName, tagline } = body as {
      text: string;
      action: "punchier" | "formal" | "shorter" | "longer" | "simplify" | "elaborate";
      slideType?: SlideType;
      tone?: GenerationTone;
      projectName?: string;
      tagline?: string;
    };
    
    if (!text || !action) {
      return NextResponse.json(
        { error: "Text and action are required" },
        { status: 400 }
      );
    }
    
    const deckContext = projectName && tagline ? {
      projectName,
      tagline,
      tone: (tone || "concise") as ContentTone,
    } : undefined;
    
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

    const improvedText = await improveText(
      text, 
      slideType || "custom", 
      action,
      deckContext
    );
    
    return NextResponse.json({
      success: true,
      originalText: text,
      improvedText,
      action,
    });
    
  } catch (error) {
    console.error("Text improvement error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to improve text",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
