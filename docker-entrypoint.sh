#!/bin/sh
set -e

echo "🚀 Applying database schema..."
npx prisma db push --skip-generate

echo "🌟 Starting application on port ${PORT:-3000}..."
exec node .output/server/index.mjs
