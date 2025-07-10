import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirect_url") || "/dashboard";

    console.log("OAuth callback received:", {
      url: request.url,
      redirectUrl: redirectUrl,
      searchParams: Object.fromEntries(searchParams.entries()),
    });

    // Redirect to the dashboard or the specified redirect URL
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    // Fallback to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
