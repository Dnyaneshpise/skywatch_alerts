import { useEffect, useState } from "react";

function locationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Enable location access in your browser settings, then reload.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your device could not determine a precise location right now.";
  }

  return null;
}

export default function useLocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    let watchId: number | null = null;

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation(position);
      setError(null);
    };

    const handleError = (err: GeolocationPositionError) => {
      const message = locationErrorMessage(err);
      if (message) {
        setError(message);
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 15000,
    });

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: false,
      maximumAge: 60 * 1000,
      timeout: 30000,
    });

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return {
    coords: location?.coords,
    error,
    formatted: location?.coords
      ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
      : null,
  };
}
