# ATG Healthcare App Deployment Script (PowerShell)
# This script helps deploy the app to different cloud platforms

param(
    [Parameter(Position=0)]
    [ValidateSet("eas", "vercel", "netlify", "help")]
    [string]$Target = "help"
)

Write-Host "🚀 ATG Healthcare App Deployment Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Function to deploy to EAS
function Deploy-ToEAS {
    Write-Host "📱 Deploying to Expo Application Services (EAS)..." -ForegroundColor Yellow
    
    # Install EAS CLI if not installed
    if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing EAS CLI..." -ForegroundColor Blue
        npm install -g @expo/eas-cli
    }
    
    # Login to Expo
    Write-Host "🔐 Logging in to Expo..." -ForegroundColor Blue
    eas login
    
    # Build for web
    Write-Host "🔨 Building for web..." -ForegroundColor Blue
    npm run build:web
    
    # Deploy update
    Write-Host "📤 Deploying update..." -ForegroundColor Blue
    eas update --branch production --message "Deployment from PowerShell script"
    
    # Build web version
    Write-Host "🌐 Building web version..." -ForegroundColor Blue
    eas build --platform web
    
    Write-Host "✅ EAS deployment completed!" -ForegroundColor Green
}

# Function to deploy to Vercel
function Deploy-ToVercel {
    Write-Host "⚡ Deploying to Vercel..." -ForegroundColor Yellow
    
    # Install Vercel CLI if not installed
    if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Blue
        npm install -g vercel
    }
    
    # Build for web
    Write-Host "🔨 Building for web..." -ForegroundColor Blue
    npm run build:web
    
    # Deploy to Vercel
    Write-Host "📤 Deploying to Vercel..." -ForegroundColor Blue
    vercel --prod
    
    Write-Host "✅ Vercel deployment completed!" -ForegroundColor Green
}

# Function to deploy to Netlify
function Deploy-ToNetlify {
    Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
    
    # Install Netlify CLI if not installed
    if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing Netlify CLI..." -ForegroundColor Blue
        npm install -g netlify-cli
    }
    
    # Build for web
    Write-Host "🔨 Building for web..." -ForegroundColor Blue
    npm run build:web
    
    # Deploy to Netlify
    Write-Host "📤 Deploying to Netlify..." -ForegroundColor Blue
    netlify deploy --prod --dir=web-build
    
    Write-Host "✅ Netlify deployment completed!" -ForegroundColor Green
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\deploy.ps1 [OPTION]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  eas      Deploy to Expo Application Services (recommended)" -ForegroundColor Yellow
    Write-Host "  vercel   Deploy to Vercel" -ForegroundColor Yellow
    Write-Host "  netlify  Deploy to Netlify" -ForegroundColor Yellow
    Write-Host "  help     Show this help message" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy.ps1 eas" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 vercel" -ForegroundColor Gray
    Write-Host "  .\deploy.ps1 netlify" -ForegroundColor Gray
}

# Main script logic
switch ($Target) {
    "eas" {
        Deploy-ToEAS
    }
    "vercel" {
        Deploy-ToVercel
    }
    "netlify" {
        Deploy-ToNetlify
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Please specify a deployment target." -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
} 