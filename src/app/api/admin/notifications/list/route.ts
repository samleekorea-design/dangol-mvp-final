import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log(`📋 Fetching notification list (limit: ${limit})`)

    // Get notifications from database
    const notifications = db.getNotifications(limit)

    // Enhance notifications with additional data
    const enhancedNotifications = notifications.map(notification => {
      const deliveryRate = notification.total_recipients > 0 
        ? Math.round((notification.total_delivered / notification.total_recipients) * 100)
        : 0

      const clickRate = notification.total_delivered > 0 
        ? Math.round((notification.total_clicked / notification.total_delivered) * 100)
        : 0

      return {
        ...notification,
        deliveryRate,
        clickRate,
        targetDescription: getTargetDescription(notification),
        source: getNotificationSource(notification.created_by),
        isAutomatic: notification.created_by === 'system_auto'
      }
    })

    return NextResponse.json({
      success: true,
      notifications: enhancedNotifications,
      total: notifications.length
    })

  } catch (error) {
    console.error('❌ Failed to fetch notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

function getTargetDescription(notification: any): string {
  switch (notification.target_type) {
    case 'all':
      return '모든 사용자'
    case 'radius':
      if (notification.radius_lat && notification.radius_lng && notification.radius_meters) {
        return `반경 ${notification.radius_meters}m 내 사용자`
      }
      return '위치 기반'
    case 'device':
      return `특정 기기 (${notification.target_value || 'Unknown'})`
    case 'merchant_customers':
      return `상점 고객 (ID: ${notification.merchant_id || 'Unknown'})`
    default:
      return '알 수 없음'
  }
}

function getNotificationSource(createdBy: string): string {
  switch (createdBy) {
    case 'system_auto':
      return '자동 (딜 생성)'
    case 'admin':
      return '수동 (관리자)'
    default:
      return createdBy || '알 수 없음'
  }
}