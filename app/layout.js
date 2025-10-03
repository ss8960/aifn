import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AIFN",
  description: "Saving your Saving",
};

export const dynamic = "force-dynamic";

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'DATABASE_URL'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

export default function RootLayout({ children }) {
  // Show environment setup message if variables are missing
  if (missingEnvVars.length > 0) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <h1 className="text-lg font-medium text-gray-900">Environment Setup Required</h1>
                <p className="mt-2 text-sm text-gray-500">
                  The following environment variables are missing:
                </p>
                <ul className="mt-2 text-sm text-red-600 text-left">
                  {missingEnvVars.map(envVar => (
                    <li key={envVar}>• {envVar}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500">
                  Please configure these in your Vercel dashboard under Settings → Environment Variables
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
    >
      <html lang="en">
        <body className={inter.className}>
          <Header />
          <main className="min-h-screen pt-24">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-100 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Saving your Saving</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}