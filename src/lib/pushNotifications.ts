'use client'

export interface PushNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
}

export class PushNotificationManager {
  private static instance: PushNotificationManager
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager()
    }
    return PushNotificationManager.instance
  }

  async initialize(deviceId: string): Promise<boolean> {
    try {
      console.log('🔧 Initializing push notifications for device:', deviceId)
      console.log('Browser support check:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      })

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('❌ Push notifications not supported by this browser')
        return false
      }

      // Use the new ensureServiceWorkerRegistration method
      const registrationSuccess = await this.ensureServiceWorkerRegistration(deviceId)
      
      if (registrationSuccess) {
        console.log('✅ Push notifications initialized successfully')
        console.log('Service worker scope:', this.registration?.scope)
        return true
      } else {
        console.error('❌ Push notifications initialization failed')
        return false
      }
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error)
      console.error('Initialize error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      return false
    }
  }

  async requestPermission(deviceId: string): Promise<boolean> {
    try {
      console.log('🔔 requestPermission called with deviceId:', deviceId)
      console.log('Current permission status:', Notification.permission)

      if (Notification.permission === 'granted') {
        console.log('✅ Permission already granted, subscribing to push...')
        return await this.subscribeToPush(deviceId)
      }

      if (Notification.permission === 'denied') {
        console.warn('❌ Push notifications are blocked by user')
        return false
      }

      // Request permission
      console.log('📝 Requesting notification permission...')
      const permission = await Notification.requestPermission()
      console.log('📋 Permission request result:', permission)
      
      if (permission === 'granted') {
        console.log('✅ Permission granted, subscribing to push...')
        return await this.subscribeToPush(deviceId)
      } else {
        console.warn('❌ Permission denied by user:', permission)
        return false
      }
    } catch (error) {
      console.error('❌ Failed to request notification permission:', error)
      console.error('Permission request error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      return false
    }
  }

  private async subscribeToPush(deviceId: string): Promise<boolean> {
    try {
      console.log('🚀 Starting push subscription process...')
      console.log('Device ID:', deviceId)
      console.log('Service worker registration state:', {
        hasRegistration: !!this.registration,
        isActive: !!this.registration?.active,
        hasPushManager: !!this.registration?.pushManager,
        state: this.registration?.active?.state,
        scope: this.registration?.scope
      })

      if (!this.registration) {
        console.error('❌ Service worker not registered')
        throw new Error('Service worker not registered')
      }

      if (!this.registration.active) {
        console.error('❌ Service worker not active')
        throw new Error('Service worker registration exists but worker is not active')
      }

      // Check if push manager is available
      if (!this.registration.pushManager) {
        console.error('❌ Push manager not available')
        throw new Error('Push manager not available')
      }

      console.log('✅ Service worker validation passed')

      // VAPID public key - in production, this would come from environment variables
      const vapidPublicKey = 'BAqmyckLdT9Rk2EVrzi_P4-QzF89uoFIlzOsscQXhCgBEDDbelZLbQFM1x4a2BBn8ac6dxFo3d5TrmSzy9_eFR8'
      console.log('🔑 Using VAPID public key:', vapidPublicKey.substring(0, 20) + '...')
      
      console.log('📝 Creating push subscription...')
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      console.log('✅ Push subscription created successfully')
      console.log('Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...')
      
      this.subscription = subscription

      // Save subscription to database via API
      console.log('💾 Saving subscription to database...')
      try {
        const subscriptionData = {
          deviceId,
          subscription: subscription.toJSON()
        }
        console.log('Subscription data:', {
          deviceId: subscriptionData.deviceId,
          endpoint: subscriptionData.subscription.endpoint?.substring(0, 50) + '...',
          hasKeys: !!(subscriptionData.subscription.keys?.p256dh && subscriptionData.subscription.keys?.auth)
        })

        const response = await fetch('/api/customers/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscriptionData)
        })

        console.log('📡 API response status:', response.status)

        if (response.ok) {
          const responseData = await response.json()
          console.log('✅ Push subscription saved successfully:', responseData)
          return true
        } else {
          const errorText = await response.text()
          console.error('❌ Failed to save push subscription - HTTP', response.status)
          console.error('Response body:', errorText)
          try {
            const errorJson = JSON.parse(errorText)
            console.error('Parsed error:', errorJson)
          } catch (e) {
            console.error('Could not parse error response as JSON')
          }
          return false
        }
      } catch (apiError) {
        console.error('❌ API call failed:', apiError)
        console.error('API error details:', {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
          stack: apiError instanceof Error ? apiError.stack : undefined,
          name: apiError instanceof Error ? apiError.name : undefined
        })
        return false
      }
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error)
      console.error('Subscribe error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      return false
    }
  }

  async unsubscribe(deviceId: string): Promise<boolean> {
    try {
      if (!this.subscription) {
        return true
      }

      await this.subscription.unsubscribe()
      this.subscription = null

      // Remove from database via API
      try {
        await fetch(`/api/customers/subscriptions?deviceId=${encodeURIComponent(deviceId)}`, {
          method: 'DELETE'
        })
        console.log('🔔 Unsubscribed from push notifications')
      } catch (error) {
        console.error('Failed to remove subscription from database:', error)
      }
      return true
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  async forceResubscribe(deviceId: string): Promise<boolean> {
    try {
      console.log('🔄 Starting force resubscribe process for device:', deviceId)
      
      // Step 1: Clear existing push subscription (but keep service worker)
      console.log('🗑️ Clearing existing push subscription...')
      try {
        if (this.subscription) {
          console.log('🧹 Unsubscribing current subscription...')
          await this.subscription.unsubscribe()
          this.subscription = null
        }
        
        // Clear any cached subscription from push manager (without affecting service worker)
        if (this.registration?.pushManager) {
          const existingSubscription = await this.registration.pushManager.getSubscription()
          if (existingSubscription) {
            console.log('🧹 Unsubscribing existing browser subscription...')
            await existingSubscription.unsubscribe()
          }
        }
        
        // Remove from database
        await fetch(`/api/customers/subscriptions?deviceId=${encodeURIComponent(deviceId)}`, {
          method: 'DELETE'
        })
        console.log('🗑️ Cleared subscription from database')
      } catch (error) {
        console.warn('⚠️ Failed to clear existing subscriptions:', error)
      }
      
      // Step 2: Ensure service worker is properly registered and ready
      console.log('🔧 Verifying service worker registration...')
      await this.ensureServiceWorkerRegistration(deviceId)
      
      if (!this.registration) {
        throw new Error('Service worker registration failed during force resubscribe')
      }
      
      // Step 3: Wait a moment for cleanup and registration to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 4: Create fresh push subscription
      console.log('🆕 Creating fresh push subscription...')
      const success = await this.subscribeToPush(deviceId)
      
      if (success) {
        console.log('✅ Force resubscribe completed successfully')
        return true
      } else {
        console.error('❌ Force resubscribe failed during subscription creation')
        return false
      }
    } catch (error) {
      console.error('❌ Force resubscribe failed:', error)
      console.error('Force resubscribe error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      return false
    }
  }

  private async ensureServiceWorkerRegistration(deviceId: string): Promise<boolean> {
    try {
      console.log('🔍 Checking service worker registration state...')
      
      // Check if we already have a valid registration
      if (this.registration && this.registration.active) {
        console.log('✅ Service worker already registered and active')
        return true
      }
      
      // Try to get existing registration (getRegistration takes scope, not script path)
      const existingRegistration = await navigator.serviceWorker.getRegistration('/')
      if (existingRegistration && existingRegistration.active) {
        console.log('✅ Found existing service worker registration')
        console.log('Existing registration details:', {
          scope: existingRegistration.scope,
          state: existingRegistration.active.state,
          scriptURL: existingRegistration.active.scriptURL
        })
        this.registration = existingRegistration
        return true
      }
      
      // Re-register service worker if needed
      console.log('📝 Re-registering service worker...')
      this.registration = await navigator.serviceWorker.register('/sw.js')
      
      // Wait for service worker to be ready
      console.log('⏳ Waiting for service worker to be ready...')
      await navigator.serviceWorker.ready
      
      if (this.registration.active) {
        console.log('✅ Service worker registered and ready')
        return true
      } else {
        throw new Error('Service worker registration succeeded but worker is not active')
      }
    } catch (error) {
      console.error('❌ Service worker registration failed:', error)
      console.error('SW registration error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        swSupported: 'serviceWorker' in navigator,
        swReady: navigator.serviceWorker ? 'ready method exists' : 'no ready method'
      })
      return false
    }
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
  }

  getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null
    }

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get subscription:', error)
      return null
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Test notification (for development)
  async sendTestNotification(): Promise<void> {
    try {
      console.log('🧪 Testing notification...')
      console.log('🔔 Notification permission:', Notification.permission)
      
      if (!('Notification' in window)) {
        console.error('❌ Browser does not support notifications')
        alert('브라우저가 알림을 지원하지 않습니다.')
        return
      }

      if (Notification.permission === 'granted') {
        console.log('✅ Creating test notification...')
        const notification = new Notification('단골 V2 테스트', {
          body: '푸시 알림이 정상적으로 작동합니다!',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        })
        
        notification.onclick = () => {
          console.log('🖱️ Test notification clicked')
          notification.close()
        }
        
        notification.onshow = () => {
          console.log('✅ Test notification displayed')
        }
        
        notification.onerror = (error) => {
          console.error('❌ Test notification error:', error)
        }
        
        console.log('🎉 Test notification created successfully')
      } else {
        console.warn('⚠️ Notification permission not granted:', Notification.permission)
        alert(`알림 권한이 필요합니다. 현재 상태: ${Notification.permission}`)
      }
    } catch (error) {
      console.error('❌ sendTestNotification error:', error)
      alert('알림 테스트 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }
}

// Korean text constants for permission requests
export const KOREAN_TEXT = {
  PERMISSION_TITLE: '알림 권한 요청',
  PERMISSION_BODY: '새로운 할인 정보와 특별 혜택을 놓치지 마세요! 푸시 알림을 허용하시겠습니까?',
  PERMISSION_ALLOW: '알림 허용',
  PERMISSION_DENY: '나중에',
  NOTIFICATION_BLOCKED: '알림이 차단되었습니다',
  NOTIFICATION_BLOCKED_HELP: '브라우저 설정에서 알림을 허용해주세요.',
  NOTIFICATION_SUCCESS: '알림이 활성화되었습니다',
  NOTIFICATION_SUCCESS_HELP: '이제 새로운 할인 정보를 받아보실 수 있습니다.',
  NOTIFICATION_ERROR: '알림 설정 중 오류가 발생했습니다',
  NOTIFICATION_ERROR_HELP: '잠시 후 다시 시도해주세요.',
  RESUBSCRIBE_SUCCESS: '새 알림 등록이 완료되었습니다',
  RESUBSCRIBE_SUCCESS_HELP: '새로운 FCM 토큰으로 알림을 받을 수 있습니다.',
  RESUBSCRIBE_ERROR: '새 알림 등록 중 오류가 발생했습니다',
  RESUBSCRIBE_ERROR_HELP: '네트워크 연결을 확인하고 다시 시도해주세요.',
  NEW_DEAL_TITLE: '새로운 할인!',
  DEAL_NEARBY_TITLE: '근처 할인 정보',
  DEAL_EXPIRES_SOON: '곧 마감되는 할인',
}

export default PushNotificationManager