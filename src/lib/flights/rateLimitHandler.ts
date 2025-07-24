import { RateLimitInfo } from '@/types/api';

export default class RateLimitHandler {
  private static instance: RateLimitHandler;
  private rateLimits: Map<string, RateLimitInfo>;
  private backoffTimes: Map<string, number>;
  private readonly MAX_BACKOFF = 300000; // 5 minutes in milliseconds
  private readonly INITIAL_BACKOFF = 1000; // 1 second

  private constructor() {
    this.rateLimits = new Map();
    this.backoffTimes = new Map();
  }

  public static getInstance(): RateLimitHandler {
    if (!RateLimitHandler.instance) {
      RateLimitHandler.instance = new RateLimitHandler();
    }
    return RateLimitHandler.instance;
  }

  public updateRateLimit(endpoint: string, headers: Headers): void {
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '0', 10);
    const reset = parseInt(headers.get('X-RateLimit-Reset') || '0', 10);
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '0', 10);

    this.rateLimits.set(endpoint, {
      remaining,
      reset: reset * 1000, // Convert to milliseconds
      limit,
      lastUpdated: Date.now()
    });
  }

  public shouldThrottle(endpoint: string): boolean {
    const rateLimit = this.rateLimits.get(endpoint);
    if (!rateLimit) return false;

    // If we have less than 10% of requests remaining, start throttling
    return rateLimit.remaining < (rateLimit.limit * 0.1);
  }

  public async getBackoffDelay(endpoint: string): Promise<number> {
    const currentBackoff = this.backoffTimes.get(endpoint) || this.INITIAL_BACKOFF;
    const rateLimit = this.rateLimits.get(endpoint);

    if (rateLimit && rateLimit.remaining === 0) {
      // If we're out of requests, wait until reset
      const waitTime = rateLimit.reset - Date.now();
      return Math.max(waitTime, 0);
    }

    // Exponential backoff with jitter
    const jitter = Math.random() * 1000;
    return Math.min(currentBackoff + jitter, this.MAX_BACKOFF);
  }

  public async backoff(endpoint: string): Promise<void> {
    const delay = await this.getBackoffDelay(endpoint);
    const currentBackoff = this.backoffTimes.get(endpoint) || this.INITIAL_BACKOFF;
    
    // Double the backoff time for next attempt
    this.backoffTimes.set(endpoint, Math.min(currentBackoff * 2, this.MAX_BACKOFF));
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  public resetBackoff(endpoint: string): void {
    this.backoffTimes.delete(endpoint);
  }

  public getRateLimitInfo(endpoint: string): RateLimitInfo | undefined {
    return this.rateLimits.get(endpoint);
  }
} 