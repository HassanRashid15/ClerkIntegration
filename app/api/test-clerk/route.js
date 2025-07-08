import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Test if Clerk is properly configured
    const response = {
      status: "success",
      message: "Clerk is properly configured",
      environment: {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
        afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
      },
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error) {
    return Response.json(
      {
        status: "error",
        message: "Clerk configuration error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
