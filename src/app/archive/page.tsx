'use client'

import { useState, useEffect } from 'react'

interface ArchivedDeal {
  id: number
  merchant_id: number
  title: string
  description: string
  expires_at: string
  merchant: {
    business_name: string
  }
}

export default function ArchivePage() {
  const [deals, setDeals] = useState<ArchivedDeal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchArchivedDeals = async () => {
      try {
        const response = await fetch('/api/archive/deals')
        if (response.ok) {
          const data = await response.json()
          setDeals(data.deals || [])
        } else {
          setError('Failed to load archived deals')
        }
      } catch (err) {
        setError('Network error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArchivedDeals()
  }, [])

  const formatExpiredTime = (expiresAt: string) => {
    const expiredDate = new Date(expiresAt)
    const now = new Date()
    const diffInMs = now.getTime() - expiredDate.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes < 1 ? '방금 종료' : `${diffInMinutes}분 전 종료`
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전 종료`
    } else if (diffInDays === 1) {
      return '어제 종료'
    } else if (diffInDays === 2) {
      return '그저께 종료'
    } else {
      return `${diffInDays}일 전 종료`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">혜택 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_#65BBFF_0%,_#3A82FF_25%,_#2570EA_50%,_#1857C7_100%)]">
      
      <div className="max-w-[375px] mx-auto px-6 py-8">
        {/* Back Button - Top Left */}
        <div className="flex justify-start mb-6 w-full">
          <a href="/customer">
            <svg 
              className="h-8 w-auto opacity-90 text-white hover:opacity-100 transition-opacity duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8 w-full">
          <div className="mb-2">
            <h1 className="text-4xl font-light text-white">최근 3일간 놓친 혜택</h1>
          </div>
          <p className="text-base text-white/80">
            {deals.length > 0 
              ? `${deals.length}개의 종료된 혜택이 있습니다` 
              : '최근 3일간 종료된 혜택이 없습니다'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3 mb-4 w-full">
            <p className="text-red-100 text-base">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-white/80">혜택 정보를 불러오는 중...</div>
          </div>
        )}

        {/* Deals List */}
        <div className="w-full">
          {!isLoading && deals.length === 0 && (
            <div className="text-center py-8 text-white/80">
              <p className="text-xl mb-2 font-light">최근 3일간 종료된 혜택이 없습니다</p>
              <p className="text-base mb-6">새로운 혜택들을 확인해 보세요</p>
              <a
                href="/customer"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200"
              >
                현재 혜택 보러가기
              </a>
            </div>
          )}

          <div className="space-y-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative opacity-75"
              >
                {/* Expired Badge */}
                <div className="absolute top-3 right-3">
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                    종료됨
                  </span>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon Circle */}
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 pr-16">
                      <h3 className="text-xl font-medium text-gray-700 mb-1">
                        {deal.title}
                      </h3>
                      <p className="text-base text-gray-500 mb-2 line-clamp-3">{deal.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-base text-gray-400 space-y-1 pl-13">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="font-medium text-base text-gray-500">{deal.merchant.business_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400">{formatExpiredTime(deal.expires_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back to current deals */}
          {deals.length > 0 && (
            <div className="mt-8 text-center">
              <a
                href="/customer"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors duration-200"
              >
                현재 혜택 보러가기
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}