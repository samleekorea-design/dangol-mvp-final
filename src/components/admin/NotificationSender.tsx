'use client'

import { useState, useEffect } from 'react'
import { DataSourceIndicator } from './DataSourceIndicator'

interface Merchant {
  id: number
  business_name: string
  address: string
  latitude: number
  longitude: number
}

interface NotificationForm {
  title: string
  body: string
  targetType: 'all' | 'radius' | 'device' | 'merchant_customers'
  targetValue?: string
  merchantId?: number
  radiusLat?: number
  radiusLng?: number
  radiusMeters?: number
  requireInteraction: boolean
  silent: boolean
}

interface NotificationHistory {
  id: number
  title: string
  targetDescription: string
  total_recipients: number
  total_delivered: number
  total_clicked: number
  deliveryRate: number
  clickRate: number
  created_at: string
  status: string
  source: string
  isAutomatic: boolean
}

export const NotificationSender: React.FC = () => {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    body: '',
    targetType: 'all',
    radiusMeters: 500,
    requireInteraction: false,
    silent: false
  })
  
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([])

  // Load merchants and notification history
  useEffect(() => {
    loadMerchants()
    loadNotificationHistory()
  }, [])

  const loadMerchants = async () => {
    try {
      // In a real implementation, this would fetch from an API
      setMerchants([
        { id: 1, business_name: '카페 단골', address: '강남구 역삼동', latitude: 37.5, longitude: 127.0 },
        { id: 2, business_name: '단골 피자', address: '서초구 서초동', latitude: 37.48, longitude: 127.02 }
      ])
    } catch (error) {
      console.error('Failed to load merchants:', error)
    }
  }

  const loadNotificationHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/notifications/list?limit=10')
      const data = await response.json()
      
      if (data.success) {
        setNotificationHistory(data.notifications)
      }
    } catch (error) {
      console.error('Failed to load notification history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsSending(true)

    if (!form.title.trim() || !form.body.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      setIsSending(false)
      return
    }

    try {
      const response = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          targetType: form.targetType,
          targetValue: form.targetValue,
          merchantId: form.merchantId,
          radiusLat: form.radiusLat,
          radiusLng: form.radiusLng,
          radiusMeters: form.radiusMeters,
          requireInteraction: form.requireInteraction,
          silent: form.silent,
          data: {
            timestamp: new Date().toISOString(),
            source: 'admin'
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`알림이 성공적으로 전송되었습니다! (${result.delivered}/${result.totalRecipients} 전송 완료)`)
        setForm({
          title: '',
          body: '',
          targetType: 'all',
          radiusMeters: 500,
          requireInteraction: false,
          silent: false
        })
        // Reload notification history
        loadNotificationHistory()
      } else {
        setError(result.error || '알림 전송에 실패했습니다.')
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleTargetTypeChange = (targetType: NotificationForm['targetType']) => {
    setForm(prev => ({
      ...prev,
      targetType,
      targetValue: undefined,
      merchantId: undefined,
      radiusLat: undefined,
      radiusLng: undefined
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">푸시 알림 보내기</h3>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5l-5-5h5v-12" />
          </svg>
          <span className="text-sm text-gray-500">사용자에게 알림 전송</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Notification Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 제목 *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 새로운 할인 혜택이 있어요!"
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">{form.title.length}/100</div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 내용 *
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 근처 카페에서 20% 할인 혜택을 놓치지 마세요!"
                rows={3}
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1">{form.body.length}/300</div>
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대상 선택
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: '모든 사용자', description: '앱을 설치한 모든 사용자에게' },
                  { value: 'radius', label: '위치 기반', description: '특정 위치 반경 내 사용자에게' },
                  { value: 'merchant_customers', label: '상점 고객', description: '특정 상점의 고객들에게' },
                  { value: 'device', label: '특정 기기', description: '개발/테스트용' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start">
                    <input
                      type="radio"
                      name="targetType"
                      value={option.value}
                      checked={form.targetType === option.value}
                      onChange={(e) => handleTargetTypeChange(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5"
                    />
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Target Options */}
            {form.targetType === 'radius' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">위도</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.radiusLat || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, radiusLat: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="37.5665"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">경도</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.radiusLng || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, radiusLng: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="126.9780"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    반경 (미터): {form.radiusMeters}m
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={form.radiusMeters || 500}
                    onChange={(e) => setForm(prev => ({ ...prev, radiusMeters: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>100m</span>
                    <span>5km</span>
                  </div>
                </div>
              </div>
            )}

            {form.targetType === 'merchant_customers' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상점 선택</label>
                <select
                  value={form.merchantId || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, merchantId: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">상점을 선택하세요</option>
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.business_name} - {merchant.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.targetType === 'device' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기기 ID</label>
                <input
                  type="text"
                  value={form.targetValue || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, targetValue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="device-abc123..."
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.requireInteraction}
                  onChange={(e) => setForm(prev => ({ ...prev, requireInteraction: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900">사용자 응답 필요</div>
                  <div className="text-xs text-gray-500">사용자가 직접 알림을 닫아야 함</div>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.silent}
                  onChange={(e) => setForm(prev => ({ ...prev, silent: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-900">무음 알림</div>
                  <div className="text-xs text-gray-500">소리나 진동 없이 전송</div>
                </div>
              </label>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending || !form.title.trim() || !form.body.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  전송 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  알림 보내기
                </>
              )}
            </button>
          </form>
        </div>

        {/* Notification History */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">최근 전송 기록</h4>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">기록을 불러오는 중...</div>
          ) : notificationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">전송 기록이 없습니다</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notificationHistory.map((notification) => (
                <div key={notification.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900 text-sm">{notification.title}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        notification.isAutomatic 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {notification.source}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-3">{notification.targetDescription}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{notification.total_recipients}</div>
                      <div className="text-gray-500">대상</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{notification.deliveryRate}%</div>
                      <div className="text-gray-500">전송률</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{notification.clickRate}%</div>
                      <div className="text-gray-500">클릭률</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}