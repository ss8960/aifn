import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"]});

export const metadata = {
  title: "aifn",
  description: "Control Undercontrol",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={'${inter.className}'}>
          {/*header */}
          <Header />

          <main className="min-h-screen pt-24">{children}</main>
          {/*footer */}
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