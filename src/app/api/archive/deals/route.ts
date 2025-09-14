import { NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET() {
  try {
    // Get archived deals from the last 3 days
    const archivedDeals = await db.getArchivedDeals()
    
    // Format the response to include merchant info nested
    const deals = archivedDeals.map(deal => ({
      id: deal.id,
      merchant_id: deal.merchant_id,
      title: deal.title,
      description: deal.description,
      expires_at: deal.expires_at,
      merchant: {
        business_name: deal.merchant_name
      }
    }))

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length
    })

  } catch (error) {
    console.error('Archive deals error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}