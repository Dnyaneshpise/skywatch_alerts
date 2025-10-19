import { FlightData } from "@/types/flight";

// Seed data for demonstration purposes
export const seedFlightData: FlightData[] = [
  {
    icao24: "a12345",
    callsign: "UAL1234",
    latitude: 40.7589,
    longitude: -73.9851,
    altitude: 35000,
    velocity: 485,
    heading: 280,
    timestamp: Date.now()
  },
  {
    icao24: "b67890",
    callsign: "DAL456",
    latitude: 40.7614,
    longitude: -73.9776,
    altitude: 28000,
    velocity: 420,
    heading: 95,
    timestamp: Date.now()
  },
  {
    icao24: "c11111",
    callsign: "AAL789",
    latitude: 40.7505,
    longitude: -73.9934,
    altitude: 15000,
    velocity: 320,
    heading: 180,
    timestamp: Date.now()
  },
  {
    icao24: "d22222",
    callsign: "SWA101",
    latitude: 40.7282,
    longitude: -73.7949,
    altitude: 42000,
    velocity: 510,
    heading: 45,
    timestamp: Date.now()
  },
  {
    icao24: "e33333",
    callsign: "JBU202",
    latitude: 40.7831,
    longitude: -73.9712,
    altitude: 8500,
    velocity: 180,
    heading: 315,
    timestamp: Date.now()
  },
  {
    icao24: "f44444",
    callsign: "EJA303",
    latitude: 40.7397,
    longitude: -73.9897,
    altitude: 25000,
    velocity: 380,
    heading: 120,
    timestamp: Date.now()
  },
  {
    icao24: "g55555",
    callsign: "N456GH",
    latitude: 40.7686,
    longitude: -73.9845,
    altitude: 3500,
    velocity: 150,
    heading: 270,
    timestamp: Date.now()
  },
  {
    icao24: "h66666",
    callsign: "UAL567",
    latitude: 40.7489,
    longitude: -73.9680,
    altitude: 38000,
    velocity: 465,
    heading: 60,
    timestamp: Date.now()
  },
  {
    icao24: "i77777",
    callsign: "VIR404",
    latitude: 40.7128,
    longitude: -74.0060,
    altitude: 31000,
    velocity: 445,
    heading: 225,
    timestamp: Date.now()
  },
  {
    icao24: "j88888",
    callsign: "BAW505",
    latitude: 40.7580,
    longitude: -73.9855,
    altitude: 39000,
    velocity: 480,
    heading: 90,
    timestamp: Date.now()
  },
  {
    icao24: "k99999",
    callsign: "AFR606",
    latitude: 40.7614,
    longitude: -73.9950,
    altitude: 12000,
    velocity: 290,
    heading: 150,
    timestamp: Date.now()
  },
  {
    icao24: "l00000",
    callsign: "LUF707",
    latitude: 40.7295,
    longitude: -73.9965,
    altitude: 45000,
    velocity: 520,
    heading: 330,
    timestamp: Date.now()
  }
];

// Default coordinates (New York City area for demonstration)
export const defaultCoords = {
  latitude: 40.7589,
  longitude: -73.9851
};

// Generate random variations to make seed data feel more dynamic
export const generateDynamicSeedData = (): FlightData[] => {
  return seedFlightData.map(flight => ({
    ...flight,
    // Add small random variations to altitude (±1000 ft)
    altitude: flight.altitude + (Math.random() - 0.5) * 2000,
    // Add small random variations to velocity (±20 kts)
    velocity: Math.max(100, flight.velocity + (Math.random() - 0.5) * 40),
    // Add small random variations to heading (±10 degrees)
    heading: (flight.heading + (Math.random() - 0.5) * 20 + 360) % 360,
    // Add small random variations to position (±0.01 degrees)
    latitude: flight.latitude + (Math.random() - 0.5) * 0.02,
    longitude: flight.longitude + (Math.random() - 0.5) * 0.02,
    timestamp: Date.now()
  }));
};