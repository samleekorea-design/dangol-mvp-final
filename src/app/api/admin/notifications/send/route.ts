import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { sendFCMV1Message, createFCMV1Message } from '@/lib/fcmV1Service'

interface NotificationRequest {
  title: string
  body: string
  icon?: string
  badge?: string
  targetType: 'all' | 'radius' | 'device' | 'merchant_customers'
  targetValue?: string
  merchantId?: number
  radiusLat?: number
  radiusLng?: number
  radiusMeters?: number
  data?: any
  scheduledAt?: string
  requireInteraction?: boolean
  silent?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const notificationData: NotificationRequest = await request.json()
    console.log('📤 Sending notification:', notificationData)

    // Create notification record in database
    const notification = db.createNotification({
      title: notificationData.title,
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: JSON.stringify(notificationData.data || {}),
      target_type: notificationData.targetType,
      target_value: notificationData.targetValue,
      merchant_id: notificationData.merchantId,
      radius_lat: notificationData.radiusLat,
      radius_lng: notificationData.radiusLng,
      radius_meters: notificationData.radiusMeters,
      created_by: 'admin',
      scheduled_at: notificationData.scheduledAt
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Failed to create notification record' },
        { status: 500 }
      )
    }

    // Get target devices based on targeting criteria
    let targetDeviceIds: string[] = []
    
    switch (notificationData.targetType) {
      case 'all':
        const allSubscriptions = db.getActivePushSubscriptions()
        targetDeviceIds = allSubscriptions.map(sub => sub.device_id)
        break
        
      case 'radius':
        if (notificationData.radiusLat && notificationData.radiusLng && notificationData.radiusMeters) {
          targetDeviceIds = db.getDevicesByLocation(
            notificationData.radiusLat,
            notificationData.radiusLng,
            notificationData.radiusMeters
          )
        }
        break
        
      case 'device':
        if (notificationData.targetValue) {
          targetDeviceIds = [notificationData.targetValue]
        }
        break
        
      case 'merchant_customers':
        if (notificationData.merchantId) {
          targetDeviceIds = db.getMerchantCustomerDevices(notificationData.merchantId)
        }
        break
    }

    console.log(`🎯 Targeting ${targetDeviceIds.length} devices`)

    // Update notification with recipient count
    db.updateNotificationStatus(notification.id, 'sending', {
      total_recipients: targetDeviceIds.length
    })

    // Send notifications
    const deliveryResults = await sendPushNotifications(
      notification.id,
      targetDeviceIds,
      {
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/badge-72x72.png',
        data: {
          ...notificationData.data,
          notificationId: notification.id.toString(),
          timestamp: new Date().toISOString()
        },
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false
      }
    )

    // Update notification status based on results
    const deliveredCount = deliveryResults.filter(r => r.success).length
    const failedCount = deliveryResults.filter(r => !r.success).length

    db.updateNotificationStatus(notification.id, 'sent', {
      total_delivered: deliveredCount,
      total_recipients: targetDeviceIds.length
    })

    console.log(`✅ Notification sent: ${deliveredCount} delivered, ${failedCount} failed`)

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      totalRecipients: targetDeviceIds.length,
      delivered: deliveredCount,
      failed: failedCount,
      results: deliveryResults
    })

  } catch (error) {
    console.error('❌ Notification send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

async function sendPushNotifications(
  notificationId: number,
  deviceIds: string[],
  payload: any
): Promise<Array<{ deviceId: string, success: boolean, error?: string }>> {
  const results: Array<{ deviceId: string, success: boolean, error?: string }> = []

  for (const deviceId of deviceIds) {
    try {
      // Get push subscription for device
      const subscription = db.getPushSubscription(deviceId)
      
      if (!subscription) {
        results.push({
          deviceId,
          success: false,
          error: 'No subscription found for device'
        })
        continue
      }

      // Create notification delivery record
      const delivery = db.createNotificationDelivery(
        notificationId,
        deviceId,
        subscription.endpoint
      )

      // Extract FCM registration token from endpoint
      // FCM endpoints have format: https://fcm.googleapis.com/fcm/send/{token}
      const tokenMatch = subscription.endpoint.match(/\/fcm\/send\/(.+)$/)
      if (!tokenMatch) {
        results.push({
          deviceId,
          success: false,
          error: 'Invalid FCM endpoint format'
        })
        continue
      }
      
      const registrationToken = tokenMatch[1]

      // Create FCM V1 message
      const fcmMessage = createFCMV1Message(registrationToken, {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        data: payload.data
      })

      // Send using FCM V1 API
      const result = await sendFCMV1Message(fcmMessage)

      if (result.success) {
        // Update delivery status to delivered
        if (delivery) {
          db.updateNotificationDeliveryStatus(delivery.id, 'delivered')
        }

        results.push({
          deviceId,
          success: true
        })

        console.log(`📱 FCM V1 notification sent to device ${deviceId}`)
      } else {
        // Update delivery status to failed
        if (delivery) {
          db.updateNotificationDeliveryStatus(delivery.id, 'failed', result.error)
        }

        results.push({
          deviceId,
          success: false,
          error: result.error
        })
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`❌ Failed to send FCM V1 to device ${deviceId}:`, errorMessage)

      // Update delivery status to failed
      const delivery = db.createNotificationDelivery(
        notificationId,
        deviceId,
        'unknown'
      )
      if (delivery) {
        db.updateNotificationDeliveryStatus(delivery.id, 'failed', errorMessage)
      }

      results.push({
        deviceId,
        success: false,
        error: errorMessage
      })
    }
  }

  return results
}