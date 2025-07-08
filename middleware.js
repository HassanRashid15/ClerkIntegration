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
  ],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
