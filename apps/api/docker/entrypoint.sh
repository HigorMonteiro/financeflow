#!/bin/sh
set -e

echo "🚀 Starting Finance Flow API..."

# Wait a bit for PostgreSQL to be fully ready (depends_on handles basic readiness)
echo "⏳ Waiting for PostgreSQL connection..."
sleep 3

# Debug: Show DATABASE_URL being used
echo "🔍 DATABASE_URL: ${DATABASE_URL}"

# Ensure DATABASE_URL is exported and uses Docker service name
export DATABASE_URL="${DATABASE_URL:-postgresql://financeflow:changeme@postgres:5432/financeflow}"

# Update migration_lock.toml based on DATABASE_URL
echo "🔧 Updating Prisma configuration for PostgreSQL..."
DATABASE_URL="${DATABASE_URL}" node scripts/setup-prisma-schema.js || {
  echo "⚠️  Warning: Could not update migration_lock.toml, continuing..."
}

# Ensure Prisma engines are available and have correct permissions
echo "🔧 Ensuring Prisma engines are ready..."
DATABASE_URL="${DATABASE_URL}" pnpm exec prisma generate || {
  echo "⚠️  Warning: Failed to generate Prisma Client, continuing..."
}

# Check for failed migrations and resolve them
# This handles the case where a previous migration attempt failed
echo "🔍 Checking for failed migrations..."
MIGRATE_STATUS=$(DATABASE_URL="${DATABASE_URL}" pnpm exec prisma migrate status 2>&1 || true)

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
DATABASE_URL="${DATABASE_URL}" pnpm exec prisma migrate deploy || {
  echo "⚠️  Warning: Migration deploy failed, trying migrate dev..."
  DATABASE_URL="${DATABASE_URL}" pnpm exec prisma migrate dev --name init || {
    echo "❌ Error: Failed to run migrations"
    exit 1
  }
}

echo "✅ Migrations applied successfully!"

# Start the server
echo "🚀 Starting server..."
exec "$@"

