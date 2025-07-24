export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
  lastUpdated: number;
}

export interface ApiError {
  code: string;
  message: string;
  retryAfter?: number;
}

export type ApiResponse<T> = {
  data: T;
  rateLimitInfo?: RateLimitInfo;
} | {
  error: ApiError;
} 