import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { businessName, address, phone, email, password } = await request.json();
    
    // Basic validation
    if (!businessName || !address || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // For MVP, use hardcoded Seoul coordinates - in production would use geocoding API
    const latitude = 37.5665;
    const longitude = 126.9780;
    
    const merchant = await db.createMerchant(businessName, address, phone || '', email, latitude, longitude, password);
    
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Email already exists or registration failed' },
        { status: 409 }
      );
    }
    
    // Don't return password hash
    const { password_hash, ...merchantData } = merchant;
    
    return NextResponse.json({
      success: true,
      merchant: merchantData,
      message: 'Merchant registered successfully'
    });
    
  } catch (error) {
    console.error('Merchant registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }
    
    const merchant = await db.authenticateMerchant(email, password);
    
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Don't return password hash
    const { password_hash, ...merchantData } = merchant;
    
    return NextResponse.json({
      success: true,
      merchant: merchantData,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Merchant login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}