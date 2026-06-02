#!/bin/bash
set -e

echo "Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed (DB may not be ready), continuing..."

echo "Starting NestJS API..."
exec node dist/main
