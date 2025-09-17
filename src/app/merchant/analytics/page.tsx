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
    <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="flex items-center text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-white">딜 분석</h1>
        </div>

        {loading ? (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            <div className="text-white text-lg">로딩 중...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold text-white">{analytics?.conversionRate}%</span>
                </div>
                <p className="text-sm text-white/70 mt-3">전환율</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold text-white">{analytics?.repeatCustomerRate}%</span>
                </div>
                <p className="text-sm text-white/70 mt-3">재방문율</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <Clock className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold text-white">{analytics?.peakHour}시</span>
                </div>
                <p className="text-sm text-white/70 mt-3">피크 시간</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-white/80" />
                  <span className="text-3xl font-bold text-white">{analytics?.avgTimeToRedeem}분</span>
                </div>
                <p className="text-sm text-white/70 mt-3">평균 사용시간</p>
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-6">인사이트</h2>
              <ul className="space-y-4 text-white/80">
                <li className="flex items-start">
                  <span className="text-white/60 mr-3">•</span>
                  <span>오후 {analytics?.peakHour}시에 가장 많은 고객이 딜을 클레임합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/60 mr-3">•</span>
                  <span>고객의 {analytics?.repeatCustomerRate}%가 재방문 고객입니다</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/60 mr-3">•</span>
                  <span>평균 {analytics?.avgTimeToRedeem}분 내에 딜을 사용합니다</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white/60 mr-3">•</span>
                  <span>전환율이 {analytics?.conversionRate}%로 업계 평균보다 높습니다</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
