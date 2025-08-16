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
# Database - Railway will provide PostgreSQL URL
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth Configuration
NEXTAUTH_URL="https://your-app.up.railway.app"
NEXTAUTH_SECRET="CV7tbL7SfdCDBSnO21FfF7Havl+GtKlFkOj0GSoe2aM="

# XAI API
XAI_API_KEY="xai-PYHZ48n7C1AkKmJXaBlvVyjNGPwNGMQ6gKFp4XFQ3JlFFWcjwLcQMSVTisKMpjCWzvwFrCGq8eCzOIwL"
```

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
