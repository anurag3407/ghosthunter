import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/admin";

/**
 * GET /api/admin/check
 * Returns whether the current authenticated user has administrative privileges.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    return NextResponse.json({
      isAdmin: isAdminEmail(userEmail),
    });
  } catch (error) {
    console.error("[AdminCheck] Error verifying admin access:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
