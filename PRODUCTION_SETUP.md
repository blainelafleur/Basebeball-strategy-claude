# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy your Baseball Strategy app to production with all necessary infrastructure for market release.

## 🏗️ Infrastructure Stack

### Core Services
- **App Hosting**: Railway (auto-scaling, easy deployment)
- **Database**: Railway PostgreSQL (managed, backed up)
- **Cache/Sessions**: Railway Redis (for real-time features)
- **File Storage**: AWS S3 (for user uploads, scenario media)
- **Email**: Resend (transactional emails)
- **Payments**: Stripe (subscriptions & payments)
- **Monitoring**: Sentry (error tracking)
- **Analytics**: PostHog (user behavior)

## 📋 Step-by-Step Setup

### 1. Railway Setup

#### A. Create Railway Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway create baseball-strategy-prod
```

#### B. Add Services to Railway
1. **PostgreSQL Database**
   - Go to Railway dashboard
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Note the connection URL

2. **Redis Cache**
   - Click "Add Service" → "Database" → "Redis"
   - Note the connection URL

### 2. Environment Variables Setup

Copy these variables to Railway dashboard (Settings → Environment):

```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://postgres:password@railway-host:5432/railway

# Redis (Railway provides this automatically)
REDIS_URL=redis://default:password@railway-host:6379

# NextAuth (CRITICAL - Generate new secret!)
NEXTAUTH_SECRET=your-long-random-secret-key-here-change-this
NEXTAUTH_URL=https://your-app-name.up.railway.app

# Google OAuth (Set up in Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI for AI Coaching
OPENAI_API_KEY=sk-...

# AWS S3 for File Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=baseball-strategy-assets

# Email Service (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=baseball-strategy

# Analytics (PostHog)
POSTHOG_KEY=phc_...
POSTHOG_HOST=https://app.posthog.com

# Production Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. External Services Setup

#### A. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Railway domain to authorized origins

#### B. Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to Live mode
3. Copy API keys
4. Set up webhook endpoint: `https://your-app.railway.app/api/webhooks/stripe`

#### C. AWS S3 Setup
1. Create S3 bucket for file storage
2. Create IAM user with S3 permissions
3. Configure CORS for file uploads

#### D. Resend Email Setup
1. Sign up at [Resend](https://resend.com/)
2. Verify your domain
3. Copy API key

#### E. Sentry Error Tracking
1. Sign up at [Sentry](https://sentry.io/)
2. Create new project
3. Copy DSN

#### F. PostHog Analytics
1. Sign up at [PostHog](https://posthog.com/)
2. Copy project key

### 4. Database Migration

```bash
# Generate migration files
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy
```

### 5. Domain Setup

#### A. Custom Domain (Recommended)
1. Purchase domain (Namecheap, GoDaddy, etc.)
2. In Railway dashboard, go to Settings → Domains
3. Add custom domain
4. Update DNS records as instructed

#### B. SSL Certificate
Railway automatically provides SSL certificates for custom domains.

## 🔧 Production Configuration Files

### Railway Configuration
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

## 🚦 Deployment Process

### Automatic Deployment
1. Connect Railway to your GitHub repo
2. Enable auto-deploy on main branch
3. Push to main branch triggers deployment

### Manual Deployment
```bash
# Deploy to Railway
railway up
```

## 📊 Monitoring & Maintenance

### Health Checks
- Railway monitors app health automatically
- Custom health endpoint: `/api/health`

### Error Tracking
- Sentry captures and reports errors
- Set up alerts for critical issues

### Performance Monitoring
- PostHog tracks user behavior
- Railway provides infrastructure metrics

### Database Backups
- Railway automatically backs up PostgreSQL
- Download backups from Railway dashboard

## 🔒 Security Checklist

- ✅ HTTPS enabled (automatic with Railway)
- ✅ Environment variables secured
- ✅ Database behind firewall
- ✅ Rate limiting implemented
- ✅ Input validation on all endpoints
- ✅ CORS properly configured
- ✅ Session security with Redis

## 💰 Cost Estimation (Monthly)

### Railway
- **Hobby Plan**: $5/month (good for starting)
- **Pro Plan**: $20/month (recommended for production)
- **Database**: ~$5-15/month depending on usage

### External Services
- **AWS S3**: ~$5-20/month (depends on storage/bandwidth)
- **Resend**: Free tier, then ~$20/month
- **Sentry**: Free tier, then ~$26/month
- **PostHog**: Free tier, then ~$20/month
- **Stripe**: 2.9% + 30¢ per transaction

**Total Estimated Monthly Cost**: $50-150/month

## 🚀 Go-Live Checklist

- [ ] All environment variables set
- [ ] Database migrated
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Stripe webhooks configured
- [ ] Email service tested
- [ ] Error tracking active
- [ ] Analytics tracking verified
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Backup strategy confirmed

## 📞 Support & Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment)