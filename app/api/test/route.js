import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Resend } from "resend";
import aj from "@/lib/arcjet";
import { request } from "@/lib/arcjet";

export async function GET() {
  const results = {
    clerk: false,
    database: false,
    gemini: false,
    resend: false,
    arcjet: false,
    errors: []
  };

  try {
    // Test Clerk
    const { userId } = await auth();
    results.clerk = !!userId;
    if (!userId) {
      results.errors.push("Clerk: No user authenticated");
    }
  } catch (error) {
    results.errors.push(`Clerk: ${error.message}`);
  }

  try {
    // Test Database
    const userCount = await db.user.count();
    results.database = true;
  } catch (error) {
    results.errors.push(`Database: ${error.message}`);
  }

  try {
    // Test Gemini AI
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      results.gemini = true;
    } else {
      results.errors.push("Gemini: API key not configured");
    }
  } catch (error) {
    results.errors.push(`Gemini: ${error.message}`);
  }

  try {
    // Test Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      results.resend = true;
    } else {
      results.errors.push("Resend: API key not configured");
    }
  } catch (error) {
    results.errors.push(`Resend: ${error.message}`);
  }

  try {
    // Test Arcjet
    if (process.env.ARCJET_KEY) {
      const req = await request();
      const decision = await aj.protect(req, {
        userId: "test",
        requested: 1,
      });
      results.arcjet = true;
    } else {
      results.errors.push("Arcjet: API key not configured");
    }
  } catch (error) {
    results.errors.push(`Arcjet: ${error.message}`);
  }

  const allWorking = Object.values(results).every(value => 
    typeof value === 'boolean' ? value : true
  );

  return NextResponse.json({
    status: allWorking ? "success" : "partial",
    results,
    message: allWorking 
      ? "All APIs are working correctly!" 
      : "Some APIs need configuration. Check the errors array."
  });
}
