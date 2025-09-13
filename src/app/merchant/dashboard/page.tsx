'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode } from 'lucide-react'
import { getKoreanTime, formatKoreanTime, isDealExpired } from '@/lib/timezoneUtils'

interface Deal {
  id: number
  title: string
  description: string
  expires_at: string
  max_claims: number
  current_claims: number
  created_at: string
}

export default function MerchantDashboard() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [merchantId, setMerchantId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showExpiredDeals, setShowExpiredDeals] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTimeOption: '지금 시작', // '지금 시작', '30분 후', '1시간 후', '특정 시간 선택'
    customStartTime: '',
    endTimeOption: 'duration', // 'duration' or 'specific'
    hours: '',
    minutes: '',
    customEndTime: '',
    maxClaims: ''
  })

  useEffect(() => {
    // Check for merchant session/authentication
    const storedMerchant = localStorage.getItem('merchant')
    if (storedMerchant) {
      try {
        const merchant = JSON.parse(storedMerchant)
        if (merchant.id) {
          setMerchantId(merchant.id)
          setIsAuthenticated(true)
          fetchDeals(merchant.id)
        } else {
          redirectToLogin()
        }
      } catch (error) {
        redirectToLogin()
      }
    } else {
      redirectToLogin()
    }
  }, [])

  const redirectToLogin = () => {
    setErrors(['Please log in to access the dashboard'])
    // In a real app, you would redirect to login page
    // window.location.href = '/merchant/login'
  }

  const fetchDeals = async (currentMerchantId?: number) => {
    const idToUse = currentMerchantId || merchantId
    if (!idToUse) return

    try {
      const response = await fetch(`/api/merchants/deals?merchantId=${idToUse}`)
      const data = await response.json()
      if (data.success) {
        setDeals(data.deals)
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
    }
  }

  // Helper to format datetime-local value
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Helper to get minimum datetime (current time)
  const getMinDateTime = () => {
    return formatDateTimeLocal(new Date())
  }

  const calculateStartTime = () => {
    const now = new Date()
    
    switch (formData.startTimeOption) {
      case '지금 시작':
        return now
      case '30분 후':
        return new Date(now.getTime() + 30 * 60 * 1000)
      case '1시간 후':
        return new Date(now.getTime() + 60 * 60 * 1000)
      case '특정 시간 선택':
        return new Date(formData.customStartTime)
      default:
        return now
    }
  }

  const calculateEndTime = (startTime: Date) => {
    if (formData.endTimeOption === 'specific') {
      return new Date(formData.customEndTime)
    } else {
      const hours = formData.hours === '' ? 0 : Number(formData.hours)
      const minutes = formData.minutes === '' ? 0 : Number(formData.minutes)
      return new Date(startTime.getTime() + (hours * 60 + minutes) * 60 * 1000)
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.title.trim()) newErrors.push('혜택 제목을 입력해주세요')
    if (!formData.description.trim()) newErrors.push('설명을 입력해주세요')
    
    // Validate start time
    if (formData.startTimeOption === '특정 시간 선택' && !formData.customStartTime) {
      newErrors.push('시작 시간을 선택해주세요')
    }
    
    // Validate end time
    if (formData.endTimeOption === 'duration') {
      const hours = formData.hours === '' ? 0 : Number(formData.hours)
      const minutes = formData.minutes === '' ? 0 : Number(formData.minutes)
      
      if (hours < 0 || hours > 23) {
        newErrors.push('시간은 0-23 사이여야 합니다')
      }
      if (minutes < 0 || minutes > 59) {
        newErrors.push('분은 0-59 사이여야 합니다')
      }
      if (hours === 0 && minutes === 0) {
        newErrors.push('최소 1분 이상의 유효 시간이 필요합니다')
      }
    } else if (formData.endTimeOption === 'specific' && !formData.customEndTime) {
      newErrors.push('종료 시간을 선택해주세요')
    }
    
    if (!formData.maxClaims || Number(formData.maxClaims) < 1) {
      newErrors.push('최대 사용자 수는 1명 이상이어야 합니다')
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])
    setMessage('')

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {
      const startTime = calculateStartTime()
      const endTime = calculateEndTime(startTime)
      
      const response = await fetch('/api/merchants/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantId: merchantId!,
          title: formData.title,
          description: formData.description,
          starts_at: startTime.toISOString(),
          expires_at: endTime.toISOString(),
          maxClaims: Number(formData.maxClaims)
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Deal created successfully!')
        setFormData({
          title: '',
          description: '',
          startTimeOption: '지금 시작',
          customStartTime: '',
          endTimeOption: 'duration',
          hours: '',
          minutes: '',
          customEndTime: '',
          maxClaims: ''
        })
        setShowForm(false)
        fetchDeals() // Refresh deals list
      } else {
        setErrors([data.error || 'Failed to create deal'])
      }
    } catch (error) {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }


  const formatDate = (dateString: string) => {
    // All deals are stored as UTC, parse as UTC and format in Korean timezone
    const date = new Date(dateString)
    return formatKoreanTime(date)
  }

  const totalDeals = deals.length
  const activeDealsList = deals.filter(deal => !isDealExpired(deal.id, deal.expires_at))
  const expiredDealsList = deals.filter(deal => isDealExpired(deal.id, deal.expires_at))
  const activeDeals = activeDealsList.length
  const totalClaims = deals.reduce((sum, deal) => sum + deal.current_claims, 0)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF]">
        
        <div className="max-w-[375px] mx-auto px-6 py-8">
          {/* Logo - Top Left */}
          <div className="flex justify-start mb-6 w-full">
            <img 
              src="/images/logo-white.png" 
              alt="Dangol Logo" 
              className="h-8 w-auto opacity-90"
            />
          </div>
          
          <div className="text-center mb-8 w-full">
            <h1 className="text-3xl font-light text-white mb-2">인증 필요</h1>
            <p className="text-sm text-white/80">대시보드에 접근하려면 로그인이 필요합니다</p>
          </div>
          
          {errors.length > 0 && (
            <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3 mb-4">
              {errors.map((error, index) => (
                <p key={index} className="text-red-100 text-sm">{error}</p>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <a
              href="/merchant/login"
              className="inline-block bg-white text-blue-600 font-light py-3 px-6 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300"
            >
              로그인하기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF]">
      
      <div className="max-w-[375px] mx-auto px-6 py-8">
        {/* Logo - Top Left */}
        <div className="flex justify-start mb-6 w-full">
          <a href="/">
            <img 
              src="/images/logo-white.png" 
              alt="Dangol Logo" 
              className="h-8 w-auto opacity-90"
            />
          </a>
        </div>
        
        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-light text-white mb-2">대시보드</h1>
          <p className="text-sm text-white/80">혜택 관리 및 분석 현황</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-3 gap-2 mb-8 w-full">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-center">
            <p className="text-xl font-light text-white mb-1">{totalDeals}</p>
            <h3 className="text-xs font-light text-white/80">전체 혜택</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-center">
            <p className="text-xl font-light text-green-200 mb-1">{activeDeals}</p>
            <h3 className="text-xs font-light text-white/80">활성 혜택</h3>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 text-center">
            <p className="text-xl font-light text-blue-200 mb-1">{totalClaims}</p>
            <h3 className="text-xs font-light text-white/80">총 사용 횟수</h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 w-full space-y-3">
          <button
            onClick={() => fetchDeals()}
            className="w-full bg-blue-500 text-white font-light py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300"
          >
            새로고침
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300"
          >
            {showForm ? '취소' : '새 행사 만들기'}
          </button>
          <button
            onClick={() => router.push('/merchant/scan')}
            className="w-full bg-white border-2 border-purple-600 text-purple-600 font-light py-3 px-4 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            QR 스캔하기
          </button>
        </div>

        {/* Create Deal Form */}
        {showForm && (
          <div className="bg-blue-700/30 backdrop-blur-sm p-6 rounded-lg border border-blue-500/40 mb-8 w-full">
            <h2 className="text-xl font-light text-white mb-4">새 혜택 만들기</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-light text-white mb-2">
                  혜택 제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                  placeholder="혜택 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-light text-white mb-2">
                  설명 *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60 resize-none"
                  placeholder="혜택 설명을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-light text-white mb-2">
                  시작 시간 *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {['지금 시작', '30분 후', '1시간 후', '특정 시간 선택'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({...formData, startTimeOption: option})}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.startTimeOption === option
                          ? 'bg-white text-blue-600'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {formData.startTimeOption === '특정 시간 선택' && (
                  <div className="mb-4">
                    <label htmlFor="customStartTime" className="block text-sm font-light text-white mb-2">
                      시작 날짜 및 시간
                    </label>
                    <input
                      type="datetime-local"
                      id="customStartTime"
                      name="customStartTime"
                      value={formData.customStartTime}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-lg rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                      min={getMinDateTime()}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-light text-white mb-2">
                  종료 시간 *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, endTimeOption: 'duration'})}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.endTimeOption === 'duration'
                        ? 'bg-white text-blue-600'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    유효 기간
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, endTimeOption: 'specific'})}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      formData.endTimeOption === 'specific'
                        ? 'bg-white text-blue-600'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    특정 시간까지
                  </button>
                </div>
                
                {formData.endTimeOption === 'duration' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hours" className="block text-xs font-light text-white/80 mb-1">
                      시간 (0-23)
                    </label>
                    <input
                      type="number"
                      id="hours"
                      name="hours"
                      min="0"
                      max="23"
                      value={formData.hours}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                      placeholder="시간"
                    />
                  </div>
                  <div>
                    <label htmlFor="minutes" className="block text-xs font-light text-white/80 mb-1">
                      분 (0-59)
                    </label>
                    <input
                      type="number"
                      id="minutes"
                      name="minutes"
                      min="0"
                      max="59"
                      value={formData.minutes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                      placeholder="분"
                    />
                  </div>
                </div>
                )}
                
                {formData.endTimeOption === 'specific' && (
                  <div>
                    <label htmlFor="customEndTime" className="block text-sm font-light text-white mb-2">
                      종료 날짜 및 시간
                    </label>
                    <input
                      type="datetime-local"
                      id="customEndTime"
                      name="customEndTime"
                      value={formData.customEndTime}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-lg rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                      min={getMinDateTime()}
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="maxClaims" className="block text-sm font-light text-white mb-2">
                  최대 사용자 수 *
                </label>
                <input
                  type="number"
                  id="maxClaims"
                  name="maxClaims"
                  min="1"
                  value={formData.maxClaims}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                  placeholder="인원"
                  required
                />
              </div>

              {errors.length > 0 && (
                <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-100 text-sm">{error}</p>
                  ))}
                </div>
              )}

              {message && (
                <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-3">
                  <p className="text-green-100 text-sm">{message}</p>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? '만드는 중...' : '혜택 만들기'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Deals Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 w-full mb-6">
          <div className="px-6 py-4 border-b border-white/20">
            <h2 className="text-xl font-light text-white">현재 진행중인 행사</h2>
            <p className="text-sm text-white/70 mt-1">{activeDeals}개의 활성 혜택</p>
          </div>
        
          {activeDealsList.length === 0 ? (
            <div className="px-6 py-8 text-center text-white/80">
              현재 활성 중인 혜택이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {activeDealsList.map((deal) => (
                <div key={deal.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-white mb-1">
                        {deal.title}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/30 text-green-200">
                          활성
                        </span>
                      </h3>
                      <p className="text-white/80 mb-2">{deal.description}</p>
                      <div className="text-sm text-white/60">
                        <p>사용: {deal.current_claims} / {deal.max_claims}</p>
                        <p>만료: {formatDate(deal.expires_at)}</p>
                        <p>생성: {formatDate(deal.created_at)}</p>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm font-light text-white/80">
                        #{deal.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expired Deals Section */}
        {expiredDealsList.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 w-full">
            <button
              onClick={() => setShowExpiredDeals(!showExpiredDeals)}
              className="w-full px-6 py-4 border-b border-white/20 text-left hover:bg-white/5 transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-light text-white">만료된 행사</h2>
                  <p className="text-sm text-white/70 mt-1">{expiredDealsList.length}개의 만료된 혜택</p>
                </div>
                <div className="text-white/70">
                  {showExpiredDeals ? (
                    <svg className="w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          
            {showExpiredDeals && (
              <div className="divide-y divide-white/20">
                {expiredDealsList.map((deal) => (
                  <div key={deal.id} className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-light text-white mb-1">
                          {deal.title}
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/30 text-gray-300">
                            만료
                          </span>
                        </h3>
                        <p className="text-white/80 mb-2">{deal.description}</p>
                        <div className="text-sm text-white/60">
                          <p>사용: {deal.current_claims} / {deal.max_claims}</p>
                          <p>만료: {formatDate(deal.expires_at)}</p>
                          <p>생성: {formatDate(deal.created_at)}</p>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-light text-white/80">
                          #{deal.id}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No deals message */}
        {deals.length === 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 w-full">
            <div className="px-6 py-8 text-center text-white/80">
              아직 만들어진 혜택이 없습니다. 첫 번째 혜택을 만들어보세요!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}