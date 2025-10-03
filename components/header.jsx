import { SignedOut, SignedIn, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";

const Header = () => {
    return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <nav className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link href="/">
                <Image 
                    src={"/aifnlogo.png"} 
                    alt="aifn logo" 
                    width={200} 
                    height={60} 
                    className="h-20 w-auto object-contain"
                />
            </Link>

            <div className="flex items-center space-x-4">
                <SignedIn> 
                    <Link href={"/dashboard"} 
                        className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                        <Button variant="outline">
                            <LayoutDashboard size={18} />
                            <span className="inline">Dashboard</span>
                        </Button>
                    </Link>

                    <Link href={"/transaction/create"}>
                        <Button variant="outline" className="flex items-center gap-2 text-gray-600">
                            <PenBox size={18} />
                            <span className="inline">Add Transaction</span>
                        </Button>
                    </Link>
                </SignedIn>
                <header className="flex justify-end items-center p-4 gap-4 h-16">
                    <SignedOut>
                        <SignInButton />
                            <SignUpButton>
                                <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                    Sign Up
                                </button>
                            </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                    <UserButton 
                        appearance={{
                            elements: {
                                avatarBox: "w-10 h-10",
                            },
                        }}
                    />
                    </SignedIn>
                </header>
            </div>
      </nav>
    </div>
  );
};

export default Header