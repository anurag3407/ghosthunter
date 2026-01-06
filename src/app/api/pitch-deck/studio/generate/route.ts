/**
 * ============================================================================
 * PITCH DECK STUDIO - GENERATE API
 * ============================================================================
 * Generates a complete pitch deck from startup profile using AI.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generateDeckFromSources } from "@/lib/pitch-deck/ai-generator";
import type { Deck, StartupProfile, GenerateDeckRequest } from "@/types/pitch-deck";

/**
 * Recursively remove undefined values from an object
 * This prevents Firestore errors when saving documents
 */
function removeUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefined(item)) as T;
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

// Fetch GitHub README if URL provided
async function fetchGitHubReadme(url: string): Promise<string | null> {
  try {
    // Extract owner/repo from URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    
    const response = await fetch(rawUrl);
    if (!response.ok) {
      // Try master branch
      const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
      const masterResponse = await fetch(masterUrl);
      if (!masterResponse.ok) return null;
      return await masterResponse.text();
    }
    
    return await response.text();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const LOG_PREFIX = "[PitchDeck:StudioGenerate]";
  
  try {
    // Check for required API key first
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error(`${LOG_PREFIX} GOOGLE_AI_API_KEY is not configured`);
      return NextResponse.json(
        { 
          error: "AI API not configured",
          details: "GOOGLE_AI_API_KEY environment variable is not set"
        },
        { status: 503 }
      );
    }
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { profile } = body as { profile: Partial<StartupProfile> };
    
    if (!profile.name || !profile.tagline) {
      return NextResponse.json(
        { error: "Name and tagline are required" },
        { status: 400 }
      );
    }
    
    console.log(`${LOG_PREFIX} Generating deck for user ${userId}, startup: ${profile.name}`);
    
    // Fetch README if GitHub URL provided
    let readmeContent: string | undefined;
    if (profile.githubUrl) {
      const readme = await fetchGitHubReadme(profile.githubUrl);
      if (readme) {
        readmeContent = readme;
      }
    }
    
    // Build context from profile
    const contextParts: string[] = [];
    
    if (profile.problemStatement) {
      contextParts.push(`PROBLEM: ${profile.problemStatement}`);
    }
    if (profile.solution) {
      contextParts.push(`SOLUTION: ${profile.solution}`);
    }
    if (profile.valueProps?.length) {
      contextParts.push(`VALUE PROPS:\n${profile.valueProps.map(v => `- ${v}`).join("\n")}`);
    }
    if (profile.marketSize) {
      contextParts.push(`MARKET SIZE:\nTAM: ${profile.marketSize.tam}\nSAM: ${profile.marketSize.sam}\nSOM: ${profile.marketSize.som}`);
    }
    if (profile.traction?.metrics?.length) {
      contextParts.push(`TRACTION:\n${profile.traction.metrics.map(m => `- ${m.label}: ${m.value}`).join("\n")}`);
    }
    if (profile.team?.length) {
      contextParts.push(`TEAM:\n${profile.team.map(m => `- ${m.name} (${m.role})`).join("\n")}`);
    }
    if (profile.fundingAsk) {
      contextParts.push(`FUNDING ASK: ${profile.fundingAsk.amount} (${profile.fundingAsk.stage})`);
    }
    if (profile.additionalContext) {
      contextParts.push(`ADDITIONAL CONTEXT:\n${profile.additionalContext}`);
    }
    
    // Generate with AI
    const generationRequest: GenerateDeckRequest = {
      readme: readmeContent,
      profile: {
        companyName: profile.name || "",
        oneLiner: profile.tagline || "",
        productDescription: contextParts.join("\n\n"),
        targetCustomer: "",
        problemStatement: profile.problemStatement || "",
        solutionDescription: profile.solution || "",
      },
      style: (profile.fundingAsk?.stage as "pre-seed" | "seed" | "series-a" | "series-b") || "seed",
      tone: "investor",
    };
    
    const generatedResult = await generateDeckFromSources(generationRequest);
    
    // Use the deck from the generated result and update with user-specific data
    const deck: Deck = {
      ...generatedResult.deck,
      userId,
      title: generatedResult.deck.projectName || `${profile.name} Pitch Deck`,
      description: profile.tagline || "",
      version: 1,
      branding: {
        logo: profile.logo,
        primaryColor: profile.brandColors?.primary,
        secondaryColor: profile.brandColors?.secondary,
      },
      metadata: {
        slideCount: generatedResult.deck.slides.length,
        generatedAt: new Date().toISOString(),
        sources: {
          hasGithub: !!readmeContent,
          hasProfile: true,
        },
      },
    };
    
    const deckId = deck.id;
    
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    
    // Save to Firestore (remove undefined values to prevent Firestore errors)
    const cleanDeck = removeUndefined(deck);
    await db.collection("pitch-decks").doc(deckId).set(cleanDeck);
    
    // Also save the profile for future reference
    const cleanProfile = removeUndefined({
      ...profile,
      deckId,
      userId,
      createdAt: new Date().toISOString(),
    });
    await db.collection("startup-profiles").doc(deckId).set(cleanProfile);
    
    return NextResponse.json({
      success: true,
      deckId,
      deck,
    });
    
  } catch (error) {
    console.error(`${LOG_PREFIX} Deck generation error:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to generate deck",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
