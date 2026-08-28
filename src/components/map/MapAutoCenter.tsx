"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

type MapAutoCenterProps = {
  center: [number, number];
  zoom?: number;
  enabled?: boolean;
};

export default function MapAutoCenter({ center, zoom = 12, enabled = true }: MapAutoCenterProps) {
  const map = useMap();
  const previousCenter = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const previous = previousCenter.current;
    previousCenter.current = center;

    if (previous && previous[0] === center[0] && previous[1] === center[1]) {
      return;
    }

    map.setView(center, zoom, { animate: true });
  }, [center, enabled, map, zoom]);

  return null;
}
