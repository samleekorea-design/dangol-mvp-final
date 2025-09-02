# Static Build Instructions for Firebase Hosting

## Current Issue
The project contains API routes (`/src/app/api/*`) which cannot be statically exported.

## Quick Solutions

### Option 1: Temporary API Route Exclusion
Move API routes out of the way for static build:

```bash
# Move API routes temporarily
mv src/app/api src/app/api_backup

# Build static version
npm run deploy:build

# Deploy to Firebase
npm run deploy:firebase

# Restore API routes for development
mv src/app/api_backup src/app/api
```

### Option 2: Use Firebase Functions (Recommended)

1. **Initialize Firebase Functions:**
```bash
firebase init functions
```

2. **Migrate API routes to Functions:**
- Move `/src/app/api/*` logic to `/functions/src/index.ts`
- Update frontend to call Firebase Function endpoints

3. **Deploy both static site and functions:**
```bash
npm run deploy:build
firebase deploy
```

### Option 3: Deploy to Vercel Instead

Remove static export configuration and deploy to Vercel:

```bash
# Edit next.config.ts - remove output: 'export'
# Then deploy
npx vercel
```

## Firebase Hosting Deployment Commands

Once API routes are handled:

```bash
# Login to Firebase
firebase login

# Deploy
npm run deploy
```

## Custom Domain Setup (dangol.com)

After successful deployment, add custom domain:

1. Firebase Console → Hosting → Add custom domain
2. Enter: `dangol.com`
3. Add DNS records:
   - Type: A, Name: @, Value: 151.101.1.195
   - Type: A, Name: @, Value: 151.101.65.195
   - Type: CNAME, Name: www, Value: dangol-mvp.web.app

## Testing

Static build includes:
- ✅ Homepage (/)
- ✅ Customer page (/customer)  
- ✅ Merchant pages (/merchant/*)
- ✅ Admin page (/admin)
- ✅ Service Worker (sw.js)
- ✅ PWA Manifest
- ❌ API routes (require server)