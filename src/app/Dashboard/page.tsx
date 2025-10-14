"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

type Flight = {
  id: string;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  airline: string;
  aircraftType: string;
};

type AlertZone = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number; // in km
};

const thStyle = {
  padding: '10px',
  textAlign: 'left' as const,
  fontWeight: 600,
  color: '#e5e7eb'
};

const tdStyle = {
  padding: '10px',
  color: '#d1d5db'
};

const actionBtn = (bgColor: string) => ({
  backgroundColor: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 10px',
  marginRight: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem'
});


export default function Dashboard() {

  const [flights, setFlights] = useState<Flight[]>([]);
  const [alertZones, setAlertZones] = useState<AlertZone[]>([
    { id: "1", name: "Zone 1", lat: 28.6139, lon: 77.209, radius: 50 },
    { id: "2", name: "Zone 2", lat: 40.7128, lon: -74.006, radius: 30 },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AlertZone | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch flights based on first alert zone for demo
  useEffect(() => {
    if (alertZones.length === 0) return;
    const zone = alertZones[0];
    setLoading(true);
    fetch(`/api/flights?lat=${zone.lat}&lon=${zone.lon}&radius=${zone.radius}`)
      .then((res) => res.json())
      .then((data) => {
        setFlights(data.flights || []);
        setLastUpdate(new Date());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [alertZones]);

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
        padding: "0 1rem",
      }}
    >
      <section
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "#1976d2",
            color: "white",
            padding: "1rem",
            borderRadius: 8,
            minWidth: 150,
          }}
        >
          <h3>Active Alerts</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{flights.length}</p>
        </div>
        <div
          style={{
            background: "#388e3c",
            color: "white",
            padding: "1rem",
            borderRadius: 8,
            minWidth: 150,
          }}
        >
          <h3>Alert Zones</h3>
          <p style={{ fontSize: "2rem", margin: 0 }}>{alertZones.length}</p>
        </div>
        <div
          style={{
            background: "#fbc02d",
            color: "#444",
            padding: "1rem",
            borderRadius: 8,
            minWidth: 200,
          }}
        >
          <h3>Last Update</h3>
          <p style={{ fontSize: "1rem", margin: 0 }}>
            {lastUpdate ? lastUpdate.toLocaleTimeString() : "N/A"}
          </p>
        </div>
      </section>

      {/* Map */}
      <section style={{ height: 400, marginBottom: "2rem", zIndex: "50" }}>
        <MapContainer
          center={[alertZones[0].lat, alertZones[0].lon]}
          zoom={6}
          style={{ height: "100%", borderRadius: 8 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {alertZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lon]}
              radius={zone.radius * 1000} // meters
              pathOptions={{ color: "red", fillOpacity: 0.1 }}
              eventHandlers={{
                click: () => setSelectedZone(zone),
              }}
            />
          ))}
          {flights.map((flight) => (
            <Marker key={flight.id} position={[flight.lat, flight.lon]}>
              <Popup>
                <strong>{flight.airline}</strong>
                <br />
                Aircraft: {flight.aircraftType}
                <br />
                Altitude: {flight.altitude} ft
                <br />
                Speed: {flight.speed} knots
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* Alert Zones List */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "white", marginBottom: "1rem" }}>🚨 Alert Zones</h2>
        <div
          style={{
            background: "#111827",
            borderRadius: 12,
            padding: "1rem",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "white",
            }}
          >
            <thead>
              <tr style={{ background: "#1f2937" }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Latitude</th>
                <th style={thStyle}>Longitude</th>
                <th style={thStyle}>Radius (km)</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alertZones.map((zone) => (
                <tr
                  key={zone.id}
                  style={{
                    borderBottom: "1px solid #2d3748",
                    transition: "background 0.3s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1a202c")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={tdStyle}>{zone.name}</td>
                  <td style={tdStyle}>{zone.lat.toFixed(3)}</td>
                  <td style={tdStyle}>{zone.lon.toFixed(3)}</td>
                  <td style={tdStyle}>{zone.radius}</td>
                  <td style={tdStyle}>
                    <button
                      style={actionBtn("#3b82f6")}
                      onClick={() => alert(`Edit ${zone.name}`)}
                    >
                      Edit
                    </button>
                    <button
                      style={actionBtn("#ef4444")}
                      onClick={() => alert(`Delete ${zone.name}`)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <button
              onClick={() => alert("Add new alert zone")}
              style={{
                padding: "10px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add Alert Zone
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
