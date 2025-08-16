# Deployment Instructions

## GitHub Repository Setup

To push this project to GitHub, follow these steps:

### Option 1: Using GitHub CLI (if available)

```bash
gh repo create baseball-strategy-master --public --description "Interactive baseball strategy game built with Next.js 14, TypeScript, and modern web technologies" --source=. --push
```

### Option 2: Manual GitHub Setup

1. Go to [GitHub.com](https://github.com) and create a new repository named `baseball-strategy-master`
2. Choose "Public" visibility
3. Add description: "Interactive baseball strategy game built with Next.js 14, TypeScript, and modern web technologies"
4. Do NOT initialize with README (we already have one)
5. Copy the repository URL (e.g., `https://github.com/username/baseball-strategy-master.git`)

Then run these commands:

```bash
git remote add origin https://github.com/USERNAME/baseball-strategy-master.git
git branch -M main
git push -u origin main
```

## Vercel Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `baseball-strategy-master` repository
5. Vercel will automatically detect Next.js and configure the build
6. Click "Deploy"

Your app will be live at: `https://baseball-strategy-master.vercel.app`

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`

### Railway

1. Connect GitHub repository
2. Railway will auto-detect Next.js configuration

## Environment Variables

Currently no environment variables are required. The app uses:

- Local storage for game state persistence
- No external APIs or databases yet

## Future Deployment Considerations

When adding database features (Phase 2):

- Set up PostgreSQL database (Supabase, PlanetScale, etc.)
- Add `DATABASE_URL` environment variable
- Configure NextAuth.js secrets
- Set up Redis for caching (Upstash)

## Build Verification

Before deploying, ensure the build works locally:

```bash
npm run build
npm start
```

The application should be accessible at `http://localhost:3000`
