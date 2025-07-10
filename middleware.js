import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/profile",
    "/custom-profile",
    "/register",
    "/sign-up",
    "/sign-in",
    "/test-signup",
    "/test-forms",
    "/debug",
    "/forgot-password",
    "/api/logout",
    "/api/oauth-callback",
  ],
  // Force authentication check in development
  ...(process.env.NODE_ENV === "development" && {
    beforeAuth: (req) => {
      // In development, we can add additional logging or checks
      console.log("Development mode: Checking authentication for", req.url);
    },
  }),
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
