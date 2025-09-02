import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('📡 POST /api/customers/subscriptions - Saving push subscription...');
    
    const requestBody = await request.json();
    console.log('Request body received:', {
      hasDeviceId: !!requestBody.deviceId,
      deviceId: requestBody.deviceId,
      hasSubscription: !!requestBody.subscription,
      subscriptionEndpoint: requestBody.subscription?.endpoint?.substring(0, 50) + '...' || 'N/A',
      subscriptionKeys: requestBody.subscription?.keys ? Object.keys(requestBody.subscription.keys) : 'N/A'
    });
    
    const { deviceId, subscription } = requestBody;
    
    if (!deviceId || !subscription) {
      console.error('❌ Missing required fields:', { deviceId: !!deviceId, subscription: !!subscription });
      return NextResponse.json(
        { success: false, error: 'Device ID and subscription required' },
        { status: 400 }
      );
    }
    
    // Validate subscription structure
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      console.error('❌ Invalid subscription structure:', {
        hasEndpoint: !!subscription.endpoint,
        hasP256dh: !!subscription.keys?.p256dh,
        hasAuth: !!subscription.keys?.auth
      });
      return NextResponse.json(
        { success: false, error: 'Invalid subscription format - missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('✅ Subscription validation passed, saving to database...');
    
    // Save push subscription to database
    const saved = db.savePushSubscription(deviceId, subscription);
    console.log('💾 Database save result:', saved);
    
    if (saved) {
      console.log('✅ Push subscription saved successfully for device:', deviceId);
      return NextResponse.json({
        success: true,
        message: 'Push subscription saved successfully'
      });
    } else {
      console.error('❌ Database failed to save subscription');
      return NextResponse.json(
        { success: false, error: 'Failed to save push subscription to database' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Save push subscription error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { success: false, error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/customers/subscriptions - Removing push subscription...');
    
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    console.log('Device ID from query params:', deviceId);
    
    if (!deviceId) {
      console.error('❌ Missing device ID in DELETE request');
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Attempting to delete subscription for device:', deviceId);
    
    // Remove push subscription from database
    const deleted = db.deletePushSubscription(deviceId);
    console.log('💾 Database delete result:', deleted);
    
    if (deleted) {
      console.log('✅ Push subscription removed successfully for device:', deviceId);
      return NextResponse.json({
        success: true,
        message: 'Push subscription removed successfully'
      });
    } else {
      console.warn('⚠️ No subscription found for device:', deviceId);
      return NextResponse.json({
        success: false,
        message: 'No subscription found for this device'
      });
    }
    
  } catch (error) {
    console.error('❌ Delete push subscription error:', error);
    console.error('Delete error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { success: false, error: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}