'use client'

import { useState } from 'react'

interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx'
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  includeFields: string[]
  customStartDate?: string
  customEndDate?: string
}

export const DataExport: React.FC = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: 'week',
    includeFields: ['merchants', 'deals', 'claims', 'redemptions']
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string
    type: string
    format: string
    dateRange: string
    timestamp: string
    status: 'completed' | 'failed'
    downloadUrl?: string
  }>>([
    {
      id: '1',
      type: 'Weekly Report',
      format: 'CSV',
      dateRange: 'Dec 25 - Dec 31, 2024',
      timestamp: '2024-12-31T10:30:00Z',
      status: 'completed',
      downloadUrl: '/api/admin/exports/weekly-report-2024-12-31.csv'
    },
    {
      id: '2',
      type: 'Monthly Analytics',
      format: 'JSON',
      dateRange: 'December 2024',
      timestamp: '2024-12-30T15:45:00Z',
      status: 'completed',
      downloadUrl: '/api/admin/exports/monthly-analytics-2024-12.json'
    }
  ])

  const availableFields = [
    { id: 'merchants', label: 'Merchant Data', description: 'Business info, locations, activity' },
    { id: 'deals', label: 'Deal Information', description: 'Deal details, status, performance' },
    { id: 'claims', label: 'Claim Records', description: 'Customer claims, timestamps, devices' },
    { id: 'redemptions', label: 'Redemption Data', description: 'Processed claims, merchant activity' },
    { id: 'analytics', label: 'Analytics Summary', description: 'KPIs, trends, insights' },
    { id: 'errors', label: 'Error Logs', description: 'System errors, failures, diagnostics' },
    { id: 'devices', label: 'Device Tracking', description: 'Device fingerprints, user patterns' },
    { id: 'geographic', label: 'Location Data', description: 'Geographic distribution, hotspots' }
  ]

  const dateRangeOptions = [
    { value: 'today', label: 'Today', description: 'Current day data' },
    { value: 'week', label: 'This Week', description: 'Last 7 days' },
    { value: 'month', label: 'This Month', description: 'Current month' },
    { value: 'quarter', label: 'This Quarter', description: 'Last 3 months' },
    { value: 'year', label: 'This Year', description: 'Current year' },
    { value: 'custom', label: 'Custom Range', description: 'Select specific dates' }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export API call
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportConfig)
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Add to export history
        const newExport = {
          id: Date.now().toString(),
          type: `${exportConfig.dateRange === 'custom' ? 'Custom' : exportConfig.dateRange.charAt(0).toUpperCase() + exportConfig.dateRange.slice(1)} Report`,
          format: exportConfig.format.toUpperCase(),
          dateRange: formatDateRange(),
          timestamp: new Date().toISOString(),
          status: 'completed' as const,
          downloadUrl: result.downloadUrl
        }
        
        setExportHistory(prev => [newExport, ...prev])
        
        // Auto-download if URL is provided
        if (result.downloadUrl) {
          const link = document.createElement('a')
          link.href = result.downloadUrl
          link.download = result.filename || 'export'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
      // Add failed export to history
      const failedExport = {
        id: Date.now().toString(),
        type: `${exportConfig.dateRange === 'custom' ? 'Custom' : exportConfig.dateRange.charAt(0).toUpperCase() + exportConfig.dateRange.slice(1)} Report`,
        format: exportConfig.format.toUpperCase(),
        dateRange: formatDateRange(),
        timestamp: new Date().toISOString(),
        status: 'failed' as const
      }
      setExportHistory(prev => [failedExport, ...prev])
    } finally {
      setIsExporting(false)
    }
  }

  const formatDateRange = () => {
    const now = new Date()
    switch (exportConfig.dateRange) {
      case 'today':
        return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      case 'week':
        const weekStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'custom':
        return `${exportConfig.customStartDate || 'Start'} - ${exportConfig.customEndDate || 'End'}`
      default:
        return exportConfig.dateRange
    }
  }

  const handleFieldToggle = (fieldId: string) => {
    setExportConfig(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldId)
        ? prev.includeFields.filter(f => f !== fieldId)
        : [...prev.includeFields, fieldId]
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Data Export</h3>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-gray-500">Generate reports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Configuration */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Export Configuration</h4>
          
          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="grid grid-cols-3 gap-3">
              {(['csv', 'json', 'xlsx'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setExportConfig(prev => ({ ...prev, format }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    exportConfig.format === format
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              {dateRangeOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option.value}
                    checked={exportConfig.dateRange === option.value}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, dateRange: e.target.value as any }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
            
            {/* Custom Date Inputs */}
            {exportConfig.dateRange === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportConfig.customStartDate || ''}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, customStartDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportConfig.customEndDate || ''}
                    onChange={(e) => setExportConfig(prev => ({ ...prev, customEndDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Data Fields */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Data</label>
            <div className="space-y-2">
              {availableFields.map((field) => (
                <label key={field.id} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeFields.includes(field.id)}
                    onChange={() => handleFieldToggle(field.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">{field.label}</div>
                    <div className="text-xs text-gray-500">{field.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || exportConfig.includeFields.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              'Generate Export'
            )}
          </button>
        </div>

        {/* Export History */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Recent Exports</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {exportHistory.map((export_) => (
              <div key={export_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="text-sm font-medium text-gray-900">{export_.type}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                      {export_.format}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      export_.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {export_.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {export_.dateRange} • {new Date(export_.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {export_.downloadUrl && export_.status === 'completed' && (
                  <a
                    href={export_.downloadUrl}
                    download
                    className="ml-3 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
          
          {exportHistory.length === 0 && (
            <p className="text-sm text-gray-500 italic text-center py-8">No exports yet</p>
          )}
        </div>
      </div>
    </div>
  )
}