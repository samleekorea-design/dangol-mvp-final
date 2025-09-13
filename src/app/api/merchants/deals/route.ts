import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { autoNotificationService } from '@/lib/autoNotificationService';

export async function POST(request: NextRequest) {
  try {
    const { merchantId, title, description, starts_at, expires_at, hours, minutes, maxClaims } = await request.json();
    
    if (!merchantId || !title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle both new scheduling format and legacy format for backward compatibility
    let startTime: Date;
    let endTime: Date;

    if (starts_at && expires_at) {
      // New format with explicit start and end times
      startTime = new Date(starts_at);
      endTime = new Date(expires_at);
      
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      
      if (endTime <= startTime) {
        return NextResponse.json(
          { success: false, error: '종료 시간은 시작 시간보다 뒤여야 합니다' },
          { status: 400 }
        );
      }
    } else {
      // Legacy format with hours/minutes duration
      if (hours === undefined && minutes === undefined) {
        return NextResponse.json(
          { success: false, error: 'Either starts_at/expires_at or hours/minutes required' },
          { status: 400 }
        );
      }
      
      const hoursValue = hours || 0;
      const minutesValue = minutes || 0;
      
      if (hoursValue < 0 || hoursValue > 23) {
        return NextResponse.json(
          { success: false, error: 'Hours must be between 0 and 23' },
          { status: 400 }
        );
      }
      
      if (minutesValue < 0 || minutesValue > 59) {
        return NextResponse.json(
          { success: false, error: 'Minutes must be between 0 and 59' },
          { status: 400 }
        );
      }
      
      if (hoursValue === 0 && minutesValue === 0) {
        return NextResponse.json(
          { success: false, error: 'Deal must have at least 1 minute validity' },
          { status: 400 }
        );
      }
      
      startTime = new Date();
      endTime = new Date(startTime.getTime() + (hoursValue * 60 + minutesValue) * 60 * 1000);
    }
    
    const deal = await db.createDealWithTimes(merchantId, title, description, startTime, endTime, maxClaims || 999);
    
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Failed to create deal' },
        { status: 500 }
      );
    }

    // Trigger automatic notification to customers (non-blocking)
    autoNotificationService.notifyNewDeal(deal.id).catch(error => {
      console.error('Auto-notification failed:', error);
    });
    
    return NextResponse.json({
      success: true,
      deal,
      message: 'Deal created successfully'
    });
    
  } catch (error) {
    console.error('Create deal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchantId');
    
    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: 'Merchant ID required' },
        { status: 400 }
      );
    }
    
    const deals = await db.getMerchantDeals(parseInt(merchantId));
    
    return NextResponse.json({
      success: true,
      deals
    });
    
  } catch (error) {
    console.error('Get deals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}