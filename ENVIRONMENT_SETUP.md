# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database (Supabase/PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/aifn_db"
DIRECT_URL="postgresql://postgres:password@localhost:5432/aifn_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key_here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
CLERK_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"

# Resend Email
RESEND_API_KEY="re_your_resend_api_key_here"

# Arcjet Rate Limiting
ARCJET_KEY="ajkey_your_arcjet_key_here"

# Inngest Background Jobs
INNGEST_SIGNING_KEY="your_inngest_signing_key_here"
INNGEST_EVENT_KEY="your_inngest_event_key_here"

# Next.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"
```

## API Setup Instructions

### 1. Clerk Authentication
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable key and secret key
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/clerk`
5. Copy the webhook secret

### 2. Supabase Database
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Run `npx prisma db push` to sync schema

### 3. Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new API key
3. Copy the API key

### 4. Resend Email
1. Go to [resend.com](https://resend.com)
2. Create an account and verify domain
3. Copy the API key

### 5. Arcjet Rate Limiting
1. Go to [arcjet.com](https://arcjet.com)
2. Create a new project
3. Copy the API key

### 6. Inngest Background Jobs
1. Go to [inngest.com](https://inngest.com)
2. Create a new project
3. Copy the signing key and event key

## Database Setup

1. Run migrations:
```bash
npx prisma migrate dev
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Seed database (optional):
```bash
npx prisma db seed
```

## Testing the Setup

1. Start the development server:
```bash
npm run dev
```

2. Test account creation
3. Test transaction creation
4. Test email sending
5. Test background jobs

## Troubleshooting

- If accounts aren't created: Check Clerk webhook is configured
- If emails aren't sent: Check Resend API key
- If rate limiting fails: Check Arcjet API key
- If background jobs fail: Check Inngest configuration
