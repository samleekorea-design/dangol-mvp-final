import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

interface TrackingRequest {
  notificationId: number
  status: 'delivered' | 'clicked' | 'failed'
  errorMessage?: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const trackingData: TrackingRequest = await request.json()
    console.log('📊 Tracking notification interaction:', trackingData)

    const { notificationId, status, errorMessage } = trackingData

    // Find the notification delivery record
    // Note: We would need the device ID to find the exact delivery record
    // For now, we'll update the notification aggregates
    
    if (status === 'clicked') {
      // Update notification click count
      const notification = db.getNotification(notificationId)
      if (notification) {
        db.updateNotificationStatus(notificationId, notification.status, {
          total_clicked: notification.total_clicked + 1
        })
        console.log(`👆 Notification ${notificationId} click tracked`)
      }
    } else if (status === 'failed') {
      // Update notification failure count if needed
      console.log(`❌ Notification ${notificationId} failure tracked: ${errorMessage}`)
    } else if (status === 'delivered') {
      console.log(`✅ Notification ${notificationId} delivery confirmed`)
    }

    return NextResponse.json({
      success: true,
      message: `Tracking data recorded for notification ${notificationId}`
    })

  } catch (error) {
    console.error('❌ Notification tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track notification' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve tracking data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('notificationId')

    if (notificationId) {
      // Get specific notification tracking data
      const notification = db.getNotification(parseInt(notificationId))
      const deliveries = db.getNotificationDeliveries(parseInt(notificationId))

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        notification,
        deliveries,
        analytics: {
          totalRecipients: notification.total_recipients,
          totalDelivered: notification.total_delivered,
          totalClicked: notification.total_clicked,
          deliveryRate: notification.total_recipients > 0 
            ? (notification.total_delivered / notification.total_recipients) * 100 
            : 0,
          clickRate: notification.total_delivered > 0 
            ? (notification.total_clicked / notification.total_delivered) * 100 
            : 0
        }
      })
    } else {
      // Get overall notification analytics
      const analytics = db.getNotificationAnalytics()
      return NextResponse.json({
        success: true,
        analytics
      })
    }

  } catch (error) {
    console.error('❌ Notification analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get tracking data' },
      { status: 500 }
    )
  }
}