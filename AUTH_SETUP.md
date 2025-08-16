# Authentication Setup Guide

## 🔧 Configuration Required

### Local Development

Create a `.env.local` file with the following variables:

```bash
# Database - SQLite for local development
DATABASE_URL="file:./prisma/prisma/dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="CV7tbL7SfdCDBSnO21FfF7Havl+GtKlFkOj0GSoe2aM="

# Google OAuth (optional)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# XAI API for AI Coaching
# XAI_API_KEY="your-xai-api-key"
```

### Railway Production

Set these environment variables in Railway dashboard:

```bash
# Database - Railway will provide PostgreSQL URL automatically
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL="https://your-actual-railway-domain.up.railway.app"
NEXTAUTH_SECRET="CV7tbL7SfdCDBSnO21FfF7Havl+GtKlFkOj0GSoe2aM="

# XAI API for AI Coaching
XAI_API_KEY="xai-PYHZ48n7C1AkKmJXaBlvVyjNGPwNGMQ6gKFp4XFQ3JlFFWcjwLcQMSVTisKMpjCWzvwFrCGq8eCzOIwL"

# Google OAuth (OPTIONAL - Only add if you want Google sign-in)
# GOOGLE_CLIENT_ID="your-google-client-id-from-console"
# GOOGLE_CLIENT_SECRET="your-google-client-secret-from-console"
```

**Important Notes:**

- Replace `your-actual-railway-domain` with your real Railway domain
- Google OAuth is optional - app works without it using email/password only
- If you add Google OAuth, you must set BOTH CLIENT_ID and CLIENT_SECRET

## 🚀 Setup Steps

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Create `.env.local`** with the variables above
4. **Generate Prisma client**: `npx prisma generate`
5. **Push database schema**: `npx prisma db push`
6. **Start development**: `npm run dev`

## ✅ Authentication Features

- Email/password registration and login
- Secure password hashing with bcryptjs
- JWT sessions with NextAuth.js
- User roles (FREE, PRO, TEAM, ADMIN)
- Password verification
- Session management

## 🔐 Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- NextAuth handles secure session management
- Environment variables keep secrets safe
- Database uses proper authentication constraints
