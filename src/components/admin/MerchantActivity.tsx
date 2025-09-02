interface MerchantActivityData {
  merchantId: number
  name: string
  dealsCreated: number
  claimsReceived: number
  redemptionsProcessed: number
  lastActivity: string
}

interface MerchantActivityProps {
  data: MerchantActivityData[]
}

import { DataSourceIndicator } from './DataSourceIndicator'

export const MerchantActivity: React.FC<MerchantActivityProps> = ({ data }) => {
  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getActivityStatus = (lastActivity: string) => {
    const date = new Date(lastActivity)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / 3600000

    if (diffHours < 1) return { status: 'Active', color: 'bg-green-100 text-green-800' }
    if (diffHours < 24) return { status: 'Recent', color: 'bg-blue-100 text-blue-800' }
    if (diffHours < 168) return { status: 'Weekly', color: 'bg-yellow-100 text-yellow-800' }
    return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' }
  }

  const getPerformanceScore = (merchant: MerchantActivityData) => {
    // Simple performance scoring based on activity
    const dealScore = Math.min(merchant.dealsCreated * 2, 20)
    const claimScore = Math.min(merchant.claimsReceived, 30)
    const redemptionScore = Math.min(merchant.redemptionsProcessed * 2, 30)
    const recentActivityScore = (() => {
      const diffHours = (new Date().getTime() - new Date(merchant.lastActivity).getTime()) / 3600000
      if (diffHours < 1) return 20
      if (diffHours < 24) return 15
      if (diffHours < 168) return 10
      return 0
    })()

    return Math.min(dealScore + claimScore + redemptionScore + recentActivityScore, 100)
  }

  // Sort merchants by performance score
  const sortedMerchants = [...data].sort((a, b) => getPerformanceScore(b) - getPerformanceScore(a))

  const totalStats = {
    totalDeals: data.reduce((sum, m) => sum + m.dealsCreated, 0),
    totalClaims: data.reduce((sum, m) => sum + m.claimsReceived, 0),
    totalRedemptions: data.reduce((sum, m) => sum + m.redemptionsProcessed, 0),
    activeMerchants: data.filter(m => getActivityStatus(m.lastActivity).status === 'Active').length
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Merchant Activity</h3>
        <div className="text-sm text-gray-500">
          {data.length} total merchants
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{totalStats.activeMerchants}</div>
          <div className="text-xs text-gray-500">Active Now</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{totalStats.totalDeals}</div>
          <div className="text-xs text-gray-500">Total Deals</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{totalStats.totalClaims}</div>
          <div className="text-xs text-gray-500">Total Claims</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{totalStats.totalRedemptions}</div>
          <div className="text-xs text-gray-500">Redemptions</div>
        </div>
      </div>

      {/* Merchant List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {sortedMerchants.map((merchant, index) => {
          const activityStatus = getActivityStatus(merchant.lastActivity)
          const performanceScore = getPerformanceScore(merchant)
          const conversionRate = merchant.claimsReceived > 0 ? (merchant.redemptionsProcessed / merchant.claimsReceived) * 100 : 0

          return (
            <div key={merchant.merchantId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank and Name */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-800">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{merchant.name}</h4>
                    <p className="text-sm text-gray-500">ID: {merchant.merchantId}</p>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        performanceScore >= 80 ? 'bg-green-500' :
                        performanceScore >= 60 ? 'bg-blue-500' :
                        performanceScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${performanceScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{performanceScore}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-900">{merchant.dealsCreated}</div>
                  <div className="text-xs text-gray-500">Deals</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{merchant.claimsReceived}</div>
                  <div className="text-xs text-gray-500">Claims</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{merchant.redemptionsProcessed}</div>
                  <div className="text-xs text-gray-500">Redeemed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">{conversionRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Convert</div>
                </div>
              </div>

              {/* Status and Last Activity */}
              <div className="flex items-center space-x-3 ml-4">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${activityStatus.color}`}>
                  {activityStatus.status}
                </span>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{formatLastActivity(merchant.lastActivity)}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Insights */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            • Top performer: {sortedMerchants[0]?.name || 'N/A'} ({getPerformanceScore(sortedMerchants[0] || {} as MerchantActivityData)} score)
          </div>
          <div>
            • Average conversion rate: {data.length > 0 ? (data.reduce((sum, m) => sum + (m.claimsReceived > 0 ? (m.redemptionsProcessed / m.claimsReceived) : 0), 0) / data.length * 100).toFixed(1) : 0}%
          </div>
          <div>
            • Active merchants: {totalStats.activeMerchants} of {data.length} ({data.length > 0 ? ((totalStats.activeMerchants / data.length) * 100).toFixed(1) : 0}%)
          </div>
          <div>
            • Total engagement: {totalStats.totalClaims + totalStats.totalRedemptions} interactions
          </div>
        </div>
      </div>
    </div>
  )
}