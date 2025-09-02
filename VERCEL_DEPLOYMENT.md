# DANGOL V2 - Vercel Deployment Guide

## Overview
This guide covers deploying DANGOL V2 to Vercel with full-stack functionality including API routes, database, and push notifications.

## Why Vercel?
- ✅ **API Routes Support**: All `/api/*` endpoints work natively
- ✅ **Database Integration**: SQLite/PostgreSQL support
- ✅ **Environment Variables**: Secure server-side configuration
- ✅ **Push Notifications**: Full FCM V1 API support
- ✅ **Custom Domains**: Easy `dangol.site` configuration
- ✅ **Automatic HTTPS**: SSL certificates included
- ✅ **Edge Functions**: Global performance optimization

## Prerequisites
- Vercel account (free tier available)
- Node.js and npm installed
- Domain `dangol.site` ready for configuration
- Firebase service account configured

## Project Configuration Files

### 1. Vercel Configuration (`vercel.json`)
- Service Worker optimization
- API routes configuration
- Headers for PWA functionality
- Custom domain routing

### 2. Next.js Configuration (`next.config.ts`)
- Removed static export (enables API routes)
- Image optimization for `dangol.site`
- Server-side packages configuration

### 3. Environment Variables (`.env.vercel`)
- All Firebase configuration
- FCM V1 API credentials
- Service account private key
- Production domain settings

## Deployment Process

### Method 1: Automatic Deployment (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy to production
npm run deploy

# Or deploy preview
npm run preview
```

#### 3. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Copy from .env.vercel file
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dangol-mvp
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
VAPID_PUBLIC_KEY=BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8
VAPID_PRIVATE_KEY=your-private-key
FIREBASE_SERVICE_ACCOUNT_EMAIL=firebase-adminsdk-fbsvc@dangol-mvp.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_PROJECT_ID=dangol-mvp
DATABASE_URL=file:./dangol-v2.db
```

### Method 2: GitHub Integration

#### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from GitHub repository
4. Configure build settings (auto-detected)
5. Add environment variables
6. Deploy

## Custom Domain Setup (dangol.site)

### 1. Add Domain in Vercel Dashboard
1. Project Settings → Domains
2. Add domain: `dangol.site`
3. Add domain: `www.dangol.site` (redirect to root)

### 2. DNS Configuration
Add these DNS records to your domain registrar:

#### For Root Domain (dangol.site)
```
Type: A
Name: @
Value: 76.76.19.19
```

#### For WWW Subdomain (www.dangol.site)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Alternative: CNAME for Root (if supported by registrar)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3. Verify Domain
- DNS propagation takes 24-48 hours
- SSL certificate automatically provisioned
- Test at: https://dangol.site

## Database Configuration

### SQLite (Current)
- Works automatically with Vercel
- Data persists between deployments
- Suitable for moderate traffic

### PostgreSQL (Recommended for Production)
```bash
# Add Vercel Postgres
vercel add postgres

# Update DATABASE_URL in environment variables
DATABASE_URL=postgres://username:password@host:port/database
```

### Migration Commands
```bash
# Local development
npm run dev

# Type checking
npm run type-check

# Production build test
npm run build
```

## Environment Variables Management

### Development (.env.local)
```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dangol-mvp
# ... other local variables
```

### Production (Vercel Dashboard)
Set these in Vercel Dashboard → Environment Variables:

| Variable | Environment | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview | `dangol-mvp` |
| `FIREBASE_SERVICE_ACCOUNT_EMAIL` | Production, Preview | `firebase-adminsdk-fbsvc@dangol-mvp.iam.gserviceaccount.com` |
| `FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY` | Production, Preview | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` |
| `VAPID_PRIVATE_KEY` | Production, Preview | `0n6bv2Kast3yl_nvcMtAbJph1WOWqA8CwVwHN3ZwSeY` |

## API Routes Functionality

All API endpoints will work in production:

### Authentication APIs
- `POST /api/auth/merchant` - Merchant login
- `POST /api/auth/customer` - Customer registration

### Admin APIs
- `GET /api/admin/analytics` - Dashboard analytics
- `POST /api/admin/notifications/send` - Send push notifications
- `GET /api/admin/export` - Data export

### Customer APIs
- `POST /api/customers/subscriptions` - Push notification registration
- `GET /api/customers/deals` - Get nearby deals

### Merchant APIs
- `POST /api/merchants/deals` - Create new deals
- `GET /api/merchants/deals` - Get merchant deals

## Push Notifications Setup

### FCM V1 API Configuration
1. **Firebase Service Account**: Automatically configured via environment variables
2. **VAPID Keys**: Client and server keys configured
3. **Push Registration**: Full client-side registration flow
4. **Message Delivery**: Server-side FCM V1 API integration

### Testing Push Notifications
```bash
# After deployment, test push notifications:
1. Visit https://dangol.site/customer
2. Grant notification permission
3. Use "새 알림 등록" button for fresh token
4. Create a deal via merchant dashboard
5. Verify push notification delivery
```

## Monitoring and Analytics

### Vercel Analytics
- Automatic performance monitoring
- Core Web Vitals tracking
- Function execution metrics

### Firebase Analytics
```javascript
// Automatically configured in production
measurementId: "G-XXXXXXXXXX"
```

## Performance Optimization

### Edge Functions
- API routes run on Vercel Edge Network
- Global distribution for low latency
- Automatic scaling

### Image Optimization
- Next.js Image component optimized for Vercel
- WebP/AVIF format support
- Automatic sizing and compression

### Caching Strategy
- Static assets: 1 year cache
- API responses: Custom cache headers
- Service Worker: No cache for sw.js

## Deployment Commands Summary

```bash
# Quick deployment
npm run deploy

# Preview deployment
npm run preview

# Local development
npm run dev

# Type checking
npm run type-check

# Production build test
npm run build
```

## Troubleshooting

### Build Errors
- Check environment variables in Vercel dashboard
- Verify Firebase service account key format
- Review function timeout limits (30s default)

### Database Issues
- SQLite file permissions in Vercel
- Consider upgrading to Vercel Postgres
- Check database initialization logs

### Push Notification Issues
- Verify FCM project exists: `dangol-mvp`
- Check service account permissions in Google Cloud
- Test with fresh FCM tokens

### Domain Issues
- DNS propagation can take 48 hours
- Verify DNS records with online tools
- Check SSL certificate provisioning status

## Support and Monitoring

### Vercel Dashboard
- Function logs and metrics
- Build and deployment history
- Domain configuration status
- Analytics and performance data

### Real-time Monitoring
- Function execution logs
- Error tracking and alerts
- Performance metrics
- User analytics

## Post-Deployment Checklist

- [ ] Custom domain configured and verified
- [ ] SSL certificate active
- [ ] Environment variables set correctly
- [ ] Push notifications working
- [ ] Database accessible
- [ ] All API routes functional
- [ ] PWA installable
- [ ] Service Worker active

## URLs After Deployment

- **Vercel Default**: https://dangol-v2.vercel.app
- **Custom Domain**: https://dangol.site
- **Admin Panel**: https://dangol.site/admin
- **Customer App**: https://dangol.site/customer
- **Merchant Dashboard**: https://dangol.site/merchant