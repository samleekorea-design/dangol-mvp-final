interface GeographicData {
  merchantLocations: Array<{ lat: number, lng: number, name: string, deals: number }>
  claimsByLocation: Array<{ lat: number, lng: number, claims: number }>
}

interface GeographicMapProps {
  data: GeographicData
}

import { DataSourceIndicator } from './DataSourceIndicator'

export const GeographicMap: React.FC<GeographicMapProps> = ({ data }) => {
  // Seoul coordinates for centering the map
  const centerLat = 37.5665
  const centerLng = 126.978
  
  // Map bounds (approximate Seoul area)
  const bounds = {
    north: 37.7,
    south: 37.4,
    east: 127.2,
    west: 126.7
  }

  // Convert coordinates to map position (simplified projection)
  const coordToPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100
    const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
  }

  const getMaxClaims = () => {
    return Math.max(...data.claimsByLocation.map(loc => loc.claims), 1)
  }

  const maxClaims = getMaxClaims()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative">
      <DataSourceIndicator type="real" />
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Geographic Distribution</h3>
        <div className="text-sm text-gray-500">
          {data.merchantLocations.length} merchants, {data.claimsByLocation.length} claim locations
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden mb-4">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* City label */}
        <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
          Seoul Metropolitan Area
        </div>

        {/* Merchant Locations */}
        {data.merchantLocations.map((merchant, index) => {
          const position = coordToPosition(merchant.lat, merchant.lng)
          return (
            <div
              key={`merchant-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {merchant.name}
                <br />
                {merchant.deals} deals
              </div>
            </div>
          )
        })}

        {/* Claims Heat Points */}
        {data.claimsByLocation.map((location, index) => {
          const position = coordToPosition(location.lat, location.lng)
          const intensity = location.claims / maxClaims
          const size = Math.max(8, intensity * 24)
          
          return (
            <div
              key={`claim-${index}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div 
                className="bg-red-500 rounded-full opacity-60 group-hover:opacity-80 transition-opacity"
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px`,
                  backgroundColor: `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`
                }}
              />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {location.claims} claims
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-sm text-gray-600">Merchant Locations</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-60"></div>
          <span className="text-sm text-gray-600">Claim Activity</span>
        </div>
        <div className="text-sm text-gray-500">
          Higher opacity = More activity
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{data.merchantLocations.length}</div>
            <div className="text-sm text-gray-500">Active Merchants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.merchantLocations.reduce((sum, m) => sum + m.deals, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Deals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.claimsByLocation.reduce((sum, c) => sum + c.claims, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Claims</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {data.claimsByLocation.length}
            </div>
            <div className="text-sm text-gray-500">Active Locations</div>
          </div>
        </div>
      </div>
    </div>
  )
}