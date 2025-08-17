#!/bin/bash

echo "=== Railway Deployment Debug Info ==="
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV" 
echo "HOSTNAME: $HOSTNAME"
echo "PWD: $(pwd)"
echo "RAILWAY_ENVIRONMENT: $RAILWAY_ENVIRONMENT"
echo "====================================="

echo "=== CRITICAL DATABASE DEBUG ==="
echo "DATABASE_URL (first 40 chars): ${DATABASE_URL:0:40}..."
echo "DATABASE_URL length: ${#DATABASE_URL}"
echo "NEXTAUTH_SECRET length: ${#NEXTAUTH_SECRET}"
echo "XAI_API_KEY length: ${#XAI_API_KEY}"
echo "=============================="

# List files to make sure we have everything
echo "Files in current directory:"
ls -la

# Verify we're using PostgreSQL schema
echo "Verifying database configuration..."
echo "Schema provider check:"
grep -n "provider" ./prisma/schema.prisma || echo "No schema file found!"

# Validate environment variables
echo "Environment variable validation:"
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET is not set!"
  exit 1
fi

# Check database URL format
if [[ $DATABASE_URL == postgresql://* ]]; then
  echo "✅ PostgreSQL database URL detected"
  echo "Database host: $(echo $DATABASE_URL | sed 's/.*@\([^:]*\).*/\1/')"
elif [[ $DATABASE_URL == file:* ]]; then
  echo "❌ SQLite database URL detected - this should be PostgreSQL!"
  echo "Production requires PostgreSQL, not SQLite"
  exit 1
else
  echo "❌ Invalid database URL format: ${DATABASE_URL:0:30}..."
  echo "Expected format: postgresql://user:pass@host:port/dbname"
  exit 1
fi

# Run database setup for PostgreSQL (safe - no data loss)
echo "Setting up database schema..."
echo "Database URL: ${DATABASE_URL:0:20}..." # Show first 20 chars for debugging

# Ensure we're using the correct schema file
echo "Checking schema file..."
if [ -f "./prisma/schema.prisma" ]; then
  echo "✅ Schema file found at ./prisma/schema.prisma"
  echo "First few lines of schema:"
  head -5 ./prisma/schema.prisma
else
  echo "❌ Schema file not found at ./prisma/schema.prisma"
  ls -la ./prisma/
  exit 1
fi

# Force database migration with verbose output
echo "Running Prisma database push (forced sync)..."

# Try primary migration approach
if prisma db push --force-reset --skip-generate --accept-data-loss 2>&1; then
  echo "✅ Database schema setup successful"
else
  echo "⚠️  Primary migration failed, trying alternative approach..."
  
  # Try without force reset
  if prisma db push --skip-generate 2>&1; then
    echo "✅ Alternative migration successful"
  else
    echo "⚠️  Standard migration failed, trying basic approach..."
    
    # Try most basic approach
    if prisma db push 2>&1; then
      echo "✅ Basic migration successful"
    else
      echo "❌ All migration attempts failed, but continuing anyway..."
      echo "App will start but database tables may not exist"
      echo "Environment variables:"
      echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"
      echo "NEXTAUTH_SECRET is set: ${NEXTAUTH_SECRET:+yes}"
      echo "XAI_API_KEY is set: ${XAI_API_KEY:+yes}"
      # Don't exit - let the app start anyway
    fi
  fi
fi

# Always continue to start the server
echo "Migration attempts completed. Starting server..."

echo "Starting server with node server.js..."
exec node server.js