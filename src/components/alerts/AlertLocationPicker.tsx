"use client";

import { useEffect, useMemo } from "react";
import { Circle, Marker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";

type AlertLocationPickerProps = {
  lat: number;
  lon: number;
  radiusKm: number;
  onLocationChange: (location: { lat: number; lon: number }) => void;
  onRadiusChange: (radiusKm: number) => void;
};

const clampRadius = (value: number) => Math.min(500, Math.max(1, Math.round(value)));

export default function AlertLocationPicker({
  lat,
  lon,
  radiusKm,
  onLocationChange,
  onRadiusChange,
}: AlertLocationPickerProps) {
  const center = useMemo<[number, number]>(() => [lat, lon], [lat, lon]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        });
      },
      undefined,
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 15000,
      },
    );
  };

  return (
    <div className="space-y-4 sm:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="block text-sm font-medium mb-1">Alert Area</label>
          <p className="text-sm text-slate-400">Click the map, drag the pin, or use your current location.</p>
        </div>
        <div className="rounded-md bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
          {lat.toFixed(4)}, {lon.toFixed(4)} - {radiusKm} km
        </div>
      </div>

      <button
        type="button"
        onClick={useCurrentLocation}
        className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
      >
        Use my current location
      </button>

      <div className="h-[360px] overflow-hidden rounded-lg border border-slate-700 z-0">
        <MapContainer center={center} zoom={8} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapClickHandler onLocationChange={onLocationChange} />
          <MapCenterSync center={center} />
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "#38bdf8",
              fillColor: "#0ea5e9",
              fillOpacity: 0.12,
              weight: 2,
            }}
            eventHandlers={{
              click(event) {
                onLocationChange({
                  lat: Number(event.latlng.lat.toFixed(6)),
                  lon: Number(event.latlng.lng.toFixed(6)),
                });
              },
            }}
          />
          <Marker
            position={center}
            draggable
            eventHandlers={{
              dragend(event) {
                const next = event.target.getLatLng();
                onLocationChange({
                  lat: Number(next.lat.toFixed(6)),
                  lon: Number(next.lng.toFixed(6)),
                });
              },
            }}
          />
        </MapContainer>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <label htmlFor="alert-radius" className="font-medium">Radius</label>
          <span className="text-slate-400">{radiusKm} km</span>
        </div>
        <input
          id="alert-radius"
          type="range"
          min={1}
          max={500}
          step={1}
          value={radiusKm}
          onChange={(event) => onRadiusChange(clampRadius(Number(event.target.value)))}
          className="w-full accent-blue-500"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-500">
          <span>1 km</span>
          <span>500 km</span>
        </div>
      </div>
    </div>
  );
}

function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (location: { lat: number; lon: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onLocationChange({
        lat: Number(event.latlng.lat.toFixed(6)),
        lon: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function MapCenterSync({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}
