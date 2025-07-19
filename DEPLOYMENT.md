# ATG Healthcare App - Cloud Deployment Guide

## Overview

This guide covers deploying your React Native Expo app to the cloud for web-based simulation with real-time updates.

## Option 1: Expo Application Services (EAS) - RECOMMENDED

### Prerequisites

1. Install EAS CLI:

```bash
npm install -g @expo/eas-cli
```

2. Login to Expo:

```bash
eas login
```

### Initial Setup

1. Initialize EAS project:

```bash
eas build:configure
```

2. Update `app.json` with your project details:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-actual-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### Deploy to Web

1. Build for web:

```bash
npm run build:web
```

2. Deploy to EAS:

```bash
eas update --branch production --message "Initial deployment"
```

3. Enable web hosting:

```bash
eas build --platform web
```

### Real-time Updates

- Updates are automatically pushed to users
- No app store approval required
- Users get updates instantly

## Option 2: Vercel Deployment

### Prerequisites

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Create `vercel.json`:

```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "web-build",
  "framework": "expo",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploy

1. Build the app:

```bash
npm run build:web
```

2. Deploy to Vercel:

```bash
vercel --prod
```

## Option 3: Netlify Deployment

### Prerequisites

1. Create `netlify.toml`:

```toml
[build]
  command = "npm run build:web"
  publish = "web-build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Deploy

1. Build the app:

```bash
npm run build:web
```

2. Deploy to Netlify:

```bash
npx netlify-cli deploy --prod --dir=web-build
```

## Option 4: AWS Amplify

### Prerequisites

1. Install Amplify CLI:

```bash
npm install -g @aws-amplify/cli
```

2. Configure Amplify:

```bash
amplify configure
```

### Deploy

1. Initialize Amplify:

```bash
amplify init
```

2. Add hosting:

```bash
amplify add hosting
```

3. Deploy:

```bash
amplify publish
```

## Environment Variables

Create `.env` file for production:

```env
EXPO_PUBLIC_API_URL=your-production-api-url
EXPO_PUBLIC_AWS_REGION=your-aws-region
EXPO_PUBLIC_USER_POOLS_ID=your-user-pool-id
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your-client-id
```

## Continuous Deployment

### GitHub Actions (for EAS)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EAS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build:web
      - run: npx eas-cli update --branch production --message "Auto deploy"
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## Monitoring and Analytics

### Expo Analytics

- Built-in analytics with EAS
- Track app usage and performance
- Monitor crash reports

### Custom Analytics

- Integrate with Google Analytics
- Use Firebase Analytics
- Custom event tracking

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **API Keys**: Use secure storage for API keys
3. **HTTPS**: Ensure all connections use HTTPS
4. **CORS**: Configure CORS properly for web deployment

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Metro bundler configuration
2. **Web Compatibility**: Ensure all native modules have web support
3. **Performance**: Optimize bundle size and images
4. **CORS Errors**: Configure proper CORS headers

### Support

- Expo Documentation: https://docs.expo.dev/
- EAS Documentation: https://docs.expo.dev/eas/
- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com/

## Cost Comparison

| Platform    | Free Tier | Paid Plans    | Best For            |
| ----------- | --------- | ------------- | ------------------- |
| EAS         | ✅        | Pay-as-you-go | React Native apps   |
| Vercel      | ✅        | $20/month     | Fast deployments    |
| Netlify     | ✅        | $19/month     | Simple static sites |
| AWS Amplify | ✅        | Pay-as-you-go | Full-stack apps     |

## Recommendation

**Use Expo EAS** for the best experience with your React Native app:

- Native support for React Native
- Real-time updates
- Integrated analytics
- Cost-effective for mobile apps
