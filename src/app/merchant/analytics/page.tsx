'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, Users, Clock, DollarSign } from 'lucide-react'

export default function MerchantAnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const merchantId = localStorage.getItem('merchantId')

      if (!merchantId) {
        router.push('/merchant/login')
        return
      }

      try {
        const response = await fetch(`/api/merchant/analytics?merchantId=${merchantId}`)
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          console.error('Failed to fetch analytics')
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center text-gray-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            돌아가기
          </button>
          <h1 className="text-2xl font-bold">딜 분석</h1>
        </div>

        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold">{analytics.conversionRate}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">전환율</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-green-500" />
                  <span className="text-2xl font-bold">{analytics.repeatCustomerRate}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">재방문율</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <Clock className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold">{analytics.peakHour}시</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">피크 시간</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                  <span className="text-2xl font-bold">{analytics.avgTimeToRedeem}분</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">평균 사용시간</p>
              </div>
            </div>


            {/* Insights */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-bold mb-4">인사이트</h2>
              <ul className="space-y-2 text-sm">
                <li>• 오후 {analytics.peakHour}시에 가장 많은 고객이 딜을 클레임합니다</li>
                <li>• 고객의 {analytics.repeatCustomerRate}%가 재방문 고객입니다</li>
                <li>• 평균 {analytics.avgTimeToRedeem}분 내에 딜을 사용합니다</li>
                <li>• 전환율이 {analytics.conversionRate}%로 업계 평균보다 높습니다</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
