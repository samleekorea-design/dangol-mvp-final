'use client'

import { useState } from 'react'

interface TimeData {
  hourlyData: Array<{ hour: number, claims: number, redemptions: number }>
  dailyData: Array<{ date: string, claims: number, redemptions: number }>
}

interface TimeBasedAnalyticsProps {
  data: TimeData
}

import { DataSourceIndicator } from './DataSourceIndicator'

type ViewType = 'hourly' | 'daily'

export const TimeBasedAnalytics: React.FC<TimeBasedAnalyticsProps> = ({ data }) => {
  const [viewType, setViewType] = useState<ViewType>('hourly')

  const getMaxValue = (dataset: any[]) => {
    if (viewType === 'hourly') {
      return Math.max(...dataset.map(d => Math.max(d.claims, d.redemptions)))
    } else {
      return Math.max(...dataset.map(d => Math.max(d.claims, d.redemptions)))
    }
  }

  const currentData = viewType === 'hourly' ? data.hourlyData : data.dailyData
  const maxValue = getMaxValue(currentData)

  const formatLabel = (item: any) => {
    if (viewType === 'hourly') {
      return `${item.hour}:00`
    } else {
      return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const SimpleBarChart = () => {
    return (
      <div className="space-y-3">
        {currentData.map((item, index) => {
          const claimsHeight = maxValue > 0 ? (item.claims / maxValue) * 100 : 0
          const redemptionsHeight = maxValue > 0 ? (item.redemptions / maxValue) * 100 : 0
          
          return (
            <div key={index} className="flex items-end space-x-1 h-16">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">{formatLabel(item)}</div>
                <div className="flex space-x-1 h-12">
                  <div 
                    className="bg-blue-500 rounded-sm flex-1"
                    style={{ height: `${claimsHeight}%` }}
                    title={`Claims: ${item.claims}`}
                  />
                  <div 
                    className="bg-green-500 rounded-sm flex-1"
                    style={{ height: `${redemptionsHeight}%` }}
                    title={`Redemptions: ${item.redemptions}`}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-400 w-8 text-right">
                {Math.max(item.claims, item.redemptions)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const getInsights = () => {
    if (viewType === 'hourly') {
      const peakHour = data.hourlyData.reduce((peak, current) => 
        current.claims > peak.claims ? current : peak
      )
      const lowHour = data.hourlyData.reduce((low, current) => 
        current.claims < low.claims ? current : low
      )
      
      return [
        `Peak activity: ${peakHour.hour}:00 (${peakHour.claims} claims)`,
        `Lowest activity: ${lowHour.hour}:00 (${lowHour.claims} claims)`,
        `Average hourly claims: ${(data.hourlyData.reduce((sum, h) => sum + h.claims, 0) / data.hourlyData.length).toFixed(1)}`
      ]
    } else {
      const totalClaims = data.dailyData.reduce((sum, d) => sum + d.claims, 0)
      const totalRedemptions = data.dailyData.reduce((sum, d) => sum + d.redemptions, 0)
      const avgDaily = totalClaims / data.dailyData.length
      
      return [
        `Total claims: ${totalClaims}`,
        `Total redemptions: ${totalRedemptions}`,
        `Daily average: ${avgDaily.toFixed(1)} claims`
      ]
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Activity Patterns</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('hourly')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              viewType === 'hourly'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hourly
          </button>
          <button
            onClick={() => setViewType('daily')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              viewType === 'daily'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Claims</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Redemptions</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <SimpleBarChart />
      </div>

      {/* Insights */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insights</h4>
        <div className="space-y-1">
          {getInsights().map((insight, index) => (
            <p key={index} className="text-sm text-gray-600">• {insight}</p>
          ))}
        </div>
      </div>
    </div>
  )
}