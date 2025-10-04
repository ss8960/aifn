#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 AIFN Environment Setup');
console.log('========================\n');

const envContent = `# Database (Supabase/PostgreSQL)
# Replace with your actual Supabase connection string
DATABASE_URL="postgresql://postgres:password@db.zhmzcxqajszqicagcdvq.supabase.co:6543/postgres"
DIRECT_URL="postgresql://postgres:password@db.zhmzcxqajszqicagcdvq.supabase.co:6543/postgres"

# Clerk Authentication
# Get these from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key_here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Google Gemini AI
# Get from https://aistudio.google.com
GEMINI_API_KEY="your_gemini_api_key_here"

# Resend Email
# Get from https://resend.com
RESEND_API_KEY="re_your_resend_api_key_here"

# Arcjet Rate Limiting
# Get from https://arcjet.com
ARCJET_KEY="ajkey_your_arcjet_key_here"

# Inngest Background Jobs
# Get from https://inngest.com
INNGEST_SIGNING_KEY="your_inngest_signing_key_here"
INNGEST_EVENT_KEY="your_inngest_event_key_here"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please edit .env.local and add your actual API keys');
  console.log('🔗 Database URL is set to your Supabase instance');
  console.log('\n📋 Next steps:');
  console.log('1. Edit .env.local with your actual API keys');
  console.log('2. Run: npm run dev');
  console.log('3. Test account creation');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Please create .env.local manually with the following content:');
  console.log(envContent);
}
