import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { claimCode } = await request.json();
    
    if (!claimCode) {
      return NextResponse.json(
        { success: false, error: 'Claim code required' },
        { status: 400 }
      );
    }
    
    const success = db.redeemClaim(claimCode);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Invalid, expired, or already redeemed claim code' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Claim redeemed successfully'
    });
    
  } catch (error) {
    console.error('Redeem claim error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem claim' },
      { status: 500 }
    );
  }
}