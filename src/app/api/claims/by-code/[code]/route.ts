import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const claimCode = params.code
    
    if (!claimCode) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 혜택 코드입니다' },
        { status: 400 }
      )
    }

    // Get claim details by code
    const claim = await db.getClaimByCode(claimCode)

    if (!claim) {
      return NextResponse.json(
        { success: false, error: '혜택 코드를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      claim
    })

  } catch (error) {
    console.error('Get claim by code error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}