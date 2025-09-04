import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Fetching claimed deals for device:', deviceId);
    
    // Get all active claims for this device
    const claimedDeals = await db.getClaimedDealsByDevice(deviceId);
    
    console.log('📋 Found claimed deals:', claimedDeals.length);
    
    return NextResponse.json({
      success: true,
      claimedDeals,
      deviceId
    });
    
  } catch (error) {
    console.error('Get claimed deals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claimed deals' },
      { status: 500 }
    );
  }
}