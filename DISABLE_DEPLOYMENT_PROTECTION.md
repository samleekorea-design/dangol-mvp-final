# How to Disable Vercel Deployment Protection

Your Vercel deployment is currently protected with authentication (401 Unauthorized), preventing public access. To make your app publicly accessible:

## Steps to Disable Protection:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: `dangol-v2`

2. **Navigate to Settings**
   - Click on the "Settings" tab
   - Scroll to "Deployment Protection"

3. **Disable Protection**
   - Find "Deployment Protection" section
   - Set to "Disabled" or "None" 
   - OR set "Protection Bypass for Automation" if you want to keep some protection

4. **Save Changes**
   - Click "Save" to apply changes
   - Future deployments will be publicly accessible

## Alternative: Use Vercel CLI to Configure

```bash
# Login to Vercel
vercel login

# Link to project
vercel link

# Deploy without protection (if available)
vercel --prod --public
```

## Current Status:
- ✅ Database initialization fixed
- ✅ Deployment successful
- ❌ Public access blocked by deployment protection
- All routes return 401 Unauthorized

## Once Protection is Disabled:
Your app will be accessible at:
- https://dangol-v2.vercel.app
- https://dangol-v2-[hash].vercel.app

All routes will work:
- `/` - Homepage
- `/customer` - Customer app
- `/merchant` - Merchant dashboard
- `/admin` - Admin panel
- `/api/health` - Health check