# DANGOL V2 - Firebase Hosting Deployment Guide

## Overview
This guide covers deploying DANGOL V2 to Firebase Hosting with custom domain setup for dangol.com.

## Prerequisites
- Node.js and npm installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project `dangol-mvp` created
- Domain `dangol.com` ready for DNS configuration

## Project Configuration

### 1. Firebase Configuration Files
- `firebase.json` - Hosting configuration for Next.js static export
- `.firebaserc` - Project configuration (dangol-mvp)
- `next.config.ts` - Next.js static export settings

### 2. Build Configuration
The project is configured for static export with:
- `output: 'export'` - Enables static HTML export
- `images.unoptimized: true` - Disables Next.js image optimization
- `trailingSlash: true` - Adds trailing slashes for static hosting
- Static route mapping for all pages

## Deployment Process

### Quick Deploy Commands
```bash
# Full deployment (build + deploy)
npm run deploy

# Build only
npm run deploy:build

# Deploy only (after build)
npm run deploy:firebase

# Preview deployment
npm run deploy:preview
```

### Manual Deployment Steps

#### 1. Build the Project
```bash
npm run build
```
This creates a static export in the `out/` directory.

#### 2. Login to Firebase (if not already logged in)
```bash
firebase login
```

#### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

#### 4. Preview Before Production Deploy
```bash
firebase hosting:channel:deploy preview
```

## Custom Domain Setup (dangol.com)

### 1. Add Custom Domain in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `dangol-mvp`
3. Navigate to: **Hosting** → **Add custom domain**
4. Enter domain: `dangol.com`
5. Follow verification steps

### 2. DNS Configuration
Add these DNS records to your domain registrar:

#### For Root Domain (dangol.com)
```
Type: A
Name: @
Value: 151.101.1.195
Value: 151.101.65.195
```

#### For WWW Subdomain (www.dangol.com)
```
Type: CNAME
Name: www
Value: dangol-mvp.web.app
```

#### Alternative: Use CNAME for Root Domain (if supported)
```
Type: CNAME
Name: @
Value: dangol-mvp.web.app
```

### 3. SSL Certificate
Firebase automatically provisions SSL certificates for custom domains.
This may take up to 24 hours to complete.

## Environment Variables for Production

### Required Environment Variables
Create `.env.production` for production deployment:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dangol-mvp
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dangol-mvp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dangol-mvp.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# FCM Configuration
VAPID_PUBLIC_KEY=BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8
```

## Service Worker Configuration

### Service Worker Caching
The service worker (`public/sw.js`) is configured with:
- No-cache headers for `sw.js` itself
- Long-term caching for static assets
- Push notification handling

### Web Manifest
The web manifest (`public/manifest.json`) enables:
- PWA installation
- Push notifications
- App icons and branding

## ⚠️ CRITICAL: Static Export Limitations

**This deployment configuration uses Next.js static export**, which means:

### What WILL Work ✅
- Static pages (/, /customer, /merchant, etc.)
- Client-side functionality
- Service Worker and PWA features
- Push notification registration (client-side)
- Local storage and browser APIs

### What WILL NOT Work ❌
- All API routes (`/api/*` endpoints)
- Server-side database connections
- Push notification sending (requires server)
- Authentication APIs
- File uploads
- Any server-side functionality

### Required Migration for Full Functionality

To restore full functionality, choose one of these approaches:

#### Option 1: Firebase Functions + Firestore
```bash
# Install Firebase Functions
npm install -g firebase-tools
firebase init functions
```
- Migrate API routes to Firebase Functions
- Replace SQLite with Firebase Firestore
- Move FCM sending logic to Functions

#### Option 2: Deploy to Vercel (Recommended)
```bash
# Remove static export config
# Deploy to Vercel with serverless functions
npx vercel
```
- Keep existing API routes
- Use Vercel Postgres/PlanetScale for database
- Enable serverless functions

#### Option 3: Hybrid Deployment
- Deploy static files to Firebase Hosting
- Deploy API backend separately (Railway, Render, etc.)
- Update frontend to use external API

### Current Static Export Usage

This static export is suitable for:
- Demo/preview purposes
- Landing page functionality  
- Client-side only features
- PWA installation testing

## Monitoring and Analytics

### Firebase Analytics
Add Firebase Analytics configuration in production:
```javascript
// In firebase-config.ts
measurementId: "G-XXXXXXXXXX"
```

### Performance Monitoring
Enable Firebase Performance Monitoring for production insights.

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Service account credentials set up
- [ ] VAPID keys configured for push notifications
- [ ] Domain DNS ready for configuration

### Post-Deployment
- [ ] Custom domain added and verified
- [ ] SSL certificate provisioned
- [ ] Push notifications working
- [ ] All routes accessible
- [ ] Performance monitoring enabled

## Troubleshooting

### Build Errors
If you encounter build errors with static export:
1. Check all API routes are removed or replaced with client-side alternatives
2. Ensure no server-side dependencies in client components
3. Verify image optimization is disabled

### Domain Issues
- DNS propagation can take up to 48 hours
- Use online DNS checkers to verify record propagation
- Ensure no conflicting CNAME/A records exist

### Push Notification Issues
- Verify Firebase project has FCM enabled
- Check service account permissions
- Ensure VAPID keys match Firebase console settings

## Support

For deployment issues:
1. Check Firebase Console logs
2. Verify all configuration files
3. Test locally with `npm run build` first
4. Check domain registrar DNS settings

## URLs After Deployment

- **Firebase Default**: https://dangol-mvp.web.app
- **Firebase Custom**: https://dangol-mvp.firebaseapp.com  
- **Custom Domain**: https://dangol.com (after DNS setup)