import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const claimId = parseInt(params.id)
    
    // Validate claim ID
    if (isNaN(claimId)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 혜택 ID입니다' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { deviceId } = body

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: '기기 정보가 필요합니다' },
        { status: 400 }
      )
    }

    // Cancel the claim
    const success = await db.cancelClaim(claimId, deviceId)

    if (!success) {
      return NextResponse.json(
        { success: false, error: '혜택 취소에 실패했습니다. 이미 사용되었거나 취소된 혜택일 수 있습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '혜택이 성공적으로 취소되었습니다'
    })

  } catch (error) {
    console.error('Cancel claim error:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}