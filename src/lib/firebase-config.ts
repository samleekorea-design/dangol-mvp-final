// Firebase configuration for Dangol V2 FCM
// This file will be populated with actual values after Firebase project creation

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// TODO: Replace with actual values from Firebase Console
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

// FCM V1 API configuration (server-side only)
export const fcmConfig = {
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '0n6bv2Kast3yl_nvcMtAbJph1WOWqA8CwVwHN3ZwSeY',
  contactEmail: 'mailto:admin@dangol.co.kr',
  // FCM V1 API configuration
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  serviceAccountCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  // Alternative service account config (for deployment without file)
  serviceAccountEmail: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL || '',
  serviceAccountPrivateKey: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
  serviceAccountClientId: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID || ''
};

// Validate configuration
export function validateFirebaseConfig(): boolean {
  const required = ['apiKey', 'projectId', 'messagingSenderId', 'appId'];
  return required.every(key => firebaseConfig[key as keyof FirebaseConfig]);
}

export function validateFCMConfig(): boolean {
  const hasVapidKeys = !!(fcmConfig.vapidPublicKey && fcmConfig.vapidPrivateKey);
  const hasProjectId = !!fcmConfig.projectId;
  const hasServiceAccount = !!(fcmConfig.serviceAccountCredentials || 
    (fcmConfig.serviceAccountEmail && fcmConfig.serviceAccountPrivateKey));
  
  return hasVapidKeys && hasProjectId && hasServiceAccount;
}

// Development mode check
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log configuration status (development only)
if (isDevelopment && typeof window === 'undefined') {
  console.log('🔥 Firebase Config Status:');
  console.log('  Firebase Config Valid:', validateFirebaseConfig());
  console.log('  FCM V1 Config Valid:', validateFCMConfig());
  console.log('  Project ID:', firebaseConfig.projectId || 'NOT SET');
  console.log('  Sender ID:', firebaseConfig.messagingSenderId || 'NOT SET');
  console.log('  Service Account:', fcmConfig.serviceAccountCredentials ? 'FILE SET' : 
    (fcmConfig.serviceAccountEmail ? 'ENV VARS SET' : 'NOT SET'));
}