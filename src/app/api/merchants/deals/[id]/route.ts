import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
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

    const body = await request.json();
    const { merchantId, title, description, maxClaims, expires_at } = body;

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

    // Validate quantity if provided
    if (maxClaims !== undefined) {
      if (!Number.isInteger(maxClaims) || maxClaims < 0) {
        return NextResponse.json(
          { success: false, error: '최대 사용자 수는 0명 이상이어야 합니다' },
          { status: 400 }
        );
      }

      // Allow 0 to effectively cancel deals, but otherwise can't be less than current claims
      if (maxClaims > 0 && maxClaims < deal.current_claims) {
        return NextResponse.json(
          { 
            success: false, 
            error: `최대 사용자 수는 현재 사용된 수량(${deal.current_claims}명)보다 적을 수 없습니다. 이벤트를 취소하려면 0을 입력하세요.` 
          },
          { status: 400 }
        );
      }
    }

    // Status-based validation
    if (deal.status === 'confirmed') {
      // For confirmed deals, only allow quantity changes
      const hasNonQuantityChanges = title !== undefined || 
                                   description !== undefined || 
                                   expires_at !== undefined;
      
      if (hasNonQuantityChanges) {
        return NextResponse.json(
          { success: false, error: '확정된 혜택은 수량만 변경할 수 있습니다' },
          { status: 400 }
        );
      }

      if (maxClaims === undefined) {
        return NextResponse.json(
          { success: false, error: '변경할 수량을 입력해주세요' },
          { status: 400 }
        );
      }
    }

    // Prepare update data based on deal status
    let updateData: any = {};
    
    if (deal.status === 'draft') {
      // For draft deals, allow updating all fields
      if (title !== undefined) {
        if (!title.trim()) {
          return NextResponse.json(
            { success: false, error: '혜택 제목을 입력해주세요' },
            { status: 400 }
          );
        }
        updateData.title = title.trim();
      }
      
      if (description !== undefined) {
        if (!description.trim()) {
          return NextResponse.json(
            { success: false, error: '혜택 설명을 입력해주세요' },
            { status: 400 }
          );
        }
        updateData.description = description.trim();
      }
      
      if (expires_at !== undefined) {
        const expiryDate = new Date(expires_at);
        if (isNaN(expiryDate.getTime())) {
          return NextResponse.json(
            { success: false, error: '유효하지 않은 만료 시간입니다' },
            { status: 400 }
          );
        }
        if (expiryDate <= new Date()) {
          return NextResponse.json(
            { success: false, error: '만료 시간은 현재 시간보다 뒤여야 합니다' },
            { status: 400 }
          );
        }
        updateData.expires_at = expiryDate;
      }
    }
    
    // Add quantity if provided (allowed for both draft and confirmed)
    if (maxClaims !== undefined) {
      updateData.max_claims = maxClaims;
    }

    // Check if there are any changes to make
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '변경할 내용이 없습니다' },
        { status: 400 }
      );
    }

    // Update the deal
    const updatedDeal = await db.updateDeal(dealId, updateData);

    if (!updatedDeal) {
      return NextResponse.json(
        { success: false, error: '혜택 업데이트에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
      message: '혜택이 성공적으로 업데이트되었습니다'
    });

  } catch (error) {
    console.error('Update deal error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}