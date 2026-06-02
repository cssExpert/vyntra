#!/bin/bash
set -e

echo "Running database migrations..."
for i in 1 2 3 4 5; do
  npx prisma migrate deploy && break || {
    echo "Migration attempt $i failed, retrying in 5s..."
    sleep 5
  }
done

echo "Starting NestJS API..."
exec node dist/main
