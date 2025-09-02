# Firebase Project Setup Guide for Dangol V2 FCM

## 🔥 Required Firebase Console Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Project name: `dangol-v2` or similar
4. **Enable Google Analytics**: Choose based on preference
5. Wait for project creation

### Step 2: Add Web App to Project
1. In project overview, click "Web" icon (`</>`)
2. App nickname: `Dangol V2 Web`
3. **✅ Check "Also set up Firebase Hosting"** (optional)
4. Click "Register app"

### Step 3: Get Required Configuration Values

**From "Project Settings" → "General" → "Your apps":**

```javascript
// Firebase Config (copy these exact values)
const firebaseConfig = {
  apiKey: "AIza...", // Copy this
  authDomain: "dangol-v2-xxxxx.firebaseapp.com", // Copy this  
  projectId: "dangol-v2-xxxxx", // Copy this
  storageBucket: "dangol-v2-xxxxx.appspot.com", // Copy this
  messagingSenderId: "123456789012", // Copy this - IMPORTANT for FCM
  appId: "1:123456789012:web:abcdef123456", // Copy this
  measurementId: "G-XXXXXXXXXX" // Copy this if Analytics enabled
};
```

### Step 4: Enable Cloud Messaging
1. Go to "Project Settings" → "Cloud Messaging" tab
2. **Copy these values:**
   - **Server Key**: `AAAA...` (Legacy server key for web-push)
   - **Sender ID**: Same as `messagingSenderId` above
3. **Save the Server Key** - needed for web-push configuration

### Step 5: Configure Web Push Certificates (Optional but Recommended)
1. In "Cloud Messaging" → "Web configuration"
2. Generate a new key pair OR
3. Import existing VAPID public key: `BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8`

---

## 📝 Values Needed for Code Configuration

### 1. Environment Variables to Set:
```bash
# .env.local (create this file)
FIREBASE_PROJECT_ID=dangol-v2-xxxxx
FIREBASE_MESSAGING_SENDER_ID=123456789012
FCM_SERVER_KEY=AAAA... # Legacy server key from Cloud Messaging
VAPID_PUBLIC_KEY=BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8
VAPID_PRIVATE_KEY=0n6bv2Kast3yl_nvcMtAbJph1WOWqA8CwVwHN3ZwSeY
```

### 2. Update manifest.json (already done):
```json
{
  "gcm_sender_id": "103953800507", // Universal ID for browser compatibility
  // OR use your actual sender ID:
  "gcm_sender_id": "123456789012" // Your messagingSenderId
}
```

---

## 🔧 Code Configuration Points

### Files that need Firebase config:
1. `src/lib/firebase-config.ts` (to be created)
2. `src/lib/autoNotificationService.ts` (FCM server key)
3. `src/app/api/admin/notifications/send/route.ts` (FCM server key)

### Current Status:
- ✅ **VAPID Keys**: Already configured and working
- ✅ **Web Manifest**: Created with universal GCM sender ID  
- ✅ **Service Worker**: Ready for FCM push events
- ❌ **FCM Server Key**: Missing - causes "unexpected response code"
- ❌ **Firebase Project**: Not created yet

---

## 🚨 Critical Missing Piece

The **"Received unexpected response code"** error is caused by missing **FCM Server Key** authentication.

**Current web-push config** (working but incomplete):
```javascript
webpush.setVapidDetails(
  'mailto:admin@dangol.co.kr',
  'BAqmyck...', // ✅ VAPID public key
  '0n6bv2K...'  // ✅ VAPID private key  
)
```

**Needs FCM Server Key** (for Google Cloud Messaging):
```javascript
// Will be added after Firebase setup
const fcmServerKey = process.env.FCM_SERVER_KEY; // From Firebase Console
```

---

## 📋 Next Steps

1. **Create Firebase project** following steps above
2. **Copy configuration values** into environment variables
3. **Update code** with FCM server key integration
4. **Test push notifications** - should resolve "unexpected response code"

The Firebase project setup will provide the missing FCM server key needed for proper Google Cloud Messaging authentication!