# Authentication Setup Guide

## Local Development

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/login`

3. Enter any email and password (will auto-create user)

4. Access `/dashboard/leads` to manage leads

## Environment Variables

### Development (.env)
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Production (Vercel Secrets)
```
DATABASE_URL="postgresql://username:password@host:5432/dbname"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://yourdomain.vercel.app"
```

## Adding OAuth Providers

To add GitHub OAuth:

1. Go to Settings > Developer settings > OAuth Apps > New OAuth App
2. Authorization callback URL: `https://yourdomain.vercel.app/api/auth/callback/github`
3. Copy Client ID and Client Secret
4. Add to Vercel secrets:
   - `GITHUB_ID`
   - `GITHUB_SECRET`

5. Update `app/api/auth/[...nextauth]/route.ts`:
   ```typescript
   import GithubProvider from "next-auth/providers/github";
   
   providers: [
     GithubProvider({
       clientId: process.env.GITHUB_ID!,
       clientSecret: process.env.GITHUB_SECRET!,
     }),
     // ... existing CredentialsProvider
   ]
   ```

## Database Migration

When switching to PostgreSQL:

1. Update DATABASE_URL to PostgreSQL connection string
2. Run: `npx prisma migrate deploy`
3. All data will be created in the new database

## User Data Isolation

Each user's leads, automations, templates, and campaigns are isolated by `userId`:
- Leads are stored with their creator's ID
- Only that user can see/modify their own data
- Perfect for multi-tenant SaaS

## Demo Mode

The current setup uses demo mode:
- Any email/password combination works
- Users are auto-created
- Perfect for testing the full flow

To enforce password verification in production:
1. Store hashed passwords in the User model
2. Update the authorize callback in NextAuth config
3. Use bcryptjs to verify passwords
