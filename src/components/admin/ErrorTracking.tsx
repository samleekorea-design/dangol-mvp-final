interface ErrorData {
  gpsFailures: number
  expiredCodes: number
  networkErrors: number
  recentErrors: Array<{ type: string, message: string, timestamp: string }>
}

interface ErrorTrackingProps {
  data: ErrorData
}

import { DataSourceIndicator } from './DataSourceIndicator'

export const ErrorTracking: React.FC<ErrorTrackingProps> = ({ data }) => {
  const totalErrors = data.gpsFailures + data.expiredCodes + data.networkErrors
  
  const errorTypes = [
    { 
      label: 'GPS Failures', 
      count: data.gpsFailures, 
      color: 'bg-red-500', 
      description: 'Location services unavailable',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      label: 'Expired Codes', 
      count: data.expiredCodes, 
      color: 'bg-orange-500', 
      description: 'Users attempted expired claims',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Network Errors', 
      count: data.networkErrors, 
      color: 'bg-yellow-500', 
      description: 'API or connectivity issues',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
  ]

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getErrorTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gps': return 'text-red-600 bg-red-50'
      case 'expired': return 'text-orange-600 bg-orange-50'
      case 'network': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getHealthStatus = () => {
    if (totalErrors === 0) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (totalErrors < 10) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (totalErrors < 50) return { status: 'Warning', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { status: 'Critical', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="simulated" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Error Tracking</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${healthStatus.bg} ${healthStatus.color}`}>
          {healthStatus.status}
        </div>
      </div>

      {/* Simulated Data Warning */}
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-sm">
            <div className="font-medium text-orange-800 mb-1">Simulated Data</div>
            <div className="text-orange-700">
              This error tracking data is simulated for demonstration. In production, this would connect to a real error logging system.
            </div>
          </div>
        </div>
      </div>

      {/* Error Type Summary */}
      <div className="space-y-4 mb-6">
        {errorTypes.map((errorType, index) => {
          const percentage = totalErrors > 0 ? (errorType.count / totalErrors) * 100 : 0
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${errorType.color} text-white`}>
                {errorType.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{errorType.label}</span>
                  <span className="text-sm font-bold text-gray-900">{errorType.count}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`${errorType.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{errorType.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Errors */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Errors</h4>
        {data.recentErrors.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {data.recentErrors.slice(0, 5).map((error, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-gray-50">
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(error.type)}`}>
                  {error.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{error.message}</p>
                  <p className="text-xs text-gray-500">{formatTimestamp(error.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No recent errors recorded</p>
        )}
      </div>

      {/* Error Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalErrors}</div>
          <div className="text-sm text-gray-500">Total Errors</div>
          <div className="text-xs text-gray-400 mt-1">Last 24 hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {data.recentErrors.length}
          </div>
          <div className="text-sm text-gray-500">Recent Events</div>
          <div className="text-xs text-gray-400 mt-1">Last hour</div>
        </div>
      </div>

      {/* Recommendations */}
      {totalErrors > 10 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {data.gpsFailures > 5 && (
              <div>• Consider fallback location options for GPS-restricted users</div>
            )}
            {data.expiredCodes > 10 && (
              <div>• Review claim code expiration times or add grace period</div>
            )}
            {data.networkErrors > 5 && (
              <div>• Implement retry logic and offline mode for network issues</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}