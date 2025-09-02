# DigitalOcean App Platform Deployment Guide

## Issue Identified

The repository was likely uploaded with Next.js template files instead of the full DANGOL V2 application. This causes DigitalOcean to build the basic Next.js template rather than the actual application.

## Root Cause

1. **Template README**: The original `README.md` was still the Next.js template
2. **Template SVGs**: Default Next.js SVG files in `public/` directory
3. **Incomplete Git History**: Only 2 commits (template + one update)
4. **Missing Files**: May be missing some application files in the GitHub repository

## Solution: Proper Repository Setup

### 1. Clean Template Files (DONE)
- ✅ Removed `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`
- ✅ Replaced template `README.md` with proper DANGOL V2 README
- ✅ Created DigitalOcean deployment configuration

### 2. Verify All Application Files Are Present

Check that these critical files exist:
- ✅ `src/app/page.tsx` - Main homepage (DANGOL app, not template)
- ✅ `src/app/customer/page.tsx` - Customer application
- ✅ `src/app/merchant/dashboard/page.tsx` - Merchant dashboard
- ✅ `src/app/admin/page.tsx` - Admin panel
- ✅ `src/app/api/` - All API routes
- ✅ `src/lib/database.ts` - Database layer
- ✅ `public/sw.js` - Service worker
- ✅ `public/manifest.json` - PWA manifest

### 3. Commit and Push Proper Application

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "Replace Next.js template with DANGOL V2 application

- Replace template README with proper application documentation
- Remove template SVG files (next.svg, vercel.svg, etc.)
- Add DigitalOcean deployment configuration
- Ensure all application files are committed"

# Push to main branch
git push origin main
```

### 4. DigitalOcean Build Settings

In DigitalOcean App Platform, configure:

**Build Phase:**
- Build Command: `npm run build`
- Node Version: `20.x`
- Install Command: `npm install`

**Run Phase:**
- Run Command: `npm start`
- HTTP Port: 3000

**Environment Variables:**
Set all required environment variables in DigitalOcean dashboard:
- `NODE_ENV=production`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID=dangol-mvp`
- `GOOGLE_CLOUD_PROJECT_ID=dangol-mvp`
- `VAPID_PUBLIC_KEY=...`
- `VAPID_PRIVATE_KEY=...`
- Plus all other Firebase credentials

### 5. Health Check

- **Path**: `/api/health`
- **Initial Delay**: 10 seconds
- **Period**: 10 seconds
- **Timeout**: 5 seconds

## Next Steps

1. **Commit Changes**: Run the git commands above to push the proper application
2. **Redeploy**: Trigger a new deployment in DigitalOcean
3. **Monitor Logs**: Check build logs to ensure it's building DANGOL V2, not the template
4. **Test Routes**: Verify `/customer`, `/merchant`, `/admin` routes work

## Verification

After deployment, the homepage should show:
- ✅ DANGOL branding and Korean text
- ✅ "동네 혜택 찾기" and "고객과 연결하기" buttons
- ❌ NOT the default Next.js welcome page

If you still see the Next.js template, the GitHub repository needs to be updated with the complete application files.