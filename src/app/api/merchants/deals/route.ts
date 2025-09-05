import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { autoNotificationService } from '@/lib/autoNotificationService';

export async function POST(request: NextRequest) {
  try {
    const { merchantId, title, description, hours, minutes, maxClaims } = await request.json();
    
    if (!merchantId || !title || !description || (hours === undefined && minutes === undefined)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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
    
    const deal = await db.createDeal(merchantId, title, description, hoursValue, minutesValue, maxClaims || 999);
    
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