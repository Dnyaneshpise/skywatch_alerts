"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FaPlane, 
  FaChartLine, 
  FaTachometerAlt, 
  FaRuler, 
  FaClock,
  FaMapMarkerAlt,
  FaDatabase 
} from "react-icons/fa";
import useLocation from "@/hooks/useLocation";
import { fetchNearbyFlights } from "@/lib/flights/adsbClient";
import { FlightData } from "@/types/flight";
import { generateDynamicSeedData, defaultCoords } from "@/lib/flights/seedData";

interface FlightStats {
  totalFlights: number;
  averageAltitude: number;
  averageSpeed: number;
  maxAltitude: number;
  maxSpeed: number;
  altitudeDistribution: { low: number; medium: number; high: number };
  speedDistribution: { slow: number; medium: number; fast: number };
  uniqueCallsigns: number;
}

export default function StatisticsPage() {
  const { coords } = useLocation();
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [stats, setStats] = useState<FlightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [usingSeedData, setUsingSeedData] = useState(false);

  const calculateStats = (flightData: FlightData[]): FlightStats => {
    if (flightData.length === 0) {
      return {
        totalFlights: 0,
        averageAltitude: 0,
        averageSpeed: 0,
        maxAltitude: 0,
        maxSpeed: 0,
        altitudeDistribution: { low: 0, medium: 0, high: 0 },
        speedDistribution: { slow: 0, medium: 0, fast: 0 },
        uniqueCallsigns: 0
      };
    }

    const validFlights = flightData.filter(f => f.altitude > 0 && f.velocity > 0);
    const altitudes = validFlights.map(f => f.altitude);
    const speeds = validFlights.map(f => f.velocity);
    const callsigns = new Set(validFlights.map(f => f.callsign).filter(c => c !== 'N/A'));

    const avgAltitude = altitudes.reduce((a, b) => a + b, 0) / altitudes.length || 0;
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length || 0;

    // Altitude categories (in feet)
    const lowAlt = validFlights.filter(f => f.altitude < 10000).length;
    const mediumAlt = validFlights.filter(f => f.altitude >= 10000 && f.altitude < 30000).length;
    const highAlt = validFlights.filter(f => f.altitude >= 30000).length;

    // Speed categories (in knots)
    const slowSpeed = validFlights.filter(f => f.velocity < 200).length;
    const mediumSpeed = validFlights.filter(f => f.velocity >= 200 && f.velocity < 400).length;
    const fastSpeed = validFlights.filter(f => f.velocity >= 400).length;

    return {
      totalFlights: flightData.length,
      averageAltitude: Math.round(avgAltitude),
      averageSpeed: Math.round(avgSpeed),
      maxAltitude: Math.max(...altitudes, 0),
      maxSpeed: Math.max(...speeds, 0),
      altitudeDistribution: { low: lowAlt, medium: mediumAlt, high: highAlt },
      speedDistribution: { slow: slowSpeed, medium: mediumSpeed, fast: fastSpeed },
      uniqueCallsigns: callsigns.size
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use provided coordinates or fall back to default location
        const currentCoords = coords || defaultCoords;
        
        try {
          // Try to fetch real flight data
          const flightsData = await fetchNearbyFlights(
            currentCoords.latitude,
            currentCoords.longitude,
            100 // Increase radius for better statistics
          );
          
          if (flightsData.length > 0) {
            setFlights(flightsData);
            setStats(calculateStats(flightsData));
            setUsingSeedData(false);
          } else {
            // If no real data, use seed data
            const seedData = generateDynamicSeedData();
            setFlights(seedData);
            setStats(calculateStats(seedData));
            setUsingSeedData(true);
          }
        } catch (apiError) {
          // If API fails, fall back to seed data
          const seedData = generateDynamicSeedData();
          setFlights(seedData);
          setStats(calculateStats(seedData));
          setUsingSeedData(true);
          console.log("Using seed data due to API error:", apiError);
        }
        
        setLastUpdated(new Date());
      } catch (err) {
        // Final fallback to seed data
        const seedData = generateDynamicSeedData();
        setFlights(seedData);
        setStats(calculateStats(seedData));
        setUsingSeedData(true);
        setError(null); // Clear error since we have seed data
        setLastUpdated(new Date());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [coords]);

  if (loading && !stats) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading flight statistics...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="text-lg font-semibold mb-2">Error Loading Statistics</p>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    unit, 
    color = "blue",
    subtitle 
  }: {
    icon: React.ReactNode;
    title: string;
    value: number;
    unit?: string;
    color?: string;
    subtitle?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border-l-4 border-${color}-500`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString()}{unit && ` ${unit}`}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`text-${color}-500 text-2xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const DistributionBar = ({ 
    label, 
    value, 
    total, 
    color 
  }: {
    label: string;
    value: number;
    total: number;
    color: string;
  }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700 dark:text-gray-300">{label}</span>
          <span className="text-gray-600 dark:text-gray-400">{value} ({Math.round(percentage)}%)</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaChartLine className="text-blue-500" />
          Flight Statistics
          {usingSeedData && (
            <span className="text-sm bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full flex items-center gap-1">
              <FaDatabase className="text-xs" />
              Demo Data
            </span>
          )}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {usingSeedData 
            ? "Demo analytics showing sample air traffic data (location permissions not required)"
            : "Real-time analytics of nearby air traffic in your area"
          }
        </p>
        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
            {usingSeedData && " (using sample data)"}
          </p>
        )}
      </div>

      {stats && (
        <>
          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FaPlane />}
              title="Total Flights"
              value={stats.totalFlights}
              color="blue"
              subtitle="Currently tracked"
            />
            <StatCard
              icon={<FaRuler />}
              title="Avg Altitude"
              value={stats.averageAltitude}
              unit="ft"
              color="green"
              subtitle={`Max: ${stats.maxAltitude.toLocaleString()} ft`}
            />
            <StatCard
              icon={<FaTachometerAlt />}
              title="Avg Speed"
              value={stats.averageSpeed}
              unit="kts"
              color="yellow"
              subtitle={`Max: ${stats.maxSpeed} kts`}
            />
            <StatCard
              icon={<FaMapMarkerAlt />}
              title="Unique Flights"
              value={stats.uniqueCallsigns}
              color="purple"
              subtitle="Distinct callsigns"
            />
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Altitude Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaRuler className="text-green-500" />
                Altitude Distribution
              </h3>
              <DistributionBar
                label="Low Altitude (< 10,000 ft)"
                value={stats.altitudeDistribution.low}
                total={stats.totalFlights}
                color="red"
              />
              <DistributionBar
                label="Medium Altitude (10,000 - 30,000 ft)"
                value={stats.altitudeDistribution.medium}
                total={stats.totalFlights}
                color="yellow"
              />
              <DistributionBar
                label="High Altitude (> 30,000 ft)"
                value={stats.altitudeDistribution.high}
                total={stats.totalFlights}
                color="green"
              />
            </motion.div>

            {/* Speed Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaTachometerAlt className="text-yellow-500" />
                Speed Distribution
              </h3>
              <DistributionBar
                label="Slow (< 200 kts)"
                value={stats.speedDistribution.slow}
                total={stats.totalFlights}
                color="blue"
              />
              <DistributionBar
                label="Medium (200 - 400 kts)"
                value={stats.speedDistribution.medium}
                total={stats.totalFlights}
                color="yellow"
              />
              <DistributionBar
                label="Fast (> 400 kts)"
                value={stats.speedDistribution.fast}
                total={stats.totalFlights}
                color="red"
              />
            </motion.div>
          </div>

          {/* Recent Flight Activity */}
          {flights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaClock className="text-purple-500" />
                Recent Flight Activity
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2">Callsign</th>
                      <th className="text-left py-2">Altitude</th>
                      <th className="text-left py-2">Speed</th>
                      <th className="text-left py-2">Heading</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.slice(0, 5).map((flight, index) => (
                      <tr key={flight.icao24} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 font-medium">{flight.callsign}</td>
                        <td className="py-2">{flight.altitude.toLocaleString()} ft</td>
                        <td className="py-2">{Math.round(flight.velocity)} kts</td>
                        <td className="py-2">{Math.round(flight.heading)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {flights.length > 5 && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4 text-sm">
                  Showing 5 of {flights.length} flights
                </p>
              )}
            </motion.div>
          )}
        </>
      )}
    </main>
  );
}