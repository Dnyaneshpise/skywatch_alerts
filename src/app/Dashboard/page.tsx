'use client';

import React, { useEffect, useState } from 'react';

type Summary = {
  totalFlights: number;
  peakHour: [string, number] | null;
  frequentAirline: [string, number] | null;
  frequentAircraft: [string, number] | null;
  avgAltitude: number;
  avgSpeed: number;
  flagged: {
    lowAltitude: number;
    stationary: number;
  };
};

// Dummy data for local testing
const dummySummary: Summary = {
  totalFlights: 4,
  peakHour: ['12', 2],
  frequentAirline: ['Air India', 2],
  frequentAircraft: ['A320', 3],
  avgAltitude: (12000 + 9500 + 8000 + 15000) / 4,
  avgSpeed: (450 + 420 + 0 + 470) / 4,
  flagged: {
    lowAltitude: 2, // 9500, 8000
    stationary: 1,  // 0 speed
  },
};

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/flight-summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        // If API fails, use dummy data
        setSummary(dummySummary);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign:'center',marginTop:'2rem'}}>Loading flight summary...</div>;
  if (!summary) return <div style={{textAlign:'center',marginTop:'2rem'}}>No summary data available.</div>;

  return (
    <main style={{
      maxWidth: 800,
      margin: '2rem auto',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: '1rem'
    }}>
      <h1 style={{textAlign:'center',marginBottom:'2rem',fontWeight:700,fontSize:'2rem'}}>🛩️ Daily Flight Summary & Insights</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: '#e3f2fd',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>🛫 Total Flights Detected</h2>
          <p style={{fontSize:'2rem',fontWeight:600,color:'#1976d2'}}>{summary.totalFlights ?? 0}</p>
        </div>
        <div style={{
          background: '#fff3e0',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>📈 Peak Flight Hour</h2>
          <p style={{fontSize:'1.2rem',fontWeight:500,color:'#f57c00'}}>
            {summary.peakHour
              ? `${summary.peakHour[0]}:00 — ${summary.peakHour[0]}:59 (${summary.peakHour[1]} flights)`
              : 'No data'}
          </p>
        </div>
        <div style={{
          background: '#e8f5e9',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>✈️ Most Frequent Airline</h2>
          <p style={{fontSize:'1.2rem',fontWeight:500,color:'#388e3c'}}>
            {summary.frequentAirline
              ? `${summary.frequentAirline[0]} (${summary.frequentAirline[1]} times)`
              : 'No data'}
          </p>
        </div>
        <div style={{
          background: '#fce4ec',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>✈️ Most Frequent Aircraft Type</h2>
          <p style={{fontSize:'1.2rem',fontWeight:500,color:'#d81b60'}}>
            {summary.frequentAircraft
              ? `${summary.frequentAircraft[0]} (${summary.frequentAircraft[1]} times)`
              : 'No data'}
          </p>
        </div>
        <div style={{
          background: '#ede7f6',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>🌤 Average Altitude & Speed</h2>
          <p style={{fontSize:'1.2rem',fontWeight:500,color:'#512da8'}}>
            Altitude: {isNaN(summary.avgAltitude) ? '-' : `${summary.avgAltitude.toFixed(0)} ft`}<br />
            Speed: {isNaN(summary.avgSpeed) ? '-' : `${summary.avgSpeed.toFixed(0)} knots`}
          </p>
        </div>
        <div style={{
          background: '#fffde7',
          borderRadius: 12,
          padding: '1.2rem',
          boxShadow: '0 2px 8px #0001'
        }}>
          <h2 style={{marginBottom:8}}>🔔 Flagged Events</h2>
          <ul style={{fontSize:'1.1rem',fontWeight:500,color:'#fbc02d',marginLeft:0,paddingLeft:'1rem'}}>
            <li>Flights below 10,000 ft: <b>{summary.flagged.lowAltitude ?? 0}</b></li>
            <li>Stationary/Hovering flights: <b>{summary.flagged.stationary ?? 0}</b></li>
          </ul>
        </div>
      </div>
    </main>
  );
}