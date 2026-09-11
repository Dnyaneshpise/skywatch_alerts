import { FlightData } from "@/types/flight";

type RawAircraft = {
  hex?: string;
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number;
  gs?: number;
  track?: number;
  t?: string;
  category?: string;
  r?: string;
  squawk?: string;
  emergency?: string;
  baro_rate?: number;
  seen_pos?: number;
};

function numericValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function fetchNearbyFlights(
  lat: number,
  lon: number,
  radius: number = 250,
): Promise<FlightData[]> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      radius: radius.toString(),
    });

    const response = await fetch(`/api/flights?${params}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error ${response.status}`);
    }

    const data = (await response.json()) as {
      ac?: RawAircraft[];
    };

    return (data.ac ?? [])
      .filter(
        (
          flight,
        ): flight is RawAircraft & {
          hex: string;
          lat: number;
          lon: number;
        } =>
          typeof flight.hex === "string" &&
          typeof flight.lat === "number" &&
          Number.isFinite(flight.lat) &&
          typeof flight.lon === "number" &&
          Number.isFinite(flight.lon),
      )
      .map((flight) => ({
        icao24: flight.hex,
        callsign: flight.flight?.trim() || "N/A",
        latitude: flight.lat,
        longitude: flight.lon,
        altitude: numericValue(flight.alt_baro),
        velocity: numericValue(flight.gs),
        heading: numericValue(flight.track),
        aircraftType: flight.t ?? "Unknown",
        category: flight.category ?? "Unknown",
        registration: flight.r ?? "Unknown",
        squawk: flight.squawk ?? "Unknown",
        emergency: flight.emergency ?? "none",
        verticalRate: numericValue(flight.baro_rate),
        timestamp:
          typeof flight.seen_pos === "number" && Number.isFinite(flight.seen_pos)
            ? Date.now() - flight.seen_pos * 1000
            : Date.now(),
      }));
  } catch (error) {
    console.error("Flight API Error:", error);
    throw error;
  }
}
