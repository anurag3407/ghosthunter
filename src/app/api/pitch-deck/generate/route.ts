import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { generatePitchDeck } from "@/lib/agents/pitch-deck/generator";

const LOG_PREFIX = "[PitchDeck:Generate]";

/**
 * POST /api/pitch-deck/generate
 * Generate a new pitch deck from README content
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ========================================`);
  console.log(`${LOG_PREFIX} [${requestId}] New generation request started`);
  console.log(`${LOG_PREFIX} [${requestId}] Timestamp: ${new Date().toISOString()}`);
  
  try {
    // Check for required env vars
    console.log(`${LOG_PREFIX} [${requestId}] Checking environment variables...`);
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ GOOGLE_AI_API_KEY is not set`);
      return NextResponse.json(
        { 
          error: "Google AI API key not configured", 
          details: "Please set GOOGLE_AI_API_KEY in your .env file. Get one at: https://aistudio.google.com/app/apikey" 
        },
        { status: 503 }
      );
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ GOOGLE_AI_API_KEY is configured`);

    // Development: Use a dev user ID
    const userId = "dev-user-123";
    console.log(`${LOG_PREFIX} [${requestId}] Using userId: ${userId}`);

    // Parse request body
    console.log(`${LOG_PREFIX} [${requestId}] Parsing request body...`);
    const body = await request.json();
    const { readme, instructions, repoUrl, repoName, repoOwner } = body;

    console.log(`${LOG_PREFIX} [${requestId}] Request payload:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - repoName: ${repoName || "(not provided)"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - repoOwner: ${repoOwner || "(not provided)"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - repoUrl: ${repoUrl || "(not provided)"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - README length: ${readme?.length || 0} characters`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Additional instructions: ${instructions ? "provided" : "none"}`);

    if (!readme) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ README content is missing`);
      return NextResponse.json(
        { error: "README content is required" },
        { status: 400 }
      );
    }

    // Log README preview (first 200 chars)
    console.log(`${LOG_PREFIX} [${requestId}] README preview: "${readme.substring(0, 200)}..."`);

    // Generate pitch deck using AI
    console.log(`${LOG_PREFIX} [${requestId}] Starting AI generation...`);
    const aiStartTime = Date.now();
    
    const generatedDeck = await generatePitchDeck(readme, instructions);
    
    const aiDuration = Date.now() - aiStartTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ AI generation completed in ${aiDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Generated deck:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - projectName: ${generatedDeck.projectName}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - tagline: ${generatedDeck.tagline}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - slides count: ${generatedDeck.slides.length}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - slide types: ${generatedDeck.slides.map(s => s.type).join(", ")}`);

    // Get Firestore instance
    console.log(`${LOG_PREFIX} [${requestId}] Checking Firebase configuration...`);
    const db = getAdminDb();
    
    if (!db) {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ Firebase not configured - returning temp deck`);
      const tempId = `temp-${Date.now()}`;
      const totalDuration = Date.now() - startTime;
      console.log(`${LOG_PREFIX} [${requestId}] ✓ Request completed in ${totalDuration}ms (no save)`);
      console.log(`${LOG_PREFIX} ========================================`);
      
      return NextResponse.json({
        deckId: tempId,
        deck: {
          id: tempId,
          projectName: generatedDeck.projectName,
          tagline: generatedDeck.tagline,
          slides: generatedDeck.slides,
          theme: {
            primaryColor: "#3B82F6",
            secondaryColor: "#8B5CF6",
            fontFamily: "Inter",
          },
          status: "draft",
        },
        warning: "Firebase not configured - deck not saved to database",
      });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Firebase is configured`);

    // Save to Firestore
    console.log(`${LOG_PREFIX} [${requestId}] Saving deck to Firestore...`);
    const saveStartTime = Date.now();
    
    const deckRef = db.collection("pitchDecks").doc();
    const deck = {
      id: deckRef.id,
      userId,
      projectName: generatedDeck.projectName,
      tagline: generatedDeck.tagline,
      repoUrl: repoUrl || null,
      repoName: repoName || null,
      repoOwner: repoOwner || null,
      slides: generatedDeck.slides,
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#8B5CF6",
        fontFamily: "Inter",
      },
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await deckRef.set(deck);
    
    const saveDuration = Date.now() - saveStartTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Deck saved to Firestore in ${saveDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Deck ID: ${deck.id}`);

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Request completed successfully in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Timing breakdown:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - AI generation: ${aiDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Firestore save: ${saveDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}]   - Other: ${totalDuration - aiDuration - saveDuration}ms`);
    console.log(`${LOG_PREFIX} ========================================`);

    return NextResponse.json({
      deckId: deck.id,
      deck: {
        id: deck.id,
        projectName: deck.projectName,
        tagline: deck.tagline,
        slides: deck.slides,
        theme: deck.theme,
        status: deck.status,
      },
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    console.error(`${LOG_PREFIX} [${requestId}] Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
    console.log(`${LOG_PREFIX} ========================================`);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { 
        error: "Failed to generate pitch deck", 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
