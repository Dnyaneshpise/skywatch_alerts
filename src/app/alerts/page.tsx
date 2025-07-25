"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: "Commercial Flights",
      type: "commercial",
      distance: 5,
      notifyBefore: 15,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      email: "user@example.com",
      active: true,
    },
  ]);

  const [newAlert, setNewAlert] = useState({
    name: "",
    type: "commercial",
    distance: 5,
    notifyBefore: 15,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    email: "",
    active: true,
  });

  const [showForm, setShowForm] = useState(false);
  const [formattedDates, setFormattedDates] = useState<string[]>([]);

  useEffect(() => {
    // Format expiration dates only on client
    setFormattedDates(alerts.map((a) => a.expiresAt.toLocaleDateString()));
  }, [alerts]);

  const inputFields: {
    label: string;
    value: string | number;
    onChange: (v: string | number) => void;
    type: string;
    placeholder: string;
  }[] = [
    {
      label: "Alert Name",
      value: newAlert.name,
      onChange: (v: string | number) =>
        setNewAlert({ ...newAlert, name: String(v) }),
      type: "text",
      placeholder: "e.g., Nearby Commercial Flights",
    },
    {
      label: "Distance (km)",
      value: newAlert.distance,
      onChange: (v: string | number) =>
        setNewAlert({ ...newAlert, distance: Number(v) }),
      type: "number",
      placeholder: "e.g., 5",
    },
    {
      label: "Notify Before (minutes)",
      value: newAlert.notifyBefore,
      onChange: (v: string | number) =>
        setNewAlert({ ...newAlert, notifyBefore: Number(v) }),
      type: "number",
      placeholder: "e.g., 15",
    },
    {
      label: "Expiration Date",
      value: newAlert.expiresAt.toISOString().split("T")[0],
      onChange: (v: string | number) =>
        setNewAlert({ ...newAlert, expiresAt: new Date(String(v)) }),
      type: "date",
      placeholder: "",
    },
    {
      label: "Notification Email",
      value: newAlert.email,
      onChange: (v: string | number) =>
        setNewAlert({ ...newAlert, email: String(v) }),
      type: "email",
      placeholder: "e.g., user@example.com",
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8">Flight Alerts</h1>

      <div className="rounded-lg p-6 mb-8 border border-gray-200 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Alerts</h2>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            + Create Alert
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium mb-4">
              New Alert Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {inputFields.map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className="w-full p-3 rounded-md border border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={field.value}
                    onChange={(e) =>
                      field.type === "number"
                        ? field.onChange(Number(e.target.value))
                        : field.onChange(e.target.value)
                    }
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Aircraft Type
                </label>
                <select
                  className="w-full p-3 rounded-md border border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  style={{ 
                    boxShadow: '0 1px 2px 1px rgb(0 0 0 / 0.06)'
                  }}
                  value={newAlert.type}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, type: e.target.value })
                  }
                >
                  <option value="commercial">Commercial</option>
                  <option value="military">Military</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                onClick={() => {
                  setAlerts([
                    ...alerts,
                    {
                      ...newAlert,
                      id: alerts.length + 1,
                      name:
                        newAlert.name ||
                        `${newAlert.type} within ${newAlert.distance}km`,
                    },
                  ]);
                  setShowForm(false);
                }}
                disabled={!newAlert.email}
              >
                Save Alert
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className="p-4 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {alert.name}
                  </h3>
                  <div className="text-sm text-500 dark:text-gray-400 mt-2 space-y-1">
                    <p>
                      Type:{" "}
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </p>
                    <p>Alert when within {alert.distance} km</p>
                    <p>Notify {alert.notifyBefore} minutes before arrival</p>
                    <p>
                      Expires:{" "}
                      {formattedDates[index] ||
                        alert.expiresAt.toISOString().split("T")[0]}
                    </p>
                    <p>Email: {alert.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={alert.active}
                      onChange={() =>
                        setAlerts(
                          alerts.map((a) =>
                            a.id === alert.id ? { ...a, active: !a.active } : a
                          )
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <button
                    className="font-medium text-red-600 hover:underline"
                    onClick={() =>
                      setAlerts(alerts.filter((a) => a.id !== alert.id))
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-blue-600 hover:underline"
          >
            ← Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}
