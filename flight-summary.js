// Simple in-memory store for demo purposes
const flightsToday = [
  {
    hex: 'ABC123',
    flight: 'AI101',
    airline: 'Air India',
    type: 'A320',
    altitude: 12000,
    speed: 450,
    timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  },
  {
    hex: 'DEF456',
    flight: '6E202',
    airline: 'IndiGo',
    type: 'A320',
    altitude: 9500,
    speed: 420,
    timestamp: Math.floor(Date.now() / 1000) - 1800, // 30 min ago
  },
  {
    hex: 'GHI789',
    flight: 'UK303',
    airline: 'Vistara',
    type: 'B737',
    altitude: 8000,
    speed: 0,
    timestamp: Math.floor(Date.now() / 1000) - 600, // 10 min ago
  },
  {
    hex: 'JKL012',
    flight: 'AI102',
    airline: 'Air India',
    type: 'A320',
    altitude: 15000,
    speed: 470,
    timestamp: Math.floor(Date.now() / 1000) - 300, // 5 min ago
  },
];

function recordFlightData(flightData) {
  flightsToday.push(...flightData); // Add new flights
}

function getSummaryMetrics() {
  const totalFlights = flightsToday.length;

  // Group by hour
  const flightsByHour = {};
  flightsToday.forEach(f => {
    const hour = new Date(f.timestamp * 1000).getHours();
    flightsByHour[hour] = (flightsByHour[hour] || 0) + 1;
  });
  const peakHour = Object.entries(flightsByHour).sort((a, b) => b[1] - a[1])[0];

  // Most frequent airline/aircraft
  const airlineCount = {};
  const aircraftTypeCount = {};
  flightsToday.forEach(f => {
    airlineCount[f.airline] = (airlineCount[f.airline] || 0) + 1;
    aircraftTypeCount[f.type] = (aircraftTypeCount[f.type] || 0) + 1;
  });
  const frequentAirline = Object.entries(airlineCount).sort((a, b) => b[1] - a[1])[0];
  const frequentAircraft = Object.entries(aircraftTypeCount).sort((a, b) => b[1] - a[1])[0];

  // Average altitude & speed
  const avgAltitude = flightsToday.reduce((sum, f) => sum + (f.altitude || 0), 0) / totalFlights;
  const avgSpeed = flightsToday.reduce((sum, f) => sum + (f.speed || 0), 0) / totalFlights;

  // Flagged events
  const lowAltitude = flightsToday.filter(f => f.altitude < 10000);
  const stationary = flightsToday.filter(f => f.speed < 30); // Example threshold

  return {
    totalFlights,
    peakHour,
    frequentAirline,
    frequentAircraft,
    avgAltitude,
    avgSpeed,
    flagged: {
      lowAltitude: lowAltitude.length,
      stationary: stationary.length,
    }
  };
}

module.exports = { recordFlightData, getSummaryMetrics };