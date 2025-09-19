import { NextRequest, NextResponse } from 'next/server'
import { checkExpiredClaims } from '@/lib/cron-jobs'

export async function GET(request: NextRequest) {
  try {
    const updated = await checkExpiredClaims()

    return NextResponse.json({
      success: true,
      updated: updated
    })
  } catch (error) {
    console.error('Expired claims cron error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update expired claims' },
      { status: 500 }
    )
  }
}