interface DeviceData {
  uniqueDevices: number
  returningDevices: number
  newDevices: number
  deviceBreakdown: Array<{ type: string, count: number }>
}

interface DeviceTrackingProps {
  data: DeviceData
}

import { DataSourceIndicator } from './DataSourceIndicator'

export const DeviceTracking: React.FC<DeviceTrackingProps> = ({ data }) => {
  const totalDevices = data.uniqueDevices
  const returningRate = totalDevices > 0 ? (data.returningDevices / totalDevices) * 100 : 0
  const newRate = totalDevices > 0 ? (data.newDevices / totalDevices) * 100 : 0

  // Create pie chart data
  const pieData = [
    { label: 'Returning', value: data.returningDevices, color: 'bg-blue-500', colorHex: '#3b82f6' },
    { label: 'New', value: data.newDevices, color: 'bg-green-500', colorHex: '#10b981' }
  ]

  // Simple SVG pie chart
  const PieChart = () => {
    const size = 120
    const center = size / 2
    const radius = 40
    
    let currentAngle = 0
    const paths = pieData.map((segment, index) => {
      const percentage = totalDevices > 0 ? segment.value / totalDevices : 0
      const angle = percentage * 360
      
      if (percentage === 0) return null
      
      const startAngle = (currentAngle - 90) * (Math.PI / 180)
      const endAngle = (currentAngle + angle - 90) * (Math.PI / 180)
      
      const x1 = center + radius * Math.cos(startAngle)
      const y1 = center + radius * Math.sin(startAngle)
      const x2 = center + radius * Math.cos(endAngle)
      const y2 = center + radius * Math.sin(endAngle)
      
      const largeArcFlag = angle > 180 ? 1 : 0
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')
      
      currentAngle += angle
      
      return (
        <path
          key={index}
          d={pathData}
          fill={segment.colorHex}
          className="hover:opacity-80 transition-opacity cursor-pointer"
          title={`${segment.label}: ${segment.value} (${(percentage * 100).toFixed(1)}%)`}
        />
      )
    })

    return (
      <svg width={size} height={size} className="mx-auto">
        {paths}
        {/* Center text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="text-lg font-bold fill-gray-800"
        >
          {totalDevices}
        </text>
        <text
          x={center}
          y={center + 12}
          textAnchor="middle"
          className="text-xs fill-gray-500"
        >
          Total
        </text>
      </svg>
    )
  }

  const DeviceTypeChart = () => {
    const maxCount = Math.max(...data.deviceBreakdown.map(d => d.count))
    
    return (
      <div className="space-y-3">
        {data.deviceBreakdown.map((device, index) => {
          const percentage = totalDevices > 0 ? (device.count / totalDevices) * 100 : 0
          const barWidth = maxCount > 0 ? (device.count / maxCount) * 100 : 0
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600 font-medium">
                {device.type}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="flex items-center space-x-2 min-w-20">
                <span className="text-sm font-medium text-gray-900">{device.count}</span>
                <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="mixed" customText="MIXED DATA" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Device Analytics</h3>
        <div className="text-sm text-gray-500">
          {data.uniqueDevices} unique devices
        </div>
      </div>

      {/* User Type Distribution */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-gray-700 mb-4">User Type Distribution</h4>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <PieChart />
          </div>
          <div className="flex-1 space-y-4">
            {pieData.map((segment, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${segment.color}`}></div>
                  <span className="text-sm text-gray-600">{segment.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{segment.value}</div>
                  <div className="text-xs text-gray-500">
                    {totalDevices > 0 ? ((segment.value / totalDevices) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Types */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Device Types</h4>
        <DeviceTypeChart />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{returningRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Returning Users</div>
          <div className="text-xs text-gray-400 mt-1">
            {data.returningDevices} of {totalDevices}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{newRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">New Users</div>
          <div className="text-xs text-gray-400 mt-1">
            {data.newDevices} of {totalDevices}
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="mt-4 pt-4 border-t bg-yellow-50 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <div className="font-medium text-yellow-800 mb-1">Mixed Data Source</div>
            <div className="text-yellow-700 space-y-1">
              <div>• <span className="font-medium">Real:</span> Unique device count from claims table</div>
              <div>• <span className="font-medium">Simulated:</span> Device type breakdown, new/returning ratios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Insights</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>
            • {returningRate > 60 ? 'High' : returningRate > 40 ? 'Good' : 'Low'} user retention rate ({returningRate.toFixed(1)}%)
          </div>
          <div>
            • Most popular device type: {data.deviceBreakdown.length > 0 ? data.deviceBreakdown.reduce((max, current) => current.count > max.count ? current : max).type : 'N/A'}
          </div>
          <div>
            • {newRate > 40 ? 'Strong' : newRate > 20 ? 'Moderate' : 'Slow'} new user acquisition
          </div>
        </div>
      </div>
    </div>
  )
}