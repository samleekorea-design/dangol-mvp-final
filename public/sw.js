const CACHE_NAME = 'dangol-v2-1.0.0'
const SW_VERSION = '1.0.0'

// Install event - cache essential resources
self.addEventListener('install', event => {
  console.log(`🔧 Service Worker ${SW_VERSION} installing...`)
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/'
      ]).catch(error => {
        console.warn('Failed to cache some resources during install:', error)
      })
    })
  )
  // Immediately activate this service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log(`🚀 Service Worker ${SW_VERSION} activating...`)
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim()
    })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('🔔 Push notification received:', event)
  console.log('🔔 Push event details:', {
    hasData: !!event.data,
    dataText: event.data ? event.data.text() : null,
    origin: event.origin,
    lastEventId: event.lastEventId
  })

  if (!event.data) {
    console.warn('❌ Push event has no data')
    return
  }

  let notificationData
  try {
    notificationData = event.data.json()
    console.log('✅ Parsed push data:', notificationData)
  } catch (error) {
    console.error('❌ Failed to parse push data as JSON:', error)
    console.log('📝 Raw push data text:', event.data.text())
    notificationData = {
      title: '단골 V2',
      body: event.data.text() || 'New notification',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    }
    console.log('🔄 Using fallback notification data:', notificationData)
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/badge-72x72.png',
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    tag: notificationData.tag || 'dangol-notification',
    renotify: true,
    actions: notificationData.actions || [
      {
        action: 'view',
        title: '확인하기',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: '닫기'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || '단골 V2',
      notificationOptions
    ).then(() => {
      console.log('✅ Notification displayed successfully')
      
      // Track notification delivery
      if (notificationData.notificationId) {
        trackNotificationDelivery(notificationData.notificationId, 'delivered')
      }
    }).catch(error => {
      console.error('❌ Failed to show notification:', error)
      
      // Track notification failure
      if (notificationData.notificationId) {
        trackNotificationDelivery(notificationData.notificationId, 'failed', error.message)
      }
    })
  )
})

// Notification click event - handle user interactions
self.addEventListener('notificationclick', event => {
  console.log('👆 Notification clicked:', event)

  const notification = event.notification
  const action = event.action
  const data = notification.data || {}

  // Track notification click
  if (data.notificationId) {
    trackNotificationDelivery(data.notificationId, 'clicked')
  }

  // Close the notification
  notification.close()

  // Handle different actions
  switch (action) {
    case 'view':
    case '':  // Default click (no action button)
      // Determine URL to open based on notification data
      let targetUrl = '/'
      
      if (data.url) {
        targetUrl = data.url
      } else if (data.dealId) {
        targetUrl = `/customer?dealId=${data.dealId}`
      } else if (data.merchantId) {
        targetUrl = `/customer?merchantId=${data.merchantId}`
      } else {
        targetUrl = '/customer'
      }

      // Open or focus the app
      event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              client.focus()
              client.navigate(targetUrl)
              return
            }
          }
          
          // Open new window if app is not open
          if (clients.openWindow) {
            return clients.openWindow(targetUrl)
          }
        })
      )
      break
      
    case 'dismiss':
    default:
      // Just close the notification (already done above)
      break
  }
})

// Background sync (for offline notification tracking)
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag)
  
  if (event.tag === 'notification-tracking') {
    event.waitUntil(syncNotificationTracking())
  }
})

// Helper function to track notification delivery status
async function trackNotificationDelivery(notificationId, status, errorMessage = null) {
  try {
    const payload = {
      notificationId: parseInt(notificationId),
      status: status,
      timestamp: new Date().toISOString()
    }
    
    if (errorMessage) {
      payload.errorMessage = errorMessage
    }

    const response = await fetch('/api/admin/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      console.log(`📊 Notification tracking: ${status} for ID ${notificationId}`)
    } else {
      console.warn(`⚠️ Failed to track notification ${status}:`, response.status)
      
      // Store for background sync if online tracking fails
      const cache = await caches.open('tracking-cache')
      await cache.put(
        `tracking-${notificationId}-${Date.now()}`,
        new Response(JSON.stringify(payload))
      )
    }
  } catch (error) {
    console.error('❌ Notification tracking error:', error)
    
    // Store for background sync if network fails
    try {
      const cache = await caches.open('tracking-cache')
      await cache.put(
        `tracking-${notificationId}-${Date.now()}`,
        new Response(JSON.stringify({
          notificationId: parseInt(notificationId),
          status: status,
          timestamp: new Date().toISOString(),
          errorMessage: errorMessage
        }))
      )
    } catch (cacheError) {
      console.error('❌ Failed to cache tracking data:', cacheError)
    }
  }
}

// Sync cached notification tracking data
async function syncNotificationTracking() {
  try {
    const cache = await caches.open('tracking-cache')
    const requests = await cache.keys()
    
    for (const request of requests) {
      if (request.url.includes('tracking-')) {
        try {
          const response = await cache.match(request)
          const data = await response.json()
          
          const syncResponse = await fetch('/api/admin/notifications/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          
          if (syncResponse.ok) {
            await cache.delete(request)
            console.log('📤 Synced cached tracking data:', data.notificationId)
          }
        } catch (error) {
          console.warn('⚠️ Failed to sync tracking data:', error)
        }
      }
    }
  } catch (error) {
    console.error('❌ Background sync error:', error)
  }
}

// Message event - handle messages from the main thread
self.addEventListener('message', event => {
  console.log('📨 Service Worker received message:', event.data)
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: SW_VERSION })
        break
        
      case 'TEST_NOTIFICATION':
        self.registration.showNotification('단골 V2 테스트', {
          body: '서비스 워커가 정상적으로 작동합니다!',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'test-notification'
        })
        break
        
      default:
        console.log('Unknown message type:', event.data.type)
    }
  }
})

console.log(`🔧 Service Worker ${SW_VERSION} loaded and ready!`)