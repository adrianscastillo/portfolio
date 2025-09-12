#!/bin/bash

# Deploy Musings Script
# This script helps you quickly deploy musings changes

echo "🚀 Deploying Musings..."

# Check if musings.html exists
if [ ! -f "pages/musings.html" ]; then
    echo "❌ pages/musings.html not found"
    exit 1
fi

# Add and commit changes
git add pages/musings.html
git commit -m "Update musings - $(date '+%Y-%m-%d %H:%M:%S')"

# Push to GitHub
git push origin main

echo "✅ Musings deployed successfully!"
echo "🌐 Your changes should be live at: https://adrianscastillo.github.io/portfolio/pages/musings.html"
