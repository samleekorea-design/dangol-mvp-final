// FCM V1 API Service for Firebase Cloud Messaging
// Modern approach using service account authentication instead of legacy server keys

import { fcmConfig } from './firebase-config';

export interface FCMMessage {
  token: string; // Device registration token
  notification?: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  webpush?: {
    headers?: Record<string, string>;
    data?: Record<string, string>;
    notification?: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      requireInteraction?: boolean;
      silent?: boolean;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
    };
    fcmOptions?: {
      link?: string;
      analyticsLabel?: string;
    };
  };
}

/**
 * Get OAuth 2.0 access token for FCM V1 API authentication
 */
async function getAccessToken(): Promise<string> {
  try {
    // Option 1: Use service account file
    if (fcmConfig.serviceAccountCredentials) {
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({
        keyFile: fcmConfig.serviceAccountCredentials,
        scopes: ['https://www.googleapis.com/auth/firebase.messaging']
      });
      
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token || '';
    }
    
    // Option 2: Use environment variables (better for deployment)
    if (fcmConfig.serviceAccountEmail && fcmConfig.serviceAccountPrivateKey) {
      const { GoogleAuth } = await import('google-auth-library');
      const auth = new GoogleAuth({
        credentials: {
          client_email: fcmConfig.serviceAccountEmail,
          private_key: fcmConfig.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
          project_id: fcmConfig.projectId
        },
        scopes: ['https://www.googleapis.com/auth/firebase.messaging']
      });
      
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      return accessToken.token || '';
    }
    
    throw new Error('No service account configuration found');
    
  } catch (error) {
    console.error('❌ Failed to get FCM access token:', error);
    throw new Error(`FCM authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send push notification using FCM V1 API
 */
export async function sendFCMV1Message(message: FCMMessage): Promise<{ success: boolean; error?: string }> {
  try {
    if (!fcmConfig.projectId) {
      throw new Error('FCM project ID not configured');
    }

    const accessToken = await getAccessToken();
    
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${fcmConfig.projectId}/messages:send`;
    
    const requestBody = {
      message: {
        token: message.token,
        notification: message.notification,
        data: message.data,
        webpush: message.webpush
      }
    };

    console.log('📤 Sending FCM V1 message:', {
      endpoint: fcmEndpoint,
      token: message.token.substring(0, 20) + '...',
      fullToken: message.token,
      title: message.notification?.title,
      body: message.notification?.body,
      hasData: !!message.data,
      hasWebpush: !!message.webpush,
      requestBodySize: JSON.stringify(requestBody).length
    });

    console.log('📝 Full FCM V1 request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(fcmEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FCM V1 API error:', response.status, errorText);
      
      // Parse error for common issues
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        errorMessage = errorText;
      }
      
      return { success: false, error: errorMessage };
    }

    const responseData = await response.json();
    console.log('✅ FCM V1 message sent successfully:', responseData.name);
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ FCM V1 send error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Convert web-push subscription to FCM V1 message format
 */
export function createFCMV1Message(
  registrationToken: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: Record<string, any>;
  }
): FCMMessage {
  // Convert data values to strings (FCM V1 requirement)
  const stringData: Record<string, string> = {};
  if (payload.data) {
    for (const [key, value] of Object.entries(payload.data)) {
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
  }

  return {
    token: registrationToken,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: stringData,
    webpush: {
      headers: {
        'TTL': '86400' // 24 hours
      },
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/badge-72x72.png',
        tag: 'dangol-notification',
        requireInteraction: false,
        actions: [
          {
            action: 'view',
            title: '더 보기'
          },
          {
            action: 'dismiss', 
            title: '닫기'
          }
        ]
      },
      fcmOptions: {
        link: payload.data?.url || '/'
      }
    }
  };
}

/**
 * Test FCM V1 configuration and authentication
 */
export async function testFCMV1Config(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🧪 Testing FCM V1 configuration...');
    
    if (!fcmConfig.projectId) {
      return { success: false, error: 'Project ID not configured' };
    }
    
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return { success: false, error: 'Failed to get access token' };
    }
    
    console.log('✅ FCM V1 authentication successful');
    console.log('  Project ID:', fcmConfig.projectId);
    console.log('  Access Token:', accessToken.substring(0, 20) + '...');
    
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}