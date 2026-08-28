import { FlightData } from '@/types/flight';

function numericValue(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export async function fetchNearbyFlights(
  lat: number,
  lon: number,
  radius: number = 250
): Promise<FlightData[]> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      radius: radius.toString()
    });

    const response = await fetch(`/api/flights?${params}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.ac?.map((flight: any) => ({
      icao24: flight.hex,
      callsign: flight.flight?.trim() || 'N/A',
      latitude: flight.lat,
      longitude: flight.lon,
      altitude: numericValue(flight.alt_baro),
      velocity: numericValue(flight.gs),
      heading: numericValue(flight.track),
      aircraftType: flight.t,
      category: flight.category,
      registration: flight.r,
      squawk: flight.squawk,
      emergency: flight.emergency,
      verticalRate: numericValue(flight.baro_rate),
      timestamp: flight.seen_pos ? Date.now() - flight.seen_pos * 1000 : Date.now()
    })) || [];
  } catch (error) {
    console.error('Flight API Error:', error);
    throw error;
  }
}
