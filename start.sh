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

# Run database migrations for PostgreSQL
echo "Running database migrations..."
npx prisma db push --force-reset

echo "Starting server with node server.js..."
exec node server.js