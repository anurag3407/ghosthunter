import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

const LOG_PREFIX = "[PitchDeck:Decks]";

/**
 * GET /api/pitch-deck/decks/[id]
 * Get a single pitch deck
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = `get-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${requestId}] GET deck request started`);
  
  try {
    console.log(`${LOG_PREFIX} [${requestId}] Checking Firebase configuration...`);
    const db = getAdminDb();
    if (!db) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Database not configured`);
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Database available`);

    // Development: Use a dev user ID
    const userId = "dev-user-123";
    console.log(`${LOG_PREFIX} [${requestId}] Using userId: ${userId}`);

    const { id } = await params;
    console.log(`${LOG_PREFIX} [${requestId}] Fetching deck: ${id}`);
    
    const fetchStartTime = Date.now();
    const doc = await db.collection("pitchDecks").doc(id).get();
    const fetchDuration = Date.now() - fetchStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] Firestore fetch completed in ${fetchDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Document exists: ${doc.exists}`);

    if (!doc.exists) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Deck not found: ${id}`);
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const data = doc.data()!;
    console.log(`${LOG_PREFIX} [${requestId}] Deck data retrieved:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - projectName: ${data.projectName}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - slides: ${data.slides?.length || 0}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - status: ${data.status}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - ownerId: ${data.userId}`);

    // Check ownership
    if (data.userId !== userId) {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ Authorization failed: ${data.userId} !== ${userId}`);
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Authorization passed`);

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ GET request completed in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} ----------------------------------------`);

    return NextResponse.json({
      deck: {
        id: doc.id,
        projectName: data.projectName,
        tagline: data.tagline,
        slides: data.slides,
        theme: data.theme,
        status: data.status,
        repoUrl: data.repoUrl,
        repoName: data.repoName,
        createdAt: data.createdAt?.toDate?.()?.toISOString(),
      },
    });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    console.error(`${LOG_PREFIX} [${requestId}] Stack:`, error instanceof Error ? error.stack : "No stack");
    console.log(`${LOG_PREFIX} ----------------------------------------`);
    
    return NextResponse.json(
      { error: "Failed to fetch deck" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pitch-deck/decks/[id]
 * Update a pitch deck
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = `patch-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${requestId}] PATCH deck request started`);
  
  try {
    console.log(`${LOG_PREFIX} [${requestId}] Checking Firebase configuration...`);
    const db = getAdminDb();
    if (!db) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Database not configured`);
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Database available`);

    const userId = "dev-user-123";
    console.log(`${LOG_PREFIX} [${requestId}] Using userId: ${userId}`);

    const { id } = await params;
    console.log(`${LOG_PREFIX} [${requestId}] Updating deck: ${id}`);
    
    console.log(`${LOG_PREFIX} [${requestId}] Parsing request body...`);
    const body = await request.json();
    console.log(`${LOG_PREFIX} [${requestId}] Update payload:`);
    console.log(`${LOG_PREFIX} [${requestId}]   - projectName: ${body.projectName ? "updating" : "unchanged"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - tagline: ${body.tagline ? "updating" : "unchanged"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - slides: ${body.slides ? `updating (${body.slides.length} slides)` : "unchanged"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - theme: ${body.theme ? "updating" : "unchanged"}`);
    console.log(`${LOG_PREFIX} [${requestId}]   - status: ${body.status ? `updating to "${body.status}"` : "unchanged"}`);

    const docRef = db.collection("pitchDecks").doc(id);
    
    console.log(`${LOG_PREFIX} [${requestId}] Fetching existing deck for authorization check...`);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Deck not found: ${id}`);
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const data = doc.data()!;

    if (data.userId !== userId) {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ Authorization failed`);
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Authorization passed`);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.projectName) updateData.projectName = body.projectName;
    if (body.tagline) updateData.tagline = body.tagline;
    if (body.slides) updateData.slides = body.slides;
    if (body.theme) updateData.theme = body.theme;
    if (body.status) updateData.status = body.status;

    console.log(`${LOG_PREFIX} [${requestId}] Applying update to Firestore...`);
    const updateStartTime = Date.now();
    await docRef.update(updateData);
    const updateDuration = Date.now() - updateStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Update completed in ${updateDuration}ms`);
    console.log(`${LOG_PREFIX} [${requestId}] Fields updated: ${Object.keys(updateData).join(", ")}`);

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ PATCH request completed in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} ----------------------------------------`);

    return NextResponse.json({ success: true });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    console.error(`${LOG_PREFIX} [${requestId}] Stack:`, error instanceof Error ? error.stack : "No stack");
    console.log(`${LOG_PREFIX} ----------------------------------------`);
    
    return NextResponse.json(
      { error: "Failed to update deck" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pitch-deck/decks/[id]
 * Delete a pitch deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = `delete-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  console.log(`${LOG_PREFIX} ----------------------------------------`);
  console.log(`${LOG_PREFIX} [${requestId}] DELETE deck request started`);
  
  try {
    console.log(`${LOG_PREFIX} [${requestId}] Checking Firebase configuration...`);
    const db = getAdminDb();
    if (!db) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Database not configured`);
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Database available`);

    const userId = "dev-user-123";
    console.log(`${LOG_PREFIX} [${requestId}] Using userId: ${userId}`);

    const { id } = await params;
    console.log(`${LOG_PREFIX} [${requestId}] Deleting deck: ${id}`);
    
    const docRef = db.collection("pitchDecks").doc(id);
    
    console.log(`${LOG_PREFIX} [${requestId}] Fetching deck for authorization check...`);
    const doc = await docRef.get();

    if (!doc.exists) {
      console.error(`${LOG_PREFIX} [${requestId}] ❌ Deck not found: ${id}`);
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const data = doc.data()!;
    console.log(`${LOG_PREFIX} [${requestId}] Deck to delete: "${data.projectName}"`);

    if (data.userId !== userId) {
      console.warn(`${LOG_PREFIX} [${requestId}] ⚠ Authorization failed`);
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Authorization passed`);

    console.log(`${LOG_PREFIX} [${requestId}] Deleting from Firestore...`);
    const deleteStartTime = Date.now();
    await docRef.delete();
    const deleteDuration = Date.now() - deleteStartTime;
    
    console.log(`${LOG_PREFIX} [${requestId}] ✓ Delete completed in ${deleteDuration}ms`);

    const totalDuration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} [${requestId}] ✓ DELETE request completed in ${totalDuration}ms`);
    console.log(`${LOG_PREFIX} ----------------------------------------`);

    return NextResponse.json({ success: true });
  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} [${requestId}] ❌ Error after ${totalDuration}ms:`, error);
    console.error(`${LOG_PREFIX} [${requestId}] Stack:`, error instanceof Error ? error.stack : "No stack");
    console.log(`${LOG_PREFIX} ----------------------------------------`);
    
    return NextResponse.json(
      { error: "Failed to delete deck" },
      { status: 500 }
    );
  }
}
