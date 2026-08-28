export interface FlightData {
  icao24: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  timestamp: number;
  aircraftType?: string;
  category?: string;
  registration?: string;
  squawk?: string;
  emergency?: string;
  verticalRate?: number;
}
