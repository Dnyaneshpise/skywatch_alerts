'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef } from 'react';
import useLocation from '@/hooks/useLocation';
import { fetchNearbyFlights, calculatePollingInterval } from '@/lib/flights/adsbClient';
import { FlightData } from '@/types/flight';
import RateLimitHandler from '@/lib/flights/rateLimitHandler';
import { ApiError } from '@/types/api';

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
  const [isUserActive, setIsUserActive] = useState(true);
  const lastActivityTime = useRef(Date.now());
  const pollingInterval = useRef<number>(10000);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      lastActivityTime.current = Date.now();
      setIsUserActive(true);
    };

    // Events to track
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check inactivity every minute
    const inactivityCheck = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityTime.current;
      if (inactiveTime > 5 * 60 * 1000) { // 5 minutes
        setIsUserActive(false);
      }
    }, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(inactivityCheck);
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    if (!coords) return;

    try {
      setError(null);
      const flightsData = await fetchNearbyFlights(
        coords.latitude,
        coords.longitude,
        250,
        forceRefresh
      );

      setFlights(flightsData);
      
      // Calculate next polling interval
      const rateLimitHandler = RateLimitHandler.getInstance();
      const rateLimitInfo = rateLimitHandler.getRateLimitInfo('/api/flights');
      const hasRateLimitWarning = rateLimitHandler.shouldThrottle('/api/flights');
      
      pollingInterval.current = calculatePollingInterval(
        flightsData.length,
        isUserActive,
        hasRateLimitWarning
      );

      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      
      if (err instanceof Error) {
        const errorMessage = (err as ApiError).code === 'RATE_LIMIT_ERROR'
          ? 'Rate limit exceeded. Please wait a moment.'
          : err.message;
        
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
      
      setLoading(false);
    }
  }, [coords, isUserActive]);

  useEffect(() => {
    if (!coords) return;

    let mounted = true;
    const abortController = new AbortController();

    const scheduleFetch = () => {
      if (!mounted) return;
      
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      // Schedule next fetch
      fetchTimeoutRef.current = setTimeout(() => {
        fetchData(false).then(() => {
          if (mounted) {
            scheduleFetch();
          }
        });
      }, pollingInterval.current);
    };

    // Initial fetch
    fetchData(true).then(() => {
      if (mounted) {
        scheduleFetch();
      }
    });

    return () => {
      mounted = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      abortController.abort();
    };
  }, [coords, fetchData]);

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
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden border">
      {loading && (
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

      {/* Rate limit warning */}
      {RateLimitHandler.getInstance().shouldThrottle('/api/flights') && (
        <div className="absolute bottom-4 left-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg">
          <p className="font-bold">Rate Limit Warning</p>
          <p className="text-sm">Reducing update frequency to avoid rate limits.</p>
        </div>
      )}
    </div>
  );
}