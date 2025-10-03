"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef } from "react";

const HeroSection = () => {

    const imageRef = useRef(null);

    useEffect(() => {
        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 100;

            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled");
            } else {
                imageElement.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

  return (
    <div className="pb-20 px-4">
    <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title leading-tight">
                Know the path to save your savings with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                An AI-Powered Financial management Platform that helps you track, analyze, and 
                optimize your spending with real-time insights and personalized recommendations. 
            </p>
            <div className="flex justify-center space-x-4">
                <Link href="/dashboard">
                    <Button size="lg" className="px-8">
                        Get Started
                    </Button>
                </Link>
            </div>
            <div className="hero-image-wrapper">
                <div ref={imageRef} className="hero-image">
                    <Image
                        src="/aifnbanner.png"
                        width={780}
                        height={620}
                        alt="Dashboard Preview"
                        className="rounded-lg shadow-2xl border mx-auto"                
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default HeroSection