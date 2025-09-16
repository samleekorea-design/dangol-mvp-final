import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const merchantId = request.nextUrl.searchParams.get('merchantId')

    if (!merchantId) {
      return NextResponse.json({ error: 'Merchant ID required' }, { status: 400 })
    }

    const pool = await db.getDb()

    // Get total deals and active deals
    const dealStats = await pool.query(`
      SELECT
        COUNT(*) as total_deals,
        COUNT(CASE WHEN status = 'confirmed' AND expiration > NOW() THEN 1 END) as active_deals
      FROM deals
      WHERE merchant_id = $1
    `, [merchantId])

    // Get claims and redemptions
    const claimStats = await pool.query(`
      SELECT
        COUNT(*) as total_claims,
        COUNT(CASE WHEN redeemed_at IS NOT NULL THEN 1 END) as total_redemptions
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      WHERE d.merchant_id = $1
    `, [merchantId])

    // Get peak hour
    const peakHour = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as claim_count
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      WHERE d.merchant_id = $1
      GROUP BY hour
      ORDER BY claim_count DESC
      LIMIT 1
    `, [merchantId])

    // Get average time to redemption (in minutes)
    const avgRedemptionTime = await pool.query(`
      SELECT
        AVG(EXTRACT(EPOCH FROM (redeemed_at - created_at))/60)::INTEGER as avg_minutes
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      WHERE d.merchant_id = $1
      AND redeemed_at IS NOT NULL
    `, [merchantId])

    // Get repeat customer rate
    const repeatCustomers = await pool.query(`
      SELECT
        COUNT(DISTINCT phone) as total_customers,
        COUNT(DISTINCT CASE WHEN claim_count > 1 THEN phone END) as repeat_customers
      FROM (
        SELECT phone, COUNT(*) as claim_count
        FROM claims c
        JOIN deals d ON c.deal_id = d.id
        WHERE d.merchant_id = $1
        GROUP BY phone
      ) customer_claims
    `, [merchantId])

    // Get deal performance
    const dealPerformance = await pool.query(`
      SELECT
        d.id,
        d.title,
        COUNT(c.id) as claims,
        COUNT(CASE WHEN c.redeemed_at IS NOT NULL THEN 1 END) as redemptions,
        CASE
          WHEN COUNT(c.id) > 0
          THEN (COUNT(CASE WHEN c.redeemed_at IS NOT NULL THEN 1 END)::FLOAT / COUNT(c.id) * 100)::INTEGER
          ELSE 0
        END as conversion_rate
      FROM deals d
      LEFT JOIN claims c ON d.id = c.deal_id
      WHERE d.merchant_id = $1
      GROUP BY d.id, d.title
      ORDER BY claims DESC
      LIMIT 5

    `, [merchantId])

    const totalClaims = parseInt(claimStats.rows[0]?.total_claims || 0)
    const totalRedemptions = parseInt(claimStats.rows[0]?.total_redemptions || 0)
    const conversionRate = totalClaims > 0 ? Math.round((totalRedemptions / totalClaims) * 100) : 0

    const totalCustomers = parseInt(repeatCustomers.rows[0]?.total_customers || 0)
    const repeatCustomerCount = parseInt(repeatCustomers.rows[0]?.repeat_customers || 0)
    const repeatCustomerRate = totalCustomers > 0 ? Math.round((repeatCustomerCount / totalCustomers) * 100) : 0

    const analytics = {
      totalDeals: parseInt(dealStats.rows[0]?.total_deals || 0),
      activeDeals: parseInt(dealStats.rows[0]?.active_deals || 0),
      totalClaims,
      totalRedemptions,
      conversionRate,
      peakHour: parseInt(peakHour.rows[0]?.hour || 12),
      avgTimeToRedeem: parseInt(avgRedemptionTime.rows[0]?.avg_minutes || 0),
      repeatCustomerRate,
      topDeals: dealPerformance.rows,
      insights: []
    }

    // Generate insights
    if (analytics.peakHour >= 11 && analytics.peakHour <= 14) {
      analytics.insights.push(`점심시간(${analytics.peakHour}시)에 가장 많은 고객이 방문합니다`)
    } else if (analytics.peakHour >= 18 && analytics.peakHour <= 21) {
      analytics.insights.push(`저녁시간(${analytics.peakHour}시)에 가장 많은 고객이 방문합니다`)
    }

    if (analytics.conversionRate > 60) {
      analytics.insights.push('전환율이 매우 높습니다 - 딜 설정이 효과적입니다')
    } else if (analytics.conversionRate < 30) {
      analytics.insights.push('전환율 개선이 필요합니다 - 딜 조건을 재검토해보세요')
    }

    if (analytics.repeatCustomerRate > 30) {
      analytics.insights.push('재방문율이 높습니다 - 고객 충성도가 좋습니다')
    }

    if (analytics.avgTimeToRedeem < 30) {
      analytics.insights.push('고객들이 딜을 빠르게 사용합니다 - 즉시 구매 유도 효과가 있습니다')
    }

    return NextResponse.json(analytics)


  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}