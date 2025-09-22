import { NextRequest, NextResponse } from 'next/server'
import { checkExpiredClaims } from '@/lib/cron-jobs'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedKey = process.env.CRON_SECRET_KEY || 'default-cron-key-change-this';

  if (authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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