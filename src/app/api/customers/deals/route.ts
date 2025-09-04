import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '37.5665');
    const lng = parseFloat(searchParams.get('lng') || '126.9780');
    const radius = parseInt(searchParams.get('radius') || '200');
    
    const deals = await db.getActiveDealsNearLocation(lat, lng, radius);
    
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