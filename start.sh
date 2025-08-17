#!/bin/bash

echo "=== Railway Deployment Debug Info ==="
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV" 
echo "HOSTNAME: $HOSTNAME"
echo "PWD: $(pwd)"
echo "====================================="

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

if prisma db push --skip-generate; then
  echo "✅ Database schema setup successful"
else
  echo "❌ Database schema setup failed"
  echo "Environment variables:"
  echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"
  echo "NEXTAUTH_SECRET is set: ${NEXTAUTH_SECRET:+yes}"
  echo "XAI_API_KEY is set: ${XAI_API_KEY:+yes}"
  exit 1
fi

echo "Starting server with node server.js..."
exec node server.js