#!/bin/sh
mkdir -p dist

# Landing page at root
cp index.html dist/index.html

# Game app
cp preview.html dist/preview.html
cp index.jsx dist/index.jsx

# Legal pages
cp privacy.html dist/privacy.html
cp terms.html dist/terms.html

# Coach outreach
cp coaches.html dist/coaches.html

# Admin dashboard
cp admin.html dist/admin.html

# Service worker (must be at root for scope)
cp sw.js dist/sw.js

# Favicon and public assets (if they exist)
if [ -d "public" ]; then
  cp -r public/* dist/ 2>/dev/null || true
fi
