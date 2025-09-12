#!/bin/bash

echo "🚀 Starting DANGOL update..."
echo "📥 Pulling latest code from GitHub..."
git pull

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building production version..."
npm run build

echo "♻️  Restarting application..."
pm2 restart dangol

echo "✅ Update complete! Site is live."
echo "📊 Current status:"
pm2 status
