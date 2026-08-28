"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import useLocation from "@/hooks/useLocation";
import { fetchNearbyFlights } from "@/lib/flights/adsbClient";
import { FlightData } from "@/types/flight";
import { defaultCoords, generateDynamicSeedData } from "@/lib/flights/seedData";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p>Loading map...</p>
        </div>
      </div>
    ),
  },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false },
);

const MapAutoCenter = dynamic(
  () => import("@/components/map/MapAutoCenter"),
  { ssr: false },
);

const aircraftCategoryLabels: Record<string, string> = {
  A1: "Light",
  A2: "Small",
  A3: "Large",
  A4: "High Vortex",
  A5: "Heavy",
  A6: "Performance",
  A7: "Rotorcraft",
  B1: "Glider",
  B2: "Lighter Than Air",
  B3: "Parachutist",
  B4: "Ultralight",
  B6: "UAV",
  B7: "Space",
  C1: "Emergency",
  C2: "Service",
  C3: "Ground",
  C4: "Ground",
};

function aircraftStyle(flight: FlightData) {
  if (flight.emergency && flight.emergency !== "none") {
    return { color: "#ef4444", label: "EMG" };
  }

  if (flight.category?.startsWith("B")) {
    const label = aircraftCategoryLabels[flight.category]?.slice(0, 3).toUpperCase() || "SPC";
    return { color: "#22c55e", label };
  }

  if (flight.category?.startsWith("C")) {
    return { color: "#f59e0b", label: "GND" };
  }

  if (flight.category === "A5") {
    return { color: "#a855f7", label: "HVY" };
  }

  if (flight.aircraftType) {
    return { color: "#38bdf8", label: flight.aircraftType.slice(0, 3).toUpperCase() };
  }

  return { color: "#38bdf8", label: "JET" };
}

function createAircraftIcon(flight: FlightData) {
  const L = require("leaflet");
  const style = aircraftStyle(flight);
  const heading = Number.isFinite(flight.heading) ? flight.heading : 0;

  return L.divIcon({
    className: "aircraft-marker",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -20],
    html: `
      <div class="aircraft-marker-shell" style="--aircraft-color: ${style.color};">
        <div class="aircraft-marker-plane" style="transform: rotate(${heading}deg);"></div>
        <div class="aircraft-marker-label">${style.label}</div>
      </div>
    `,
  });
}

function formatNumber(value: number | undefined, fallback = "N/A") {
  return typeof value === "number" && Number.isFinite(value) ? Math.round(value).toString() : fallback;
}

export default function LiveRadar() {
  const { coords, formatted, error: locationError } = useLocation();
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingSeedData, setUsingSeedData] = useState(false);

  const mapCenter: [number, number] = [
    coords?.latitude || defaultCoords.latitude,
    coords?.longitude || defaultCoords.longitude,
  ];

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentCoords = coords || defaultCoords;
        const flightsData = await fetchNearbyFlights(
          currentCoords.latitude,
          currentCoords.longitude,
        );

        if (!mounted) return;

        if (flightsData.length > 0) {
          setFlights(flightsData);
          setUsingSeedData(false);
        } else {
          setFlights(generateDynamicSeedData());
          setUsingSeedData(true);
        }
      } catch {
        if (mounted) {
          setFlights(generateDynamicSeedData());
          setUsingSeedData(true);
          setError(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [coords]);

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-yellow-50 rounded-lg">
        <div className="text-center p-6 max-w-md">
          <div className="text-yellow-600 font-bold text-xl mb-2">Flight Data Error</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[300px] h-[60vh] sm:h-[70vh] md:h-[600px] relative rounded-lg overflow-hidden border z-0">
      {usingSeedData && (
        <div className="absolute top-2 left-2 z-20 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium">
          Demo Data
        </div>
      )}

      {!coords && (
        <div className="absolute top-2 right-2 z-20 max-w-xs bg-slate-900/90 text-slate-100 px-3 py-2 rounded-md text-xs shadow-lg">
          {locationError || "Detecting location. Showing demo location for now."}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            <p className="mt-4">Loading flight data...</p>
          </div>
        </div>
      )}

      <MapContainer center={mapCenter} zoom={12} className="h-full">
        <MapAutoCenter center={mapCenter} enabled={!!coords} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Marker position={mapCenter}>
          <Popup>
            <div className="min-w-[200px]">
              <div className="font-bold text-lg">
                {coords ? "Your Location" : "Demo Location"}
              </div>
              <div className="text-gray-700">
                {formatted || `${defaultCoords.latitude.toFixed(4)}, ${defaultCoords.longitude.toFixed(4)}`}
              </div>
            </div>
          </Popup>
        </Marker>

        {flights.map((flight) => (
          <Marker
            key={`${flight.icao24}-${flight.timestamp || Date.now()}`}
            position={[flight.latitude, flight.longitude]}
            icon={createAircraftIcon(flight)}
          >
            <Popup>
              <div className="min-w-[240px]">
                <div className="font-bold text-lg">{flight.callsign}</div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                  <div>Type:</div>
                  <div className="font-mono">{flight.aircraftType || "Unknown"}</div>
                  <div>Category:</div>
                  <div className="font-mono">{flight.category ? `${flight.category} (${aircraftCategoryLabels[flight.category] || "Unknown"})` : "N/A"}</div>
                  <div>Altitude:</div>
                  <div className="font-mono">{formatNumber(flight.altitude)} ft</div>
                  <div>Speed:</div>
                  <div className="font-mono">{formatNumber(flight.velocity)} kts</div>
                  <div>Heading:</div>
                  <div className="font-mono">{formatNumber(flight.heading)} deg</div>
                  <div>Vertical:</div>
                  <div className="font-mono">{typeof flight.verticalRate === "number" ? `${formatNumber(flight.verticalRate)} fpm` : "N/A"}</div>
                  <div>Reg:</div>
                  <div className="font-mono">{flight.registration || "N/A"}</div>
                  <div>Squawk:</div>
                  <div className="font-mono">{flight.squawk || "N/A"}</div>
                  <div>ICAO24:</div>
                  <div className="font-mono">{flight.icao24}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
