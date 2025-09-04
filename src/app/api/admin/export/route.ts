import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface ExportConfig {
  format: 'csv' | 'json' | 'xlsx'
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
  includeFields: string[]
  customStartDate?: string
  customEndDate?: string
}

export async function POST(request: NextRequest) {
  try {
    const config: ExportConfig = await request.json()
    console.log('📋 Export request:', config)

    // Generate export data based on configuration
    const exportData = await generateExportData(config)
    
    // Format data based on requested format
    let formattedData: string
    let mimeType: string
    let fileExtension: string

    switch (config.format) {
      case 'csv':
        formattedData = formatAsCSV(exportData)
        mimeType = 'text/csv'
        fileExtension = 'csv'
        break
      case 'json':
        formattedData = JSON.stringify(exportData, null, 2)
        mimeType = 'application/json'
        fileExtension = 'json'
        break
      case 'xlsx':
        // For simplicity, we'll return CSV format for XLSX requests
        // In a real implementation, you'd use a library like xlsx or exceljs
        formattedData = formatAsCSV(exportData)
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileExtension = 'xlsx'
        break
      default:
        throw new Error('Unsupported format')
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `dangol-export-${config.dateRange}-${timestamp}.${fileExtension}`

    // In a real implementation, you would:
    // 1. Save the file to a storage service (S3, GCS, etc.)
    // 2. Return a download URL
    // For this demo, we'll return the data directly
    
    const response = new Response(formattedData, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

    // Return metadata for the client
    return NextResponse.json({
      success: true,
      filename,
      downloadUrl: `/api/admin/download/${filename}`, // Mock URL
      size: formattedData.length,
      recordCount: Array.isArray(exportData.merchants) ? exportData.merchants.length : 0
    })

  } catch (error) {
    console.error('❌ Export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

async function generateExportData(config: ExportConfig) {
  const { dateRange, includeFields, customStartDate, customEndDate } = config
  const data: any = {}

  // Calculate date filter
  const dateFilter = getDateFilter(dateRange, customStartDate, customEndDate)

  try {
    // Merchants data
    if (includeFields.includes('merchants')) {
      data.merchants = (await db.pool.query(`
        SELECT 
          id,
          business_name,
          address,
          phone,
          email,
          latitude,
          longitude,
          created_at
        FROM merchants
        ${dateFilter.merchants ? `WHERE created_at >= '${dateFilter.merchants.start}' AND created_at <= '${dateFilter.merchants.end}'` : ''}
        ORDER BY created_at DESC
      `)).rows
    }

    // Deals data
    if (includeFields.includes('deals')) {
      data.deals = (await db.pool.query(`
        SELECT 
          d.id,
          d.merchant_id,
          m.business_name as merchant_name,
          d.title,
          d.description,
          d.expires_at,
          d.max_claims,
          d.current_claims,
          d.created_at
        FROM deals d
        JOIN merchants m ON d.merchant_id = m.id
        ${dateFilter.deals ? `WHERE d.created_at >= '${dateFilter.deals.start}' AND d.created_at <= '${dateFilter.deals.end}'` : ''}
        ORDER BY d.created_at DESC
      `)).rows
    }

    // Claims data
    if (includeFields.includes('claims')) {
      data.claims = (await db.pool.query(`
        SELECT 
          c.id,
          c.deal_id,
          d.title as deal_title,
          c.device_id,
          c.claim_code,
          c.claimed_at,
          c.expires_at,
          c.redeemed_at,
          m.business_name as merchant_name
        FROM claims c
        JOIN deals d ON c.deal_id = d.id
        JOIN merchants m ON d.merchant_id = m.id
        ${dateFilter.claims ? `WHERE c.claimed_at >= '${dateFilter.claims.start}' AND c.claimed_at <= '${dateFilter.claims.end}'` : ''}
        ORDER BY c.claimed_at DESC
      `)).rows
    }

    // Redemptions data
    if (includeFields.includes('redemptions')) {
      data.redemptions = (await db.pool.query(`
        SELECT 
          c.id,
          c.deal_id,
          d.title as deal_title,
          c.device_id,
          c.claim_code,
          c.claimed_at,
          c.redeemed_at,
          m.business_name as merchant_name
        FROM claims c
        JOIN deals d ON c.deal_id = d.id
        JOIN merchants m ON d.merchant_id = m.id
        WHERE c.redeemed_at IS NOT NULL
        ${dateFilter.redemptions ? `AND c.redeemed_at >= '${dateFilter.redemptions.start}' AND c.redeemed_at <= '${dateFilter.redemptions.end}'` : ''}
        ORDER BY c.redeemed_at DESC
      `)).rows
    }

    // Analytics summary
    if (includeFields.includes('analytics')) {
      const totalMerchants = (await db.pool.query('SELECT COUNT(*) as count FROM merchants')).rows[0] as { count: number }
      const totalDeals = (await db.pool.query('SELECT COUNT(*) as count FROM deals')).rows[0] as { count: number }
      const totalClaims = (await db.pool.query('SELECT COUNT(*) as count FROM claims')).rows[0] as { count: number }
      const totalRedemptions = (await db.pool.query('SELECT COUNT(*) as count FROM claims WHERE redeemed_at IS NOT NULL')).rows[0] as { count: number }

      data.analytics = [{
        report_generated: new Date().toISOString(),
        date_range: `${dateFilter.start || 'All time'} to ${dateFilter.end || 'Present'}`,
        total_merchants: totalMerchants.count,
        total_deals: totalDeals.count,
        total_claims: totalClaims.count,
        total_redemptions: totalRedemptions.count,
        redemption_rate: totalClaims.count > 0 ? (totalRedemptions.count / totalClaims.count * 100).toFixed(2) : '0.00'
      }]
    }

    // Error logs (simulated)
    if (includeFields.includes('errors')) {
      data.errors = [
        {
          id: 1,
          type: 'GPS_FAILURE',
          message: 'Geolocation permission denied',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          severity: 'WARNING'
        },
        {
          id: 2,
          type: 'EXPIRED_CODE',
          message: 'User attempted to use expired claim code',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          severity: 'INFO'
        }
      ]
    }

    // Device tracking (simulated)
    if (includeFields.includes('devices')) {
      data.devices = [
        {
          device_id: 'dev_abc123',
          device_type: 'mobile',
          first_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date().toISOString(),
          total_claims: 5,
          total_redemptions: 3
        }
      ]
    }

    // Geographic data
    if (includeFields.includes('geographic')) {
      data.geographic = (await db.pool.query(`
        SELECT 
          m.latitude,
          m.longitude,
          m.business_name,
          COUNT(c.id) as total_claims
        FROM merchants m
        LEFT JOIN deals d ON m.id = d.merchant_id
        LEFT JOIN claims c ON d.id = c.deal_id
        GROUP BY m.id, m.latitude, m.longitude, m.business_name
        ORDER BY total_claims DESC
      `)).rows
    }

    return data

  } catch (error) {
    console.error('Error generating export data:', error)
    throw error
  }
}

function getDateFilter(dateRange: string, customStart?: string, customEnd?: string) {
  const now = new Date()
  let start: string | undefined
  let end: string | undefined

  switch (dateRange) {
    case 'today':
      start = now.toISOString().split('T')[0]
      end = start
      break
    case 'week':
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      start = weekStart.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
      break
    case 'month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      start = monthStart.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
      break
    case 'quarter':
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
      start = quarterStart.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
      break
    case 'year':
      const yearStart = new Date(now.getFullYear(), 0, 1)
      start = yearStart.toISOString().split('T')[0]
      end = now.toISOString().split('T')[0]
      break
    case 'custom':
      start = customStart
      end = customEnd
      break
  }

  return {
    start,
    end,
    merchants: start && end ? { start, end } : null,
    deals: start && end ? { start, end } : null,
    claims: start && end ? { start, end } : null,
    redemptions: start && end ? { start, end } : null
  }
}

function formatAsCSV(data: any): string {
  const sections: string[] = []

  Object.keys(data).forEach(key => {
    const items = data[key]
    if (!Array.isArray(items) || items.length === 0) return

    sections.push(`\n# ${key.toUpperCase()}`)
    
    // Get headers from first item
    const headers = Object.keys(items[0])
    sections.push(headers.join(','))
    
    // Add data rows
    items.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      })
      sections.push(row.join(','))
    })
  })

  return sections.join('\n')
}