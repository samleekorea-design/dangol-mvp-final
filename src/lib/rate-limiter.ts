import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}


const rateLimitStore: RateLimitStore = {};

export function rateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
) {
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const clientId = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (!rateLimitStore[clientId] || rateLimitStore[clientId].resetTime < now) {
      rateLimitStore[clientId] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    const client = rateLimitStore[clientId];
    
    if (client.count >= maxRequests) {
      const retryAfter = Math.ceil((client.resetTime - now) / 1000);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(client.resetTime).toISOString()
          }
        }
      );
    }
    
    client.count++;
    
    const response = await handler();
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - client.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(client.resetTime).toISOString());
    
    return response;
  };
}
