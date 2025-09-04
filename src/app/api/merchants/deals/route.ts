import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { autoNotificationService } from '@/lib/autoNotificationService';

export async function POST(request: NextRequest) {
  try {
    const { merchantId, title, description, hours, maxClaims } = await request.json();
    
    if (!merchantId || !title || !description || !hours) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (hours < 1 || hours > 24) {
      return NextResponse.json(
        { success: false, error: 'Hours must be between 1 and 24' },
        { status: 400 }
      );
    }
    
    const deal = await db.createDeal(merchantId, title, description, hours, maxClaims || 999);
    
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