'use client'

import { useState, useEffect } from 'react'
import { KPICards } from '@/components/admin/KPICards'
import { TimeBasedAnalytics } from '@/components/admin/TimeBasedAnalytics'
import { GeographicMap } from '@/components/admin/GeographicMap'
import { DeviceTracking } from '@/components/admin/DeviceTracking'
import { ErrorTracking } from '@/components/admin/ErrorTracking'
import { MerchantActivity } from '@/components/admin/MerchantActivity'
import { DataExport } from '@/components/admin/DataExport'
import { NotificationSender } from '@/components/admin/NotificationSender'
import { NotificationAnalytics } from '@/components/admin/NotificationAnalytics'

interface AdminData {
  kpis: {
    totalMerchants: number
    totalDeals: number
    totalClaims: number
    totalRedemptions: number
    totalCancellations: number
    activeDeals: number
    redemptionRate: number
    cancellationRate: number
  }
  timeAnalytics: {
    hourlyData: Array<{ hour: number, claims: number, redemptions: number }>
    dailyData: Array<{ date: string, claims: number, redemptions: number }>
  }
  geographic: {
    merchantLocations: Array<{ lat: number, lng: number, name: string, deals: number }>
    claimsByLocation: Array<{ lat: number, lng: number, claims: number }>
  }
  devices: {
    uniqueDevices: number
    returningDevices: number
    newDevices: number
    deviceBreakdown: Array<{ type: string, count: number }>
  }
  errors: {
    gpsFailures: number
    expiredCodes: number
    networkErrors: number
    recentErrors: Array<{ type: string, message: string, timestamp: string }>
  }
  merchantActivity: Array<{
    merchantId: number
    name: string
    dealsCreated: number
    claimsReceived: number
    redemptionsProcessed: number
    lastActivity: string
  }>
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [data, setData] = useState<AdminData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    if (adminPassword === '@glatic') {
      setIsAuthenticated(true)
    } else {
      setAuthError('올바르지 않은 관리자 비밀번호입니다')
    }
  }

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const adminData = await response.json()
        setData(adminData)
        setLastUpdated(new Date())
      } else {
        console.error('Failed to fetch admin data')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return

    const interval = setInterval(() => {
      fetchData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, isAuthenticated])

  const handleManualRefresh = () => {
    fetchData(true)
  }

  // Admin password prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#65BBFF] via-10% via-[#3A82FF] via-25% to-[#1E6AFF] flex items-center justify-center">
        <div className="max-w-[375px] mx-auto px-6 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-8 w-full">
            <a href="/">
              <img 
                src="/images/logo-white.png" 
                alt="Dangol Logo" 
                className="h-8 w-auto opacity-90"
              />
            </a>
          </div>
          
          {/* Title */}
          <div className="text-center mb-8 w-full">
            <h1 className="text-3xl font-light text-white mb-2">관리자 대시보드</h1>
            <p className="text-sm text-white/80">관리자 비밀번호를 입력하세요</p>
          </div>
          
          <form onSubmit={handleAdminAuth} className="space-y-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 w-full">
            <div>
              <label htmlFor="adminPassword" className="block text-sm font-light text-white mb-2">
                관리자 비밀번호 *
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-blue-300/60"
                placeholder="관리자 비밀번호를 입력하세요"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-3">
                <p className="text-red-100 text-sm">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-blue-600 font-light py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300"
            >
              인증하기
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Failed to load dashboard data</p>
          <button
            onClick={handleManualRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {lastUpdated && (
                <span className="ml-4 text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {refreshing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <KPICards data={data.kpis} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TimeBasedAnalytics data={data.timeAnalytics} />
          <DeviceTracking data={data.devices} />
        </div>

        {/* Map Row */}
        <div className="mb-8">
          <GeographicMap data={data.geographic} />
        </div>

        {/* Monitoring Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ErrorTracking data={data.errors} />
          <MerchantActivity data={data.merchantActivity} />
        </div>

        {/* Notifications Row */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <NotificationSender />
          <NotificationAnalytics />
        </div>

        {/* Export Row */}
        <DataExport />
      </div>
    </div>
  )
}