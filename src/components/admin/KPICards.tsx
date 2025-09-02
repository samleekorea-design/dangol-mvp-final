interface KPIData {
  totalMerchants: number
  totalDeals: number
  totalClaims: number
  totalRedemptions: number
  activeDeals: number
  redemptionRate: number
}

interface KPICardsProps {
  data: KPIData
}

import { DataSourceIndicator } from './DataSourceIndicator'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, trend, trendValue, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {trend && trendValue && (
              <div className={`flex items-center text-sm ${trendColors[trend]}`}>
                {trend === 'up' && (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                )}
                {trend === 'down' && (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                )}
                {trendValue}
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const formatPercentage = (rate: number) => `${(rate * 100).toFixed(1)}%`
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <KPICard
        title="Total Merchants"
        value={data.totalMerchants}
        subtitle="Active merchants on platform"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 16h6M7 8h6v4H7V8z" />
          </svg>
        }
        color="blue"
      />
      
      <KPICard
        title="Total Deals"
        value={data.totalDeals}
        subtitle={`${data.activeDeals} currently active`}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a1 1 0 00-1 1v14a1 1 0 001 1h16a1 1 0 001-1V5a1 1 0 00-1-1z" />
          </svg>
        }
        color="green"
      />
      
      <KPICard
        title="Total Claims"
        value={data.totalClaims}
        subtitle="Deals claimed by customers"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        color="purple"
      />
      
      <KPICard
        title="Total Redemptions"
        value={data.totalRedemptions}
        subtitle="Claims redeemed at merchants"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="green"
      />
      
      <KPICard
        title="Redemption Rate"
        value={formatPercentage(data.redemptionRate)}
        subtitle="Claims converted to redemptions"
        trend={data.redemptionRate > 0.7 ? 'up' : data.redemptionRate < 0.5 ? 'down' : 'neutral'}
        trendValue={data.redemptionRate > 0.7 ? 'Excellent' : data.redemptionRate < 0.5 ? 'Needs attention' : 'Good'}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
        color={data.redemptionRate > 0.7 ? 'green' : data.redemptionRate < 0.5 ? 'red' : 'orange'}
      />
      
      <KPICard
        title="Active Deals"
        value={data.activeDeals}
        subtitle="Currently available for claims"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        color="orange"
      />
    </div>
  )
}