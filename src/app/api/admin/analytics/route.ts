import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface AdminAnalyticsData {
  kpis: {
    totalMerchants: number
    totalDeals: number
    totalClaims: number
    totalRedemptions: number
    activeDeals: number
    redemptionRate: number
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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Admin Analytics: Fetching dashboard data...')

    // Get core KPIs
    const kpis = await getKPIs()
    console.log('📊 KPIs calculated:', kpis)

    // Get time-based analytics
    const timeAnalytics = await getTimeAnalytics()
    console.log('⏰ Time analytics calculated:', timeAnalytics)

    // Get geographic data
    const geographic = await getGeographicData()
    console.log('🗺️ Geographic data calculated:', geographic)

    // Get device tracking data
    const devices = await getDeviceData()
    console.log('📱 Device data calculated:', devices)

    // Get error tracking data
    const errors = await getErrorData()
    console.log('❌ Error data calculated:', errors)

    // Get merchant activity
    const merchantActivity = await getMerchantActivity()
    console.log('🏪 Merchant activity calculated:', merchantActivity)

    const analyticsData: AdminAnalyticsData = {
      kpis,
      timeAnalytics,
      geographic,
      devices,
      errors,
      merchantActivity
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('❌ Admin Analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

async function getKPIs() {
  try {
    // Get total merchants
    const merchants = db.db.prepare('SELECT COUNT(*) as count FROM merchants').get() as { count: number }
    const totalMerchants = merchants.count

    // Get total deals
    const deals = db.db.prepare('SELECT COUNT(*) as count FROM deals').get() as { count: number }
    const totalDeals = deals.count

    // Get active deals
    const activeDeals = db.db.prepare(`
      SELECT COUNT(*) as count FROM deals 
      WHERE expires_at > datetime('now', '+9 hours') 
      AND current_claims < max_claims
    `).get() as { count: number }

    // Get total claims
    const claims = db.db.prepare('SELECT COUNT(*) as count FROM claims').get() as { count: number }
    const totalClaims = claims.count

    // Get total redemptions
    const redemptions = db.db.prepare('SELECT COUNT(*) as count FROM claims WHERE redeemed_at IS NOT NULL').get() as { count: number }
    const totalRedemptions = redemptions.count

    // Calculate redemption rate
    const redemptionRate = totalClaims > 0 ? totalRedemptions / totalClaims : 0

    return {
      totalMerchants,
      totalDeals,
      totalClaims,
      totalRedemptions,
      activeDeals: activeDeals.count,
      redemptionRate
    }
  } catch (error) {
    console.error('Error calculating KPIs:', error)
    return {
      totalMerchants: 0,
      totalDeals: 0,
      totalClaims: 0,
      totalRedemptions: 0,
      activeDeals: 0,
      redemptionRate: 0
    }
  }
}

async function getTimeAnalytics() {
  try {
    // Get hourly data for last 24 hours
    const hourlyData = []
    for (let i = 0; i < 24; i++) {
      const claims = db.db.prepare(`
        SELECT COUNT(*) as count FROM claims 
        WHERE strftime('%H', claimed_at, '+9 hours') = ? 
        AND date(claimed_at, '+9 hours') = date('now', '+9 hours')
      `).get(i.toString().padStart(2, '0')) as { count: number }

      const redemptions = db.db.prepare(`
        SELECT COUNT(*) as count FROM claims 
        WHERE strftime('%H', redeemed_at, '+9 hours') = ? 
        AND date(redeemed_at, '+9 hours') = date('now', '+9 hours')
        AND redeemed_at IS NOT NULL
      `).get(i.toString().padStart(2, '0')) as { count: number }

      hourlyData.push({
        hour: i,
        claims: claims.count,
        redemptions: redemptions.count
      })
    }

    // Get daily data for last 7 days (Korean timezone)
    const dailyData = []
    for (let i = 6; i >= 0; i--) {
      // Calculate Korean time (UTC+9)
      const now = new Date()
      const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
      koreanTime.setDate(koreanTime.getDate() - i)
      const dateStr = koreanTime.toISOString().split('T')[0]

      const claims = db.db.prepare(`
        SELECT COUNT(*) as count FROM claims 
        WHERE date(claimed_at, '+9 hours') = ?
      `).get(dateStr) as { count: number }

      const redemptions = db.db.prepare(`
        SELECT COUNT(*) as count FROM claims 
        WHERE date(redeemed_at, '+9 hours') = ? 
        AND redeemed_at IS NOT NULL
      `).get(dateStr) as { count: number }

      dailyData.push({
        date: dateStr,
        claims: claims.count,
        redemptions: redemptions.count
      })
    }

    return { hourlyData, dailyData }
  } catch (error) {
    console.error('Error calculating time analytics:', error)
    return {
      hourlyData: Array.from({ length: 24 }, (_, i) => ({ hour: i, claims: 0, redemptions: 0 })),
      dailyData: Array.from({ length: 7 }, (_, i) => {
        // Generate Korean timezone dates for fallback
        const koreanTime = new Date(Date.now() + (9 * 60 * 60 * 1000) - i * 24 * 60 * 60 * 1000)
        return {
          date: koreanTime.toISOString().split('T')[0],
          claims: 0,
          redemptions: 0
        }
      })
    }
  }
}

async function getGeographicData() {
  try {
    // Get merchant locations with deal counts
    const merchantLocations = db.db.prepare(`
      SELECT 
        m.latitude as lat, 
        m.longitude as lng, 
        m.business_name as name,
        COUNT(d.id) as deals
      FROM merchants m
      LEFT JOIN deals d ON m.id = d.merchant_id
      GROUP BY m.id, m.latitude, m.longitude, m.business_name
    `).all() as Array<{ lat: number, lng: number, name: string, deals: number }>

    // Get claims by location (aggregate by lat/lng)
    const claimsByLocation = db.db.prepare(`
      SELECT 
        m.latitude as lat, 
        m.longitude as lng, 
        COUNT(c.id) as claims
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      JOIN merchants m ON d.merchant_id = m.id
      GROUP BY m.latitude, m.longitude
      HAVING claims > 0
    `).all() as Array<{ lat: number, lng: number, claims: number }>

    return { merchantLocations, claimsByLocation }
  } catch (error) {
    console.error('Error calculating geographic data:', error)
    return {
      merchantLocations: [],
      claimsByLocation: []
    }
  }
}

async function getDeviceData() {
  try {
    // Get unique device count
    const uniqueDevices = db.db.prepare('SELECT COUNT(DISTINCT device_id) as count FROM claims').get() as { count: number }

    // Simulate device type breakdown and returning/new users
    // In a real implementation, this would be based on actual device fingerprinting data
    const deviceBreakdown = [
      { type: 'Mobile', count: Math.floor(uniqueDevices.count * 0.7) },
      { type: 'Desktop', count: Math.floor(uniqueDevices.count * 0.2) },
      { type: 'Tablet', count: Math.floor(uniqueDevices.count * 0.1) }
    ]

    // Simulate returning vs new users (would be based on device tracking history)
    const returningDevices = Math.floor(uniqueDevices.count * 0.6)
    const newDevices = uniqueDevices.count - returningDevices

    return {
      uniqueDevices: uniqueDevices.count,
      returningDevices,
      newDevices,
      deviceBreakdown
    }
  } catch (error) {
    console.error('Error calculating device data:', error)
    return {
      uniqueDevices: 0,
      returningDevices: 0,
      newDevices: 0,
      deviceBreakdown: []
    }
  }
}

async function getErrorData() {
  try {
    // Simulate error tracking data
    // In a real implementation, this would be based on error logging system
    const gpsFailures = Math.floor(Math.random() * 20)
    const expiredCodes = Math.floor(Math.random() * 15)
    const networkErrors = Math.floor(Math.random() * 10)

    const recentErrors = [
      {
        type: 'GPS',
        message: 'Geolocation permission denied by user',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        type: 'Expired',
        message: 'Claim code ABC123 expired 5 minutes ago',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        type: 'Network',
        message: 'API timeout during deal fetch',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]

    return {
      gpsFailures,
      expiredCodes,
      networkErrors,
      recentErrors
    }
  } catch (error) {
    console.error('Error calculating error data:', error)
    return {
      gpsFailures: 0,
      expiredCodes: 0,
      networkErrors: 0,
      recentErrors: []
    }
  }
}

async function getMerchantActivity() {
  try {
    const merchantActivity = db.db.prepare(`
      SELECT 
        m.id as merchantId,
        m.business_name as name,
        COUNT(DISTINCT d.id) as dealsCreated,
        COUNT(DISTINCT c.id) as claimsReceived,
        COUNT(DISTINCT CASE WHEN c.redeemed_at IS NOT NULL THEN c.id END) as redemptionsProcessed,
        COALESCE(
          MAX(d.created_at, c.claimed_at, c.redeemed_at),
          datetime('now', '-7 days')
        ) as lastActivity
      FROM merchants m
      LEFT JOIN deals d ON m.id = d.merchant_id
      LEFT JOIN claims c ON d.id = c.deal_id
      GROUP BY m.id, m.business_name
      ORDER BY lastActivity DESC
    `).all() as Array<{
      merchantId: number
      name: string
      dealsCreated: number
      claimsReceived: number
      redemptionsProcessed: number
      lastActivity: string
    }>

    return merchantActivity
  } catch (error) {
    console.error('Error calculating merchant activity:', error)
    return []
  }
}