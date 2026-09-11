import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const radius = searchParams.get("radius") || "250";

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat/lon parameters" },
      { status: 400 },
    );
  }

  try {
    const latitude = Number(lat);
    const longitude = Number(lon);
    const radiusKm = Math.max(1, Number(radius));
    const nauticalMiles = Math.min(250, Math.ceil(radiusKm / 1.852));
    const latitudeDelta = radiusKm / 111;
    const longitudeDelta =
      latitudeDelta / Math.max(0.1, Math.cos((latitude * Math.PI) / 180));
    const headers = {
      Accept: "application/json",
      "User-Agent": "SkyWatchAlerts/1.0",
    };

    const [adsbResult, openSkyResult] = await Promise.allSettled([
      fetch(`https://api.adsb.lol/v2/point/${lat}/${lon}/${nauticalMiles}`, {
        headers,
        cache: "no-store",
      }),
      fetch(
        `https://opensky-network.org/api/states/all?lamin=${latitude - latitudeDelta}&lomin=${longitude - longitudeDelta}&lamax=${latitude + latitudeDelta}&lomax=${longitude + longitudeDelta}`,
        { headers, cache: "no-store" },
      ),
    ]);

    const aircraft = new Map<string, Record<string, unknown>>();

    if (adsbResult.status === "fulfilled" && adsbResult.value.ok) {
      const data = await adsbResult.value.json();
      for (const flight of data.ac ?? []) {
        if (flight.hex) aircraft.set(flight.hex, flight);
      }
    }

    if (openSkyResult.status === "fulfilled" && openSkyResult.value.ok) {
      const data = await openSkyResult.value.json();
      for (const state of data.states ?? []) {
        const flight = openSkyStateToAircraft(state);
        if (
          flight.hex &&
          typeof flight.lat === "number" &&
          typeof flight.lon === "number" &&
          distanceInKm(latitude, longitude, flight.lat, flight.lon) <=
            radiusKm &&
          !aircraft.has(flight.hex as string)
        )
          aircraft.set(flight.hex as string, flight);
      }
    }

    for (const [hex, flight] of aircraft) {
      if (
        typeof flight.lat !== "number" ||
        typeof flight.lon !== "number" ||
        distanceInKm(latitude, longitude, flight.lat, flight.lon) > radiusKm
      ) {
        aircraft.delete(hex);
      }
    }

    if (
      aircraft.size === 0 &&
      adsbResult.status === "rejected" &&
      openSkyResult.status === "rejected"
    ) {
      throw new Error("All flight data providers are unavailable");
    }

    return NextResponse.json({ ac: [...aircraft.values()] });
  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

function openSkyStateToAircraft(state: unknown[]) {
  return {
    hex: state[0],
    flight: typeof state[1] === "string" ? state[1].trim() : undefined,
    lat: state[6],
    lon: state[5],
    alt_baro: state[7],
    gs: state[9],
    track: state[10],
    seen_pos: undefined,
    category: undefined,
    r: undefined,
    squawk: state[14],
    emergency: state[15],
    baro_rate: state[11],
  };
}

function distanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const latitudeDelta = ((lat2 - lat1) * Math.PI) / 180;
  const longitudeDelta = ((lon2 - lon1) * Math.PI) / 180;
  const latitude1 = (lat1 * Math.PI) / 180;
  const latitude2 = (lat2 * Math.PI) / 180;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 *
      Math.cos(latitude1) *
      Math.cos(latitude2);

  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export const dynamic = "force-dynamic";
