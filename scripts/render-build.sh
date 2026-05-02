#!/bin/bash
set -e

echo "=== Render.com Build Script ==="

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Build Expo web app
echo "Building Expo web app..."
EXPO_PUBLIC_API_BASE_URL="" npx expo export --platform web --output-dir dist/web

# Build server
echo "Building server..."
esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build complete!"
