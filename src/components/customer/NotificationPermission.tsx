'use client'

import { useState, useEffect } from 'react'
import { PushNotificationManager, KOREAN_TEXT } from '@/lib/pushNotifications'
import { getDeviceId } from '@/lib/deviceFingerprint'

export const NotificationPermission: React.FC = () => {
  console.log('🚀 NotificationPermission component constructor called')
  
  const [showPrompt, setShowPrompt] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isLoading, setIsLoading] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')
  
  console.log('🏁 NotificationPermission component state initialized:', {
    showPrompt,
    permission,
    isLoading,
    deviceId
  })

  useEffect(() => {
    const initializeNotifications = async () => {
      console.log('🔧 NotificationPermission component initializing...')
      console.log('🌐 Browser environment check:', {
        userAgent: navigator.userAgent,
        serviceWorkerSupported: 'serviceWorker' in navigator,
        pushManagerSupported: 'PushManager' in window,
        notificationSupported: 'Notification' in window,
        notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'undefined'
      })
      
      const id = await getDeviceId()
      setDeviceId(id)
      console.log('Device ID set to:', id)

      const manager = PushNotificationManager.getInstance()
      
      if (!manager.isSupported()) {
        console.log('❌ Push notifications not supported by browser')
        return
      }
      console.log('✅ Push notifications supported')

      const currentPermission = manager.getPermissionStatus()
      console.log('📋 Raw notification permission check:', {
        notificationPermission: Notification.permission,
        managerPermission: currentPermission,
        areEqual: Notification.permission === currentPermission
      })
      setPermission(currentPermission)

      // Show prompt if permission is default and user hasn't dismissed it
      const hasPrompted = localStorage.getItem('notification-prompted')
      console.log('📝 LocalStorage check:', {
        notificationPrompted: hasPrompted,
        allLocalStorageKeys: Object.keys(localStorage),
        localStorageLength: localStorage.length
      })
      
      const shouldShowPrompt = currentPermission === 'default' && !hasPrompted
      console.log('🎯 Permission prompt logic:', {
        currentPermission,
        hasPrompted,
        shouldShowPrompt,
        permissionIsDefault: currentPermission === 'default',
        hasPromptedIsFalsy: !hasPrompted
      })
      
      if (shouldShowPrompt) {
        console.log('⏰ Scheduling permission prompt in 3 seconds...')
        // Show prompt after a short delay to avoid interrupting initial page load
        setTimeout(() => {
          console.log('🔔 Showing permission prompt now')
          setShowPrompt(true)
        }, 3000)
      } else {
        console.log('❌ Not showing prompt because:', {
          permissionNotDefault: currentPermission !== 'default',
          alreadyPrompted: !!hasPrompted
        })
      }
      
      // Debug: Add a manual override for testing
      if (window.location.search.includes('debug=notifications')) {
        console.log('🧪 Debug mode detected - forcing prompt display')
        setShowPrompt(true)
      }

      await manager.initialize(id)
    }

    initializeNotifications()
  }, [])

  const handleAllow = async () => {
    setIsLoading(true)
    setShowPrompt(false)

    try {
      console.log('🔔 Starting notification permission request...')
      console.log('Device ID:', deviceId)
      console.log('Current permission:', Notification.permission)
      console.log('Browser support check:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window
      })

      const manager = PushNotificationManager.getInstance()
      const success = await manager.requestPermission(deviceId)

      console.log('🎯 Permission request result:', success)

      if (success) {
        console.log('✅ Notification permission granted successfully')
        setPermission('granted')
        localStorage.setItem('notification-prompted', 'granted')
        
        // Show success message
        showNotificationFeedback('success')
      } else {
        console.error('❌ Notification permission request failed')
        console.log('Final permission status:', Notification.permission)
        setPermission('denied')
        localStorage.setItem('notification-prompted', 'denied')
        showNotificationFeedback('error')
      }
    } catch (error) {
      console.error('❌ Notification permission error:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      })
      showNotificationFeedback('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeny = () => {
    setShowPrompt(false)
    localStorage.setItem('notification-prompted', 'denied')
    
    // Show in 24 hours
    setTimeout(() => {
      localStorage.removeItem('notification-prompted')
    }, 24 * 60 * 60 * 1000)
  }

  const showNotificationFeedback = (type: 'success' | 'error' | 'blocked' | 'resubscribe_success' | 'resubscribe_error') => {
    const feedback = document.createElement('div')
    feedback.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
      type === 'success' || type === 'resubscribe_success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'blocked' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      'bg-red-100 text-red-800 border border-red-200'
    }`

    const icon = (type === 'success' || type === 'resubscribe_success') ? '✅' : type === 'blocked' ? '⚠️' : '❌'
    const title = type === 'success' ? KOREAN_TEXT.NOTIFICATION_SUCCESS :
                 type === 'blocked' ? KOREAN_TEXT.NOTIFICATION_BLOCKED :
                 type === 'resubscribe_success' ? KOREAN_TEXT.RESUBSCRIBE_SUCCESS :
                 type === 'resubscribe_error' ? KOREAN_TEXT.RESUBSCRIBE_ERROR :
                 KOREAN_TEXT.NOTIFICATION_ERROR

    const help = type === 'success' ? KOREAN_TEXT.NOTIFICATION_SUCCESS_HELP :
                type === 'blocked' ? KOREAN_TEXT.NOTIFICATION_BLOCKED_HELP :
                type === 'resubscribe_success' ? KOREAN_TEXT.RESUBSCRIBE_SUCCESS_HELP :
                type === 'resubscribe_error' ? KOREAN_TEXT.RESUBSCRIBE_ERROR_HELP :
                KOREAN_TEXT.NOTIFICATION_ERROR_HELP

    feedback.innerHTML = `
      <div class="flex items-start space-x-3">
        <span class="text-xl">${icon}</span>
        <div>
          <div class="font-medium">${title}</div>
          <div class="text-sm mt-1">${help}</div>
        </div>
        <button class="ml-auto text-lg font-bold hover:opacity-70" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `

    document.body.appendChild(feedback)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove()
      }
    }, 5000)
  }

  const handleManageNotifications = async () => {
    try {
      console.log('🎯 handleManageNotifications called, permission:', permission)
      
      if (permission === 'granted') {
        console.log('✅ Permission granted, sending test notification...')
        // Test notification
        const manager = PushNotificationManager.getInstance()
        await manager.sendTestNotification()
        console.log('🎉 Test notification completed')
      } else if (permission === 'denied') {
        console.log('❌ Permission denied, showing blocked feedback')
        showNotificationFeedback('blocked')
      } else {
        console.log('⚠️ Permission default, showing prompt')
        setShowPrompt(true)
      }
    } catch (error) {
      console.error('❌ handleManageNotifications error:', error)
      showNotificationFeedback('error')
    }
  }

  const handleForceResubscribe = async () => {
    try {
      console.log('🔄 handleForceResubscribe called, deviceId:', deviceId)
      setIsLoading(true)
      
      if (!deviceId) {
        console.error('❌ No device ID available for resubscribe')
        showNotificationFeedback('error')
        return
      }
      
      const manager = PushNotificationManager.getInstance()
      console.log('🚀 Starting force resubscribe process...')
      
      const success = await manager.forceResubscribe(deviceId)
      
      if (success) {
        console.log('✅ Force resubscribe completed successfully')
        showNotificationFeedback('resubscribe_success')
        
        // Send a test notification to verify it works
        setTimeout(async () => {
          try {
            await manager.sendTestNotification()
            console.log('🎉 Test notification sent after resubscribe')
          } catch (error) {
            console.error('⚠️ Test notification failed after resubscribe:', error)
          }
        }, 1000)
      } else {
        console.error('❌ Force resubscribe failed')
        showNotificationFeedback('resubscribe_error')
      }
    } catch (error) {
      console.error('❌ handleForceResubscribe error:', error)
      console.error('Force resubscribe error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        deviceId: deviceId
      })
      
      // Check if it's a service worker registration issue
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Service worker')) {
        console.log('🔧 Service worker issue detected, attempting recovery...')
        try {
          // Try to re-initialize the whole system
          const manager = PushNotificationManager.getInstance()
          await manager.initialize(deviceId)
          console.log('✅ Service worker recovery successful')
          showNotificationFeedback('success')
        } catch (recoveryError) {
          console.error('❌ Service worker recovery failed:', recoveryError)
          showNotificationFeedback('resubscribe_error')
        }
      } else {
        showNotificationFeedback('resubscribe_error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  console.log('🎨 NotificationPermission render state:', { 
    showPrompt, 
    permission, 
    deviceId,
    componentState: {
      showPromptFalse: !showPrompt,
      permissionDefault: permission === 'default',
      condition1: !showPrompt && permission === 'default',
      condition2: !showPrompt,
      condition3: showPrompt
    }
  })

  if (!showPrompt && permission === 'default') {
    console.log('📱 RENDERING: Initial permission request button (알림 받기)')
    return (
      <button
        onClick={() => setShowPrompt(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm z-40"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
        </svg>
        <span>알림 받기</span>
      </button>
    )
  }

  if (!showPrompt) {
    if (permission === 'granted') {
      console.log('🔧 RENDERING: Two buttons for granted permission (알림 테스트 + 새 알림 등록)')
      return (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-2">
          {/* Test Notification Button */}
          <button
            onClick={handleManageNotifications}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
            </svg>
            <span>알림 테스트</span>
          </button>
          
          {/* Force Re-registration Button */}
          <button
            onClick={handleForceResubscribe}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2 text-sm"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>등록 중...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>새 알림 등록</span>
              </>
            )}
          </button>
        </div>
      )
    } else {
      console.log(`🔧 RENDERING: Single manage button (알림 설정)`)
      return (
        <button
          onClick={handleManageNotifications}
          className="fixed bottom-20 right-4 px-4 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-2 text-sm z-40 bg-gray-600 text-white hover:bg-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 12M6 6l12 12" />
          </svg>
          <span>알림 설정</span>
        </button>
      )
    }
  }

  console.log('🔔 RENDERING: Main permission dialog')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{KOREAN_TEXT.PERMISSION_TITLE}</h3>
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {KOREAN_TEXT.PERMISSION_BODY}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleAllow}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                설정 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {KOREAN_TEXT.PERMISSION_ALLOW}
              </>
            )}
          </button>

          <button
            onClick={handleDeny}
            disabled={isLoading}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
          >
            {KOREAN_TEXT.PERMISSION_DENY}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            언제든 브라우저 설정에서 알림을 끄실 수 있습니다
          </p>
        </div>
      </div>
    </div>
  )
}