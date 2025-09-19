import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - checking database connection');
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '37.5665');
    const lng = parseFloat(searchParams.get('lng') || '126.9780');
    const radius = parseInt(searchParams.get('radius') || '200');
    const deviceId = searchParams.get('deviceId') || undefined;

    let deals;

    // If radius is 9999 or higher, get all deals without location filtering
    if (radius >= 9999) {
      deals = await db.getAllActiveDeals(deviceId);
    } else {
      deals = await db.getActiveDealsNearLocation(lat, lng, radius, deviceId);
    }
    
    return NextResponse.json({
      success: true,
      deals,
      location: { lat, lng, radius },
      count: deals.length
    });
    
  } catch (error) {
    console.error('Get customer deals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}