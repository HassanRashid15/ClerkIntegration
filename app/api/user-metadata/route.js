import { currentUser, clerkClient } from "@clerk/nextjs/server";

export async function POST(req) {
  const user = await currentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  // Example data to add
  const publicMetadata = {
    favoriteColor: "blue",
    onboardingComplete: true,
    role: "tester",
  };
  const privateMetadata = {
    internalNote: "This user is part of the test group.",
    lastAdminAction: new Date().toISOString(),
  };

  // Update user metadata
  await clerkClient.users.updateUserMetadata(user.id, {
    publicMetadata,
    privateMetadata,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
