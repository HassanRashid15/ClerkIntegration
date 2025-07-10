import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get the session token from the request
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Revoke the specific session
      await clerkClient.sessions.revokeSession(sessionId);
    }

    // Clear all cookies and redirect to sign-in
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear all Clerk-related cookies
    response.cookies.delete("__session");
    response.cookies.delete("__client_uat");
    response.cookies.delete("__clerk_db_jwt");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Redirect to sign-in page
  return NextResponse.redirect(
    new URL(
      "/sign-in",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    )
  );
}
