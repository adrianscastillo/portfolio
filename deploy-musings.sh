#!/bin/bash

# Deploy Musings Script
# This script helps you quickly deploy musings changes

echo "🚀 Deploying Musings..."

# Check if musings.html exists
if [ ! -f "musings.html" ]; then
    echo "❌ musings.html not found in current directory"
    exit 1
fi

# Add and commit changes
git add musings.html
git commit -m "Update musings - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main

echo "✅ Musings deployed successfully!"
echo "🌐 Your changes should be live at: https://adrianscastillo.github.io/portfolio/musings.html"
