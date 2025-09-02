'use client'

import { useState, useEffect } from 'react'
import { DataSourceIndicator } from './DataSourceIndicator'

interface NotificationAnalytics {
  totalNotifications: number
  totalDeliveries: number
  totalClicked: number
  totalFailed: number
  clickRate: number
  deliveryRate: number
  recentNotifications: Array<{
    id: number
    title: string
    target_type: string
    total_recipients: number
    total_delivered: number
    total_clicked: number
    created_at: string
    sent_at: string
    status: string
    source?: string
    isAutomatic?: boolean
  }>
}

interface NotificationAnalyticsProps {
  data?: NotificationAnalytics
}

export const NotificationAnalytics: React.FC<NotificationAnalyticsProps> = ({ data: propData }) => {
  const [data, setData] = useState<NotificationAnalytics>(propData || {
    totalNotifications: 0,
    totalDeliveries: 0,
    totalClicked: 0,
    totalFailed: 0,
    clickRate: 0,
    deliveryRate: 0,
    recentNotifications: []
  })
  const [isLoading, setIsLoading] = useState(!propData)

  useEffect(() => {
    if (!propData) {
      fetchNotificationAnalytics()
    }
  }, [propData])

  const fetchNotificationAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/notifications/track')
      const result = await response.json()
      
      if (result.success) {
        setData(result.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch notification analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'sending':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'all':
        return '전체'
      case 'radius':
        return '위치'
      case 'device':
        return '기기'
      case 'merchant_customers':
        return '고객'
      default:
        return '기타'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">알림 분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">푸시 알림 분석</h3>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-sm text-gray-500">알림 성과 추적</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Key Metrics */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">핵심 지표</h4>
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-900">{data.totalNotifications}</div>
              <div className="text-sm text-blue-700">총 알림 수</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-900">{data.totalDeliveries}</div>
              <div className="text-sm text-green-700">총 전송 수</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-900">{data.totalClicked}</div>
              <div className="text-sm text-purple-700">총 클릭 수</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-900">{data.totalFailed}</div>
              <div className="text-sm text-red-700">전송 실패</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">전송 성공률</span>
                <span className="text-sm font-bold text-green-600">{data.deliveryRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(data.deliveryRate, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">클릭률</span>
                <span className="text-sm font-bold text-purple-600">{data.clickRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(data.clickRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-2">성과 분석</h5>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                • 평균 전송 성공률: {data.deliveryRate.toFixed(1)}% 
                {data.deliveryRate >= 90 ? ' (우수)' : data.deliveryRate >= 70 ? ' (양호)' : ' (개선 필요)'}
              </div>
              <div>
                • 평균 클릭률: {data.clickRate.toFixed(1)}%
                {data.clickRate >= 15 ? ' (우수)' : data.clickRate >= 5 ? ' (양호)' : ' (개선 필요)'}
              </div>
              <div>
                • 실패 알림: {data.totalFailed}개
                {data.totalFailed === 0 ? ' (안정적)' : data.totalFailed < 10 ? ' (양호)' : ' (점검 필요)'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">최근 알림 현황</h4>
          
          {data.recentNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
              </svg>
              <p>최근 전송된 알림이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.recentNotifications.map((notification) => {
                const deliveryRate = notification.total_recipients > 0 
                  ? (notification.total_delivered / notification.total_recipients) * 100 
                  : 0
                const clickRate = notification.total_delivered > 0 
                  ? (notification.total_clicked / notification.total_delivered) * 100 
                  : 0

                return (
                  <div key={notification.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">
                        {notification.title}
                      </h5>
                      <div className="flex items-center space-x-2">
                        {notification.source && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.isAutomatic 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {notification.source}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                          {getTargetTypeLabel(notification.target_type)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{notification.total_recipients}</div>
                        <div className="text-gray-500">대상</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{notification.total_delivered}</div>
                        <div className="text-gray-500">전송</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{notification.total_clicked}</div>
                        <div className="text-gray-500">클릭</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{clickRate.toFixed(1)}%</div>
                        <div className="text-gray-500">CTR</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      {formatDate(notification.sent_at || notification.created_at)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}