import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { dealId, deviceId } = await request.json();
    
    if (!dealId || !deviceId) {
      return NextResponse.json(
        { success: false, error: 'Deal ID and device ID required' },
        { status: 400 }
      );
    }
    
    const claimCode = await db.claimDeal(dealId, deviceId);
    
    if (!claimCode) {
      return NextResponse.json(
        { success: false, error: 'Deal unavailable, expired, or already claimed by this device' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      claimCode,
      message: 'Deal claimed successfully',
      expiresIn: '30 minutes'
    });
    
  } catch (error) {
    console.error('Claim deal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to claim deal' },
      { status: 500 }
    );
  }
}