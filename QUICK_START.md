# 🚀 Quick Start - Deploy Your ATG Healthcare App

## Prerequisites

- Node.js 18+ installed
- npm installed
- Git repository set up

## Option 1: Deploy to Expo EAS (Recommended) ⭐

### Step 1: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

### Step 3: Initialize EAS Project

```bash
eas build:configure
```

### Step 4: Deploy

```bash
# Build and deploy to web
npm run build:web
eas update --branch production --message "Initial deployment"
eas build --platform web
```

## Option 2: Deploy to Vercel (Fastest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
npm run build:web
vercel --prod
```

## Option 3: Deploy to Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Deploy

```bash
npm run build:web
netlify deploy --prod --dir=web-build
```

## Using the Deployment Scripts

### Windows (PowerShell)

```powershell
.\deploy.ps1 eas
```

### Linux/Mac (Bash)

```bash
./deploy.sh eas
```

## Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_API_URL=your-production-api-url
EXPO_PUBLIC_AWS_REGION=your-aws-region
EXPO_PUBLIC_USER_POOLS_ID=your-user-pool-id
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your-client-id
```

## Real-time Updates

### EAS Updates

- Automatic updates without app store approval
- Users get updates instantly
- No downtime during updates

### Continuous Deployment

- Connect your GitHub repository
- Automatic deployments on push
- Preview deployments for pull requests

## Monitoring

### EAS Analytics

- Built-in crash reporting
- Performance monitoring
- Usage analytics

### Custom Analytics

- Google Analytics integration
- Firebase Analytics
- Custom event tracking

## Support

- 📚 [Expo Documentation](https://docs.expo.dev/)
- 🛠️ [EAS Documentation](https://docs.expo.dev/eas/)
- 💬 [Expo Community](https://forums.expo.dev/)

## Next Steps

1. **Set up environment variables** for production
2. **Configure custom domain** (optional)
3. **Set up monitoring** and analytics
4. **Enable continuous deployment** with GitHub Actions
5. **Test the deployment** thoroughly

## Troubleshooting

### Common Issues

- **Build failures**: Check Metro bundler configuration
- **Web compatibility**: Ensure all native modules have web support
- **Performance**: Optimize bundle size and images
- **CORS errors**: Configure proper CORS headers

### Get Help

- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Review platform-specific documentation
- Join the Expo community forums
