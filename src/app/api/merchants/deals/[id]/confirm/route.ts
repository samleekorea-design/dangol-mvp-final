import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dealId = parseInt(params.id);
    
    // Validate deal ID
    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 혜택 ID입니다' },
        { status: 400 }
      );
    }

    // Get merchant ID from request body or headers
    const body = await request.json();
    const merchantId = body.merchantId;

    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: '상점 정보가 필요합니다' },
        { status: 400 }
      );
    }

    // Get the deal and verify ownership
    const deal = await db.getDeal(dealId);
    
    if (!deal) {
      return NextResponse.json(
        { success: false, error: '혜택을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Verify merchant owns this deal
    if (deal.merchant_id !== merchantId) {
      return NextResponse.json(
        { success: false, error: '이 혜택에 대한 권한이 없습니다' },
        { status: 403 }
      );
    }

    // Check if deal is in draft status
    if (deal.status !== 'draft') {
      return NextResponse.json(
        { 
          success: false, 
          error: deal.status === 'confirmed' 
            ? '이미 확정된 혜택입니다' 
            : '이 상태에서는 확정할 수 없습니다'
        },
        { status: 400 }
      );
    }

    // Update deal status to confirmed
    const updatedDeal = await db.confirmDeal(dealId);

    if (!updatedDeal) {
      return NextResponse.json(
        { success: false, error: '혜택 확정에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
      message: '혜택이 성공적으로 확정되었습니다'
    });

  } catch (error) {
    console.error('Confirm deal error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}