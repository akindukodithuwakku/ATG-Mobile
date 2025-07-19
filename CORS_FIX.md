# CORS Fix for AWS API Gateway

## Current Issue

```
Access to fetch at 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn'
from origin 'https://atg-mobile.vercel.app' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

AWS API Gateway doesn't have CORS (Cross-Origin Resource Sharing) configured to allow requests from your Vercel domain.

## Solutions

### Solution 1: Configure AWS API Gateway CORS (Recommended)

#### Step 1: Enable CORS in API Gateway Console

1. Go to AWS API Gateway Console
2. Select your API: `uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com`
3. Go to Resources tab
4. Select the `/signIn` resource
5. Click "Actions" → "Enable CORS"

#### Step 2: Configure CORS Settings

```json
{
  "Access-Control-Allow-Origin": "https://atg-mobile.vercel.app",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,Origin",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "false"
}
```

#### Step 3: Deploy the API

1. Click "Actions" → "Deploy API"
2. Select your stage (dev)
3. Click "Deploy"

### Solution 2: Lambda Function CORS Headers

Add CORS headers to your Lambda function responses:

```python
# Python Lambda function
def lambda_handler(event, context):
    # Your existing logic here

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': 'https://atg-mobile.vercel.app',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,Origin',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'false',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(your_response_data)
    }
```

```javascript
// JavaScript Lambda function
exports.handler = async (event) => {
  // Your existing logic here

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://atg-mobile.vercel.app",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,Accept,Origin",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Credentials": "false",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(yourResponseData),
  };
};
```

### Solution 3: Temporary CORS Proxy (Quick Fix)

If you can't modify the API Gateway immediately, use a CORS proxy:

```javascript
// Update API_ENDPOINT in LoginScreen.js
const API_ENDPOINT =
  "https://cors-anywhere.herokuapp.com/https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev";
```

**Note**: This is a temporary solution and not recommended for production.

### Solution 4: Vercel Proxy (Recommended Alternative)

Create a Vercel API route to proxy requests:

#### Step 1: Create API Route

Create file: `api/proxy.js` in your project root:

```javascript
export default async function handler(req, res) {
  const { method, body } = req;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(
      "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev" + req.url,
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify(body) : undefined,
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Step 2: Update API Endpoint

```javascript
// In LoginScreen.js
const API_ENDPOINT = "https://atg-mobile.vercel.app/api/proxy";
```

## Testing CORS Fix

### 1. Check Preflight Request

```bash
curl -X OPTIONS \
  -H "Origin: https://atg-mobile.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn
```

### 2. Check Response Headers

```bash
curl -I -X POST \
  -H "Origin: https://atg-mobile.vercel.app" \
  https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn
```

## Browser Console Check

After implementing the fix, check the browser console for:

- ✅ No CORS errors
- ✅ Successful API responses
- ✅ Proper response headers

## Common CORS Headers

```javascript
// Required CORS headers
'Access-Control-Allow-Origin': 'https://atg-mobile.vercel.app'
'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept,Origin'
'Access-Control-Allow-Credentials': 'false' // or 'true' if using cookies
```

## Security Considerations

1. **Specific Origin**: Use your exact domain instead of `*`
2. **HTTPS Only**: Ensure both client and server use HTTPS
3. **Credentials**: Set to `false` unless you need cookies
4. **Methods**: Only allow necessary HTTP methods

## Next Steps

1. **Implement Solution 1** (API Gateway CORS) for production
2. **Test the fix** in browser console
3. **Verify all API endpoints** work correctly
4. **Monitor for any remaining CORS issues**

## Troubleshooting

### If CORS still fails:

1. Check API Gateway CORS configuration
2. Verify Lambda function headers
3. Clear browser cache
4. Test with different browsers
5. Check network tab for preflight requests

### If using Vercel proxy:

1. Ensure API route is deployed
2. Check Vercel function logs
3. Verify proxy URL is correct
4. Test proxy endpoint directly
