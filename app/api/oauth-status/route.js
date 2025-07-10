import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Get OAuth configuration from Clerk
    const oauthConfig = await clerkClient.oauthConnections.list();

    // Check for specific Google OAuth issues
    const googleOAuth = oauthConfig.find(
      (provider) => provider.provider === "oauth_google"
    );
    const githubOAuth = oauthConfig.find(
      (provider) => provider.provider === "oauth_github"
    );

    const googleStatus = googleOAuth
      ? {
          enabled: googleOAuth.enabled,
          configured: !!googleOAuth.clientId,
          hasClientSecret: !!googleOAuth.clientSecret,
          redirectUrl: googleOAuth.redirectUrl,
          scopes: googleOAuth.scopes,
          issues: [],
        }
      : {
          enabled: false,
          configured: false,
          issues: ["Google OAuth provider not found"],
        };

    const githubStatus = githubOAuth
      ? {
          enabled: githubOAuth.enabled,
          configured: !!githubOAuth.clientId,
          hasClientSecret: !!githubOAuth.clientSecret,
          redirectUrl: githubOAuth.redirectUrl,
          scopes: githubOAuth.scopes,
          issues: [],
        }
      : {
          enabled: false,
          configured: false,
          issues: ["GitHub OAuth provider not found"],
        };

    // Check for common Google OAuth issues
    if (googleOAuth) {
      if (!googleOAuth.enabled) {
        googleStatus.issues.push(
          "Google OAuth is not enabled in Clerk Dashboard"
        );
      }
      if (!googleOAuth.clientId) {
        googleStatus.issues.push("Google Client ID is not configured");
      }
      if (!googleOAuth.clientSecret) {
        googleStatus.issues.push("Google Client Secret is not configured");
      }
      if (!googleOAuth.redirectUrl) {
        googleStatus.issues.push("Google redirect URL is not configured");
      }
    }

    // Check for common GitHub OAuth issues
    if (githubOAuth) {
      if (!githubOAuth.enabled) {
        githubStatus.issues.push(
          "GitHub OAuth is not enabled in Clerk Dashboard"
        );
      }
      if (!githubOAuth.clientId) {
        githubStatus.issues.push("GitHub Client ID is not configured");
      }
      if (!githubOAuth.clientSecret) {
        githubStatus.issues.push("GitHub Client Secret is not configured");
      }
      if (!githubOAuth.redirectUrl) {
        githubStatus.issues.push("GitHub redirect URL is not configured");
      }
    }

    return Response.json({
      status: "success",
      googleOAuth: googleStatus,
      githubOAuth: githubStatus,
      allProviders: oauthConfig.map((provider) => ({
        id: provider.id,
        provider: provider.provider,
        enabled: provider.enabled,
        configured: !!provider.clientId,
      })),
      message: "OAuth configuration retrieved successfully",
      setupInstructions: {
        google: [
          "1. Go to Clerk Dashboard → User & Authentication → Social Connections",
          "2. Enable Google provider",
          "3. Create Google OAuth 2.0 Client ID in Google Cloud Console",
          "4. Add your domain to authorized origins",
          "5. Copy Client ID and Client Secret to Clerk",
          "6. Set redirect URL: https://your-domain.clerk.accounts.dev/oauth/callback",
        ],
        github: [
          "1. Go to Clerk Dashboard → User & Authentication → Social Connections",
          "2. Enable GitHub provider",
          "3. Create GitHub OAuth App in GitHub Settings",
          "4. Set Authorization callback URL: https://your-domain.clerk.accounts.dev/oauth/callback",
          "5. Copy Client ID and Client Secret to Clerk",
          "6. Configure required scopes (email, profile)",
        ],
      },
    });
  } catch (error) {
    console.error("Error checking OAuth status:", error);
    return Response.json(
      {
        status: "error",
        message: "Failed to check OAuth configuration",
        error: error.message,
        setupInstructions: {
          google: [
            "1. Go to Clerk Dashboard → User & Authentication → Social Connections",
            "2. Enable Google provider",
            "3. Create Google OAuth 2.0 Client ID in Google Cloud Console",
            "4. Add your domain to authorized origins",
            "5. Copy Client ID and Client Secret to Clerk",
            "6. Set redirect URL: https://your-domain.clerk.accounts.dev/oauth/callback",
          ],
          github: [
            "1. Go to Clerk Dashboard → User & Authentication → Social Connections",
            "2. Enable GitHub provider",
            "3. Create GitHub OAuth App in GitHub Settings",
            "4. Set Authorization callback URL: https://your-domain.clerk.accounts.dev/oauth/callback",
            "5. Copy Client ID and Client Secret to Clerk",
            "6. Configure required scopes (email, profile)",
          ],
        },
      },
      { status: 500 }
    );
  }
}
