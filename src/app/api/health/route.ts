import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Test database connection
    const testQuery = (await db.pool.query('SELECT 1 as test')).rows[0] as { test: number };
    
    // Get database stats
    const merchantCount = (await db.pool.query('SELECT COUNT(*) as count FROM merchants')).rows[0] as { count: number };
    const dealCount = (await db.pool.query('SELECT COUNT(*) as count FROM deals')).rows[0] as { count: number };
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        merchants: merchantCount.count,
        deals: dealCount.count
      },
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development'
    }, { status: 500 });
  }
}