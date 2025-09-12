'use client'

import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { deviceFingerprint } from '@/lib/deviceFingerprint'
import { getKoreanTime, formatKoreanTime, isDealExpired } from '@/lib/timezoneUtils'
import { requestNotificationPermission, getFCMToken } from '@/lib/firebase-client'


interface Deal {
  id: number
  title: string
  description: string
  expires_at: string
  max_claims: number
  current_claims: number
  merchant_name: string
  merchant_address: string
  latitude: number
  longitude: number
  claimed?: boolean
  claimCode?: string
  claimExpiry?: string
}

export default function CustomerPage() {
  console.log('🚀🚀🚀 CustomerPage MOUNTING')
  const [deals, setDeals] = useState<Deal[]>([])
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [radius, setRadius] = useState(200)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [deviceId, setDeviceId] = useState<string>('')
  const [claimedDeals, setClaimedDeals] = useState<Record<number, {code: string, expiry: string}>>({})
  const [updateCounter, setUpdateCounter] = useState(0)

  // Dynamic time updates - refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateCounter(prev => prev + 1)
    }, 60000) // Update every 60 seconds

    return () => clearInterval(interval)
  }, [])

  // Load claimed deals from localStorage
  useEffect(() => {
    const savedClaims = localStorage.getItem('claimedDeals')
    if (savedClaims) {
      const claims = JSON.parse(savedClaims)
      // Filter out expired claims
      const now = new Date()
      const validClaims = Object.fromEntries(
        Object.entries(claims).filter(([_, claim]: any) => new Date(claim.expiry) > now)
      )
      setClaimedDeals(validClaims)
      if (Object.keys(validClaims).length !== Object.keys(claims).length) {
        localStorage.setItem('claimedDeals', JSON.stringify(validClaims))
      }
    }
  }, [])

  // Save claimed deals to localStorage
  const saveClaimedDeal = (dealId: number, claimCode: string) => {
    const expiry = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    const newClaim = { code: claimCode, expiry: expiry.toISOString() }
    const updatedClaims = { ...claimedDeals, [dealId]: newClaim }
    setClaimedDeals(updatedClaims)
    localStorage.setItem('claimedDeals', JSON.stringify(updatedClaims))
  }

  console.log('🚀 CustomerPage: Component initialized, initial location:', location)

  // Initialize device ID
  useEffect(() => {
    const initializeDeviceId = async () => {
      try {
        const id = await deviceFingerprint.getDeviceId().catch(() => {
          return 'device_' + Math.random().toString(36).substr(2, 9)
        })
        console.log('🔐 CustomerPage: Device ID initialized:', id)
        setDeviceId(id)
      } catch (error) {
        console.error('❌ CustomerPage: Failed to initialize device ID:', error)
        // Fallback to random ID if fingerprinting fails
        const fallbackId = 'device-' + Math.random().toString(36).substr(2, 9)
        setDeviceId(fallbackId)
      }
    }
    initializeDeviceId()
  }, [])

  useEffect(() => {
    if (deviceId) {
      console.log('🎯 CustomerPage: Device ID ready, calling requestLocation()')
      requestLocation()
    }
  }, [deviceId])

  // Handle FCM subscription
  useEffect(() => {
    const handleFCMSubscription = async () => {
      console.log('Device ID:', deviceId)
      console.log('Location:', location)
      console.log('Starting FCM subscription...')
      if (!location) return

      try {
        console.log('Checking notification permission...')
        const hasPermission = await requestNotificationPermission()
        
        if (hasPermission) {
          console.log('Notification permission granted, generating FCM token...')
          const fcmToken = await getFCMToken()
          
          if (fcmToken) {
            console.log('FCM Token:', fcmToken)
            console.log('FCM token generated successfully, making API call...')
            const response = await fetch('/api/customers/subscriptions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                deviceId: deviceId, 
                subscription: { 
                  endpoint: 'FCM', 
                  keys: { 
                    auth: fcmToken, 
                    p256dh: 'FCM' 
                  } 
                } 
              }),
            })

            const data = await response.json()
            if (data.success) {
              console.log('✅ CustomerPage: Successfully subscribed for notifications')
            } else {
              console.error('❌ CustomerPage: Subscription failed:', data.error)
            }
          } else {
            console.log('❌ CustomerPage: Failed to get FCM token')
          }
        } else {
          console.log('❌ CustomerPage: Notification permission denied')
        }
      } catch (error) {
        console.error('❌ CustomerPage: FCM subscription error:', error)
        console.error('FCM subscription error details:', (error as Error).message)
      }
    }

    handleFCMSubscription()
  }, [location])

  const requestLocation = () => {
    console.log('📍 CustomerPage: requestLocation() called')
    if ('geolocation' in navigator) {
      console.log('✅ CustomerPage: Geolocation available, requesting position...')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          console.log('📍 CustomerPage: Geolocation success, new location:', newLocation)
          setLocation(newLocation)
          fetchDeals(newLocation.lat, newLocation.lng, radius)
        },
        (error) => {
          console.error('❌ CustomerPage: Geolocation error:', error)
          console.log('Using default test location')
          const defaultLocation = {
            lat: 37.4822,
            lng: 127.0575
          }
          console.log('📍 CustomerPage: Using fallback location:', defaultLocation)
          setLocation(defaultLocation)
          fetchDeals(defaultLocation.lat, defaultLocation.lng, radius)
        },
        {
          timeout: 5000
        }
      )
    } else {
      console.log('❌ CustomerPage: Geolocation not supported by browser')
      console.log('Using default test location')
      const defaultLocation = {
        lat: 37.4822,
        lng: 127.0575
      }
      console.log('📍 CustomerPage: Using fallback location:', defaultLocation)
      setLocation(defaultLocation)
      fetchDeals(defaultLocation.lat, defaultLocation.lng, radius)
    }
  }

  const fetchClaimedDeals = async (deviceId: string) => {
    try {
      console.log('🔍 CustomerPage: Fetching claimed deals for device:', deviceId)
      const response = await fetch(`/api/customers/claims/device/${deviceId}`)
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ CustomerPage: Successfully fetched', data.claimedDeals.length, 'claimed deals')
        // Convert server data to match our localStorage format
        const claimedDealsMap: {[dealId: number]: {code: string, expiry: string}} = {}
        data.claimedDeals.forEach((claim: any) => {
          claimedDealsMap[claim.dealId] = {
            code: claim.claimCode,
            expiry: claim.expiresAt
          }
        })
        
        // Merge with localStorage claims and update state
        const mergedClaims = { ...claimedDeals, ...claimedDealsMap }
        setClaimedDeals(mergedClaims)
        localStorage.setItem('claimedDeals', JSON.stringify(mergedClaims))
        
        return claimedDealsMap
      } else {
        console.log('❌ CustomerPage: Error fetching claimed deals:', data.error)
        return {}
      }
    } catch (error) {
      console.error('❌ CustomerPage: Network error fetching claimed deals:', error)
      return {}
    }
  }

  const fetchDeals = async (lat: number, lng: number, searchRadius: number) => {
    console.log('🌐 CustomerPage: fetchDeals() called with coordinates:', { lat, lng, searchRadius })
    setIsLoading(true)
    try {
      // Fetch both deals and claimed deals in parallel
      const [dealsResponse, serverClaimedDeals] = await Promise.all([
        fetch(`/api/customers/deals?lat=${lat}&lng=${lng}&radius=${searchRadius}`),
        deviceId ? fetchClaimedDeals(deviceId) : Promise.resolve({})
      ])
      
      const dealsData = await dealsResponse.json()
      console.log('📊 CustomerPage: API response received:', dealsData)
      
      if (dealsData.success) {
        console.log('✅ CustomerPage: Successfully fetched', dealsData.deals.length, 'deals')
        
        // Merge claimed status with deals data (using both localStorage and server data)
        const allClaimedDeals = { ...claimedDeals, ...serverClaimedDeals }
        const dealsWithClaimedStatus = dealsData.deals.map((deal: Deal) => ({
          ...deal,
          claimed: !!allClaimedDeals[deal.id],
          claimCode: allClaimedDeals[deal.id]?.code,
          claimExpiry: allClaimedDeals[deal.id]?.expiry
        }))
        setDeals(dealsWithClaimedStatus.sort((a: any, b: any) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()))
      } else {
        console.log('❌ CustomerPage: API error:', dealsData.error)
        setErrors([dealsData.error || 'Failed to fetch deals'])
      }
    } catch (error) {
      setErrors(['Network error. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
    if (location) {
      fetchDeals(location.lat, location.lng, newRadius)
    }
  }


  const claimDeal = async (dealId: number) => {
    setErrors([])

    // Check if already claimed locally first
    if (claimedDeals[dealId]) {
      setErrors(['이미 받은 혜택입니다.'])
      return
    }

    if (!deviceId) {
      setErrors(['기기 인식 중입니다. 잠시 후 다시 시도해 주세요.'])
      return
    }

    try {
      const response = await fetch('/api/customers/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dealId,
          deviceId
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Save claimed deal to localStorage
        saveClaimedDeal(dealId, data.claimCode)
        // Refresh deals to update current_claims and claimed status
        if (location) {
          fetchDeals(location.lat, location.lng, radius)
        }
      } else {
        // Handle specific error cases
        if (data.error.includes('already claimed')) {
          setErrors(['이미 받은 혜택입니다.'])
        } else {
          setErrors([data.error || '혜택 받기에 실패했습니다.'])
        }
      }
    } catch (error) {
      setErrors(['네트워크 오류가 발생했습니다. 다시 시도해 주세요.'])
    }
  }

  const formatDate = (dateString: string) => {
    // All deals are stored as UTC, parse as UTC and format in Korean timezone
    const date = new Date(dateString)
    return formatKoreanTime(date)
  }

  const getTimeRemaining = (expires_at: string) => {
    const now = new Date()
    
    // Handle different date formats from the database
    let expiryDate: Date
    
    // Try parsing as ISO string first
    if (expires_at.includes('T') || expires_at.includes('Z')) {
      expiryDate = new Date(expires_at)
    } else {
      // Handle Korean format dates (e.g., "2024-12-31 23:59:59")
      // Assume UTC if no timezone info
      expiryDate = new Date(expires_at + ' UTC')
    }
    
    // Fallback: if still invalid, try direct parsing
    if (isNaN(expiryDate.getTime())) {
      expiryDate = new Date(expires_at)
    }
    
    // If still invalid, return expired
    if (isNaN(expiryDate.getTime())) {
      return { text: '만료됨', isUrgent: false }
    }
    
    const timeDiff = expiryDate.getTime() - now.getTime()
    
    if (timeDiff <= 0) {
      return { text: '만료됨', isUrgent: false }
    }
    
    const minutes = Math.floor(timeDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return { text: `${days}일 남음`, isUrgent: false }
    } else if (hours > 0) {
      return { text: `${hours}시간 남음`, isUrgent: false }
    } else {
      return { text: `${minutes}분 남음`, isUrgent: minutes < 30 }
    }
  }

  const isExpired = (deal: Deal) => {
    // Use backward-compatible expiration check
    return isDealExpired(deal.id, deal.expires_at)
  }

  const isClaimAvailable = (deal: Deal) => {
    return !isExpired(deal) && deal.current_claims < deal.max_claims && !deal.claimed
  }

  const isClaimExpired = (claimExpiry?: string) => {
    if (!claimExpiry) return false
    return new Date(claimExpiry + 'Z') <= new Date()
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
        
        {/* Header */}
        <div className="text-center mb-8 w-full">
          <div className="mb-2">
            <h1 className="text-3xl font-light text-white">동네 혜택 찾기</h1>
          </div>
          <p className="text-sm text-white/80">내 주변의 특별한 혜택을 찾아보세요</p>
        </div>

        {/* Location & Controls */}
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 mb-6 w-full">
          <div className="mb-4">
            <p className="text-sm text-white/80 mb-2">
              {location ? `위치: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '위치 가져오는 중...'}
            </p>
            <button
              onClick={requestLocation}
              className="text-white hover:text-white/80 text-sm font-light underline transition-colors duration-300"
            >
              위치 업데이트
            </button>
          </div>

          <div>
            <label className="block text-sm font-light text-white mb-2">
              검색 반경: {radius}m
            </label>
            <div className="flex gap-2 flex-wrap">
              {[100, 200, 500, 1000].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRadiusChange(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-light transition-all duration-300 ${
                    radius === r
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 w-full">
          <button
            onClick={() => location && fetchDeals(location.lat, location.lng, radius)}
            disabled={!location || isLoading}
            className={`w-full px-4 py-3 rounded-lg text-sm font-light transition-all duration-300 flex items-center justify-center gap-2 ${
              location && !isLoading
                ? 'bg-blue-100/50 text-white hover:bg-white/30 active:scale-95'
                : 'bg-blue-100/20 text-white/50 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {/* Messages */}
        {errors.length > 0 && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3 mb-4 w-full">
            {errors.map((error, index) => (
              <p key={index} className="text-red-100 text-sm">{error}</p>
            ))}
          </div>
        )}


        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-white/80">혜택 검색 중...</div>
          </div>
        )}

        {/* Deals List */}
        <div className="w-full">
          {!isLoading && deals.length === 0 && (
            <div className="text-center py-8 text-white/80">
              <p className="text-lg mb-2 font-light">찾은 혜택이 없습니다</p>
              <p className="text-sm">검색 반경을 늘리거나 나중에 다시 확인해 보세요</p>
            </div>
          )}

          <div className="space-y-4">
            {deals.map((deal) => (
              <div key={deal.id} className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative ${deal.claimed ? 'opacity-70' : ''}`}>
                {deal.claimed && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
                    받음
                  </div>
                )}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Icon Circle */}
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {deal.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{deal.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 space-y-1 pl-13">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <p className="font-medium text-gray-700">{deal.merchant_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p>{deal.merchant_address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p>사용: {deal.current_claims} / {deal.max_claims}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>만료: {formatDate(deal.expires_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`font-medium ${getTimeRemaining(deal.expires_at).isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
                        {getTimeRemaining(deal.expires_at).text}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    {deal.claimed && !isClaimExpired(deal.claimExpiry) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        받은 혜택
                      </span>
                    )}
                    {deal.claimed && isClaimExpired(deal.claimExpiry) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        코드 만료
                      </span>
                    )}
                    {!deal.claimed && isExpired(deal) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        만료
                      </span>
                    )}
                    {!deal.claimed && deal.current_claims >= deal.max_claims && !isExpired(deal) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        마감
                      </span>
                    )}
                    {!deal.claimed && isClaimAvailable(deal) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                        사용가능
                      </span>
                    )}
                  </div>

                  {deal.claimed ? (
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-700 mb-1">
                        코드: {isClaimExpired(deal.claimExpiry) ? '코드 만료' : deal.claimCode}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => claimDeal(deal.id)}
                      disabled={!isClaimAvailable(deal) || deal.claimed}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isClaimAvailable(deal) && !deal.claimed
                          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {deal.claimed ? '이미 받음' : isClaimAvailable(deal) ? '혜택 받기' : '사용불가'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}