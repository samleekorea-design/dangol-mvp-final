# FCM V1 API Setup Guide

The notification system has been successfully migrated from legacy FCM server keys to FCM V1 API with service account authentication.

## Current Status

✅ **Completed:**
- FCM V1 API service implementation
- Google Auth Library integration
- Updated notification services (admin + automatic)
- Placeholder service account configuration
- Environment variables configuration

⚠️ **Needs Real Firebase Credentials:**
- The current `firebase-service-account.json` contains placeholder values
- Real Firebase project credentials are required for production use

## Firebase Project Setup

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `dangol-v2` project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### 2. Replace Service Account File
Replace the placeholder `firebase-service-account.json` with the downloaded file:

```bash
# Backup placeholder file
mv firebase-service-account.json firebase-service-account.json.placeholder

# Copy your downloaded service account file
cp ~/Downloads/dangol-v2-firebase-adminsdk-xxxxx-xxxxxxxxxx.json firebase-service-account.json
```

### 3. Verify Configuration
Test the setup using the admin API:

```bash
curl "http://localhost:3000/api/admin/test-fcm" | jq .
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "FCM V1 configuration is valid"
}
```

## Environment Variables

The system uses the following environment variables (already configured in `.env.local`):

```bash
# Firebase Project Config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dangol-v2
GOOGLE_CLOUD_PROJECT_ID=dangol-v2

# Service Account File Path
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json

# Alternative: Service Account as Environment Variables
# (Use instead of file for deployment)
# FIREBASE_SERVICE_ACCOUNT_EMAIL=firebase-adminsdk-xxxxx@dangol-v2.iam.gserviceaccount.com
# FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Testing Push Notifications

### 1. Test FCM Configuration
```bash
curl "http://localhost:3000/api/admin/test-fcm"
```

### 2. Test Manual Notification
```bash
curl -X POST "http://localhost:3000/api/admin/notifications/send" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test FCM V1",
    "body": "Testing new FCM V1 API implementation",
    "targetType": "all"
  }'
```

### 3. Test Automatic Notification
Create a new deal through the merchant interface - it should automatically trigger notifications to all customers during Korean business hours (9am-8pm KST).

## Key Features

- **Modern Authentication:** Uses OAuth 2.0 service account tokens instead of legacy server keys
- **Automatic Notifications:** Triggers when merchants create deals (Korean business hours only)
- **Manual Notifications:** Admin dashboard can send targeted notifications
- **Korean Localization:** Proper address parsing and Korean timezone handling
- **Delivery Tracking:** Full notification delivery status tracking in database

## Security Notes

- ✅ `firebase-service-account.json` is added to `.gitignore`
- ✅ No legacy FCM server keys in codebase
- ✅ Service account credentials isolated to server-side only
- ⚠️ Replace placeholder credentials with real Firebase service account

## Files Modified

- `src/lib/fcmV1Service.ts` - New FCM V1 API service
- `src/lib/firebase-config.ts` - Updated for service account auth
- `src/app/api/admin/notifications/send/route.ts` - Updated to use FCM V1
- `src/lib/autoNotificationService.ts` - Updated to use FCM V1
- `.env.local` - FCM V1 environment variables
- `firebase-service-account.json` - Service account credentials (placeholder)

## Next Steps

1. **Replace placeholder service account credentials** with real Firebase credentials
2. **Test notification delivery** with real FCM tokens
3. **Deploy with secure credential management** (environment variables recommended for production)