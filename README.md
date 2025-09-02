# DANGOL V2

A hyperlocal deal and loyalty platform connecting local businesses with nearby customers through location-based notifications and special offers.

## Features

- **Customer App**: Browse nearby deals, claim offers, receive push notifications
- **Merchant Dashboard**: Create deals, send targeted notifications, track redemptions
- **Admin Panel**: Analytics, notification management, system monitoring
- **Push Notifications**: FCM V1 API integration for real-time alerts
- **Location-Based**: Deals filtered by proximity to user location

## Tech Stack

- **Frontend**: Next.js 15.5.2, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (better-sqlite3)
- **Authentication**: Custom merchant authentication with bcrypt
- **Push Notifications**: Firebase Cloud Messaging V1 API
- **Deployment**: DigitalOcean App Platform / Vercel

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── customer/        # Customer app
│   │   ├── merchant/        # Merchant dashboard
│   │   ├── admin/           # Admin panel
│   │   └── api/             # API routes
│   ├── components/          # React components
│   └── lib/                 # Utilities and services
├── public/                  # Static assets
│   ├── sw.js               # Service Worker for PWA
│   └── manifest.json       # PWA manifest
└── package.json            # Dependencies and scripts
```

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials

# Run development server
npm run dev
```

## Environment Variables

Create `.env.local` with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# FCM V1 API
GOOGLE_CLOUD_PROJECT_ID=your-project-id
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Deployment

### DigitalOcean App Platform

1. Push code to GitHub
2. Connect GitHub repo to DigitalOcean
3. Set environment variables in App Platform
4. Deploy

### Build Settings for DigitalOcean

- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Node Version**: 20.x
- **Output Directory**: `.next`

## Database

The application uses SQLite with automatic initialization:
- Development: Local `dangol-v2.db` file
- Production: Created in `/tmp` directory for serverless environments
- Tables are created automatically on first run

## License

Private - All rights reserved
