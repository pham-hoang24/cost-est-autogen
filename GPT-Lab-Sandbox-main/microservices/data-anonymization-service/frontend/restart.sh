#!/bin/bash
echo "🔄 Restarting Frontend with Cache Clear..."

# Kill any existing processes
pkill -f "react-scripts start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# Clear React cache
echo "🧹 Clearing React cache..."
rm -rf node_modules/.cache
rm -rf build

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Install dependencies (if needed)
echo "📦 Installing dependencies..."
npm install

# Start with environment variables
echo "🚀 Starting frontend on port 4001..."
PORT=4001 npm start
