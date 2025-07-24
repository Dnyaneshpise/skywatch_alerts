import { FlightData } from '@/types/flight';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<FlightData[]>>;
  private readonly CACHE_TTL = 5000; // 5 seconds TTL for flight data
  private readonly MAX_CACHE_AGE = 30000; // 30 seconds maximum cache age

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private getCacheKey(lat: number, lon: number, radius: number): string {
    return `${lat.toFixed(4)}_${lon.toFixed(4)}_${radius}`;
  }

  public set(lat: number, lon: number, radius: number, data: FlightData[]): void {
    const key = this.getCacheKey(lat, lon, radius);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public get(lat: number, lon: number, radius: number): FlightData[] | null {
    const key = this.getCacheKey(lat, lon, radius);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    
    // Return null if cache is too old
    if (age > this.MAX_CACHE_AGE) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public isCacheFresh(lat: number, lon: number, radius: number): boolean {
    const key = this.getCacheKey(lat, lon, radius);
    const entry = this.cache.get(key);

    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age < this.CACHE_TTL;
  }

  public clear(): void {
    this.cache.clear();
  }
}

export default CacheService; 