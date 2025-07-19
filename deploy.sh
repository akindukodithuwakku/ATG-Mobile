#!/bin/bash

# ATG Healthcare App Deployment Script
# This script helps deploy the app to different cloud platforms

set -e

echo "🚀 ATG Healthcare App Deployment Script"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to deploy to EAS
deploy_to_eas() {
    echo "📱 Deploying to Expo Application Services (EAS)..."
    
    # Install EAS CLI if not installed
    if ! command -v eas &> /dev/null; then
        echo "📦 Installing EAS CLI..."
        npm install -g @expo/eas-cli
    fi
    
    # Login to Expo
    echo "🔐 Logging in to Expo..."
    eas login
    
    # Build for web
    echo "🔨 Building for web..."
    expo export --platform web
    
    # Deploy update
    echo "📤 Deploying update..."
    eas update --branch production --message "Deployment from script"
    
    # Build web version
    echo "🌐 Building web version..."
    eas build --platform web
    
    echo "✅ EAS deployment completed!"
}

# Function to deploy to Vercel
deploy_to_vercel() {
    echo "⚡ Deploying to Vercel..."
    
    # Install Vercel CLI if not installed
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Build for web
    echo "🔨 Building for web..."
    expo export --platform web
    
    # Deploy to Vercel
    echo "📤 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Vercel deployment completed!"
}

# Function to deploy to Netlify
deploy_to_netlify() {
    echo "🌐 Deploying to Netlify..."
    
    # Install Netlify CLI if not installed
    if ! command -v netlify &> /dev/null; then
        echo "📦 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Build for web
    echo "🔨 Building for web..."
    expo export --platform web
    
    # Deploy to Netlify
    echo "📤 Deploying to Netlify..."
    netlify deploy --prod --dir=web-build
    
    echo "✅ Netlify deployment completed!"
}

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [OPTION]"
    echo ""
    echo "Options:"
    echo "  eas      Deploy to Expo Application Services (recommended)"
    echo "  vercel   Deploy to Vercel"
    echo "  netlify  Deploy to Netlify"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh eas"
    echo "  ./deploy.sh vercel"
    echo "  ./deploy.sh netlify"
}

# Main script logic
case "${1:-}" in
    "eas")
        deploy_to_eas
        ;;
    "vercel")
        deploy_to_vercel
        ;;
    "netlify")
        deploy_to_netlify
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "❌ Please specify a deployment target."
        echo ""
        show_help
        exit 1
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac 