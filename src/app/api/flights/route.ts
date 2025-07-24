import { NextResponse } from 'next/server';
import { ApiError } from '@/types/api';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function getRateLimitInfo(ip: string): { remaining: number; reset: number } {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || userRequests.resetTime <= now) {
    // Reset or initialize rate limit info
    requestCounts.set(ip, {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return {
      remaining: MAX_REQUESTS_PER_WINDOW,
      reset: Math.floor((now + RATE_LIMIT_WINDOW) / 1000)
    };
  }

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - userRequests.count);
  return {
    remaining,
    reset: Math.floor(userRequests.resetTime / 1000)
  };
}

function updateRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(ip);

  if (!userRequests || userRequests.resetTime <= now) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (userRequests.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userRequests.count++;
  return true;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius') || '50';

  // Get client IP (in production, you'd get this from request headers)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Missing lat/lon parameters' },
      { status: 400 }
    );
  }

  // Check rate limit
  const rateLimitInfo = getRateLimitInfo(ip);
  const canMakeRequest = updateRateLimit(ip);

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
    'X-RateLimit-Remaining': String(rateLimitInfo.remaining),
    'X-RateLimit-Reset': String(rateLimitInfo.reset)
  };

  if (!canMakeRequest) {
    const error: ApiError = {
      code: 'RATE_LIMIT_ERROR',
      message: 'Rate limit exceeded',
      retryAfter: rateLimitInfo.reset - Math.floor(Date.now() / 1000)
    };

    return NextResponse.json(
      { error },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': String(error.retryAfter)
        }
      }
    );
  }

  try {
    const apiUrl = `https://api.adsb.lol/v2/point/${lat}/${lon}/${radius}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SkyWatchAlerts/1.0'
      },
      next: { revalidate: 10 } // Cache for 10 seconds
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Proxy API Error:', error);
    
    const apiError: ApiError = {
      code: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    };

    return NextResponse.json(
      { error: apiError },
      { status: 500, headers }
    );
  }
}

export const dynamic = 'force-dynamic';