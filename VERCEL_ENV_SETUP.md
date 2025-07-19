# Vercel Environment Variables Setup Guide

## Problem

The error "Environment Variable 'EXPO_PUBLIC_API_URL' references Secret 'expo_public_api_url', which does not exist" occurs because the `vercel.json` file was referencing secrets that haven't been created in Vercel.

## Solution

### Option 1: Set Environment Variables via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**

   - Visit [vercel.com](https://vercel.com)
   - Select your project

2. **Navigate to Settings**

   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables"

3. **Add Environment Variables**
   Add these variables one by one:

   | Name                                   | Value                     | Environment                      |
   | -------------------------------------- | ------------------------- | -------------------------------- |
   | `EXPO_PUBLIC_API_URL`                  | `your-production-api-url` | Production, Preview, Development |
   | `EXPO_PUBLIC_AWS_REGION`               | `your-aws-region`         | Production, Preview, Development |
   | `EXPO_PUBLIC_USER_POOLS_ID`            | `your-user-pool-id`       | Production, Preview, Development |
   | `EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID` | `your-client-id`          | Production, Preview, Development |

4. **Save and Redeploy**
   - Click "Save" for each variable
   - Go to "Deployments" tab
   - Click "Redeploy" on your latest deployment

### Option 2: Set Environment Variables via Vercel CLI

```bash
# Set environment variables via CLI
vercel env add EXPO_PUBLIC_API_URL
vercel env add EXPO_PUBLIC_AWS_REGION
vercel env add EXPO_PUBLIC_USER_POOLS_ID
vercel env add EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID

# Deploy with the new environment variables
vercel --prod
```

### Option 3: Create a .env.local file (for local development)

Create a `.env.local` file in your project root:

```env
EXPO_PUBLIC_API_URL=your-production-api-url
EXPO_PUBLIC_AWS_REGION=your-aws-region
EXPO_PUBLIC_USER_POOLS_ID=your-user-pool-id
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your-client-id
```

## Environment Variable Values

### For AWS Amplify (if using AWS)

```env
EXPO_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_USER_POOLS_ID=us-east-1_xxxxxxxxx
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### For Firebase (if using Firebase)

```env
EXPO_PUBLIC_API_URL=https://your-project-id.firebaseapp.com
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_USER_POOLS_ID=your-firebase-project-id
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your-firebase-web-client-id
```

### For Custom API

```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com
EXPO_PUBLIC_AWS_REGION=us-east-1
EXPO_PUBLIC_USER_POOLS_ID=your-auth-provider-id
EXPO_PUBLIC_USER_POOLS_WEB_CLIENT_ID=your-client-id
```

## Important Notes

### 1. EXPO*PUBLIC* Prefix

- All environment variables must start with `EXPO_PUBLIC_` to be accessible in the client-side code
- This is required for Expo/React Native Web

### 2. Environment Selection

- **Production**: Used for live deployments
- **Preview**: Used for preview deployments (PRs)
- **Development**: Used for local development

### 3. Security

- Never commit `.env` files to version control
- Use Vercel's environment variable system for production
- Keep sensitive values secure

## Verification

After setting up environment variables:

1. **Check in Vercel Dashboard**

   - Go to Project Settings → Environment Variables
   - Verify all variables are listed

2. **Test the deployment**

   - Redeploy your project
   - Check the build logs for any environment variable errors

3. **Verify in your app**
   - Open the deployed app
   - Check browser console for any environment variable errors
   - Test API calls to ensure they work

## Troubleshooting

### If you still get the error:

1. **Clear Vercel cache:**

   ```bash
   vercel --force
   ```

2. **Delete and recreate environment variables:**

   - Remove all environment variables in Vercel dashboard
   - Add them again one by one

3. **Check variable names:**
   - Ensure exact spelling and case
   - Make sure they start with `EXPO_PUBLIC_`

### Common Issues:

- **Wrong variable names**: Check spelling and case
- **Missing EXPO*PUBLIC* prefix**: Required for client-side access
- **Wrong environment selection**: Make sure variables are set for all environments
- **Cached deployment**: Force a new deployment

## Next Steps

1. Set up your environment variables in Vercel
2. Redeploy your application
3. Test all functionality
4. Monitor for any environment-related errors
