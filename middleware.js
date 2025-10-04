import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import arcjet, { tokenBucket } from "@arcjet/next";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY;
};

// Check if Arcjet is configured
const isArcjetConfigured = () => {
  return process.env.ARCJET_KEY;
};

// Configure Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY || "ajkey_placeholder",
  rules: [
    tokenBucket({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN",
      match: "/api/",
      refillRate: 10,
      interval: 60,
      capacity: 20,
    }),
  ],
});

// Full middleware with Arcjet and Clerk
export default clerkMiddleware(async (auth, req) => {
  // If Clerk is not configured, allow all requests to pass through
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  try {
    const { userId } = await auth();

    if (!userId && isProtectedRoute(req)) {
      const { redirectToSignIn } = await auth();
      return redirectToSignIn();
    }

    // Apply Arcjet protection for API routes
    if (req.nextUrl.pathname.startsWith('/api/') && isArcjetConfigured()) {
      try {
        const decision = await aj.protect(req, {
          userId: userId || 'anonymous',
          requested: 1,
        });

        if (decision.isDenied()) {
          if (decision.reason.isRateLimit()) {
            return new NextResponse('Too Many Requests', { status: 429 });
          }
          return new NextResponse('Forbidden', { status: 403 });
        }
      } catch (arcjetError) {
        console.error("Arcjet error:", arcjetError);
        // Continue without Arcjet if it fails
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error, allow the request to continue
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};