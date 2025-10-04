import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import EnvChecker from "@/components/env-checker";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AIFN",
  description: "Saving your Saving",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder"}
          signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in"}
          signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up"}
        >
          <EnvChecker>
            <Header />
            <main className="min-h-screen pt-24">{children}</main>
            <Toaster richColors />
            <footer className="bg-blue-100 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>Saving your Saving</p>
              </div>
            </footer>
          </EnvChecker>
        </ClerkProvider>
      </body>
    </html>
  );
}