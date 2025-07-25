// /components/map/LiveRadar.tsx
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import useLocation from '@/hooks/useLocation';
import { fetchNearbyFlights } from '@/lib/flights/adsbClient';
import { FlightData } from '@/types/flight';

// Dynamically import Leaflet with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Fix for airplane icon rotation
const createAirplaneIcon = (heading: number) => {
  const L = require('leaflet');
  return L.icon({
    iconUrl: '/airplane-icon.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'airplane-marker',
    transform: `rotate(${heading}deg)`
  });
};

export default function LiveRadar() {
  const { coords, formatted, error: locationError } = useLocation();
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!coords) return;

    let mounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const flightsData = await fetchNearbyFlights(
          coords.latitude,
          coords.longitude
        );
        if (mounted) {
          setFlights(flightsData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load flight data');
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
      abortController.abort();
    };
  }, [coords]);

  if (locationError) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 font-bold text-xl mb-2">Location Error</div>
          <p className="text-gray-700 mb-4">{locationError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-100"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Detecting your location...</p>
        </div>
      </div>
    );
  }

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
    // ✅ FIX 2: Added z-0 to create a new stacking context for the map.
    // This "traps" Leaflet's high internal z-indexes below the navbar.
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden border z-0">
      {loading && (
        // The loading overlay's z-10 is now relative to this container's z-0 context.
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading flight data...</p>
          </div>
        </div>
      )}
      
      <MapContainer
        center={[coords.latitude, coords.longitude]}
        zoom={12}
        className="h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <Marker position={[coords.latitude, coords.longitude]}>
          <Popup>
            <div className="min-w-[200px]">
              <div className="font-bold text-lg">Your Location</div>
              <div className="text-gray-700">{formatted}</div>
            </div>
          </Popup>
        </Marker>
        
        {flights.map(flight => (
          <Marker 
            key={`${flight.icao24}-${flight.timestamp || Date.now()}`}
            position={[flight.latitude, flight.longitude]}
            icon={createAirplaneIcon(flight.heading)}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-bold text-lg">{flight.callsign}</div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-sm">
                  <div>Altitude:</div>
                  <div className="font-mono">{flight.altitude} ft</div>
                  <div>Speed:</div>
                  <div className="font-mono">{Math.round(flight.velocity)} kts</div>
                  <div>Heading:</div>
                  <div className="font-mono">{Math.round(flight.heading)}°</div>
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