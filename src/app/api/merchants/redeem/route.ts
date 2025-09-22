import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  return rateLimit(10, 60000)(request, async () => {
    try {
      const { claimCode } = await request.json();

      if (!claimCode) {
        return NextResponse.json(
          { success: false, error: 'Claim code required' },
          { status: 400 }
        );
      }

      const success = await db.redeemClaim(claimCode);

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
  });
}