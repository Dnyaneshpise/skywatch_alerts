import { FlightData } from '@/types/flight';
import { ApiResponse, ApiError } from '@/types/api';
import RateLimitHandler from './rateLimitHandler';
import CacheService from './cacheService';

const ADSB_API_ENDPOINT = '/api/flights';
const MAX_RETRIES = 3;

export async function fetchNearbyFlights(
  lat: number,
  lon: number,
  radius: number = 250,
  forceRefresh: boolean = false
): Promise<FlightData[]> {
  const cacheService = CacheService.getInstance();
  const rateLimitHandler = RateLimitHandler.getInstance();

  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedData = cacheService.get(lat, lon, radius);
    if (cachedData && cacheService.isCacheFresh(lat, lon, radius)) {
      return cachedData;
    }
  }

  // Check if we should throttle requests
  if (rateLimitHandler.shouldThrottle(ADSB_API_ENDPOINT)) {
    await rateLimitHandler.backoff(ADSB_API_ENDPOINT);
  }

  let retryCount = 0;
  while (retryCount < MAX_RETRIES) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        radius: radius.toString()
      });

      const response = await fetch(`${ADSB_API_ENDPOINT}?${params}`);
      
      // Update rate limit info from headers
      rateLimitHandler.updateRateLimit(ADSB_API_ENDPOINT, response.headers);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Reset backoff on successful request
      rateLimitHandler.resetBackoff(ADSB_API_ENDPOINT);

      const flights = data.ac?.map((flight: any) => ({
        icao24: flight.hex,
        callsign: flight.flight?.trim() || 'N/A',
        latitude: flight.lat,
        longitude: flight.lon,
        altitude: flight.alt_baro,
        velocity: flight.gs,
        heading: flight.track,
        category: flight.category,
        squawk: flight.squawk,
        timestamp: flight.timestamp
      })) || [];

      // Cache the results
      cacheService.set(lat, lon, radius, flights);
      
      return flights;
    } catch (error) {
      console.error('Flight API Error:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        const apiError: ApiError = {
          code: 'API_ERROR',
          message: error.message
        };

        // Handle rate limit errors
        if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
          apiError.code = 'RATE_LIMIT_ERROR';
          await rateLimitHandler.backoff(ADSB_API_ENDPOINT);
          retryCount++;
          continue;
        }

        // Handle network errors
        if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
          apiError.code = 'NETWORK_ERROR';
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          retryCount++;
          continue;
        }

        throw apiError;
      }
      throw error;
    }
  }

  throw new Error('Max retries exceeded');
}

// Calculate optimal polling interval based on current conditions
export function calculatePollingInterval(
  numFlights: number,
  isUserActive: boolean,
  hasRateLimitWarning: boolean
): number {
  let interval = 10000; // Base interval: 10 seconds

  // Adjust based on number of flights
  if (numFlights === 0) {
    interval *= 2; // Less frequent if no flights
  } else if (numFlights > 10) {
    interval = Math.max(5000, interval / 2); // More frequent if many flights
  }

  // Adjust based on user activity
  if (!isUserActive) {
    interval *= 2; // Less frequent if user is inactive
  }

  // Adjust based on rate limit status
  if (hasRateLimitWarning) {
    interval *= 3; // Much less frequent if approaching rate limit
  }

  // Ensure minimum and maximum intervals
  return Math.min(Math.max(interval, 5000), 30000);
}