"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AlertsPage() {
  const MAX_DISTANCE = 500;
  const MAX_NOTIFY_BEFORE = 180;

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

  const [validationErrors, setValidationErrors] = useState({
    distance: "",
    notifyBefore: "",
    email: "",
  });

  useEffect(() => {
    // Format expiration dates only on client
    setFormattedDates(alerts.map((a) => a.expiresAt.toLocaleDateString()));
  }, [alerts]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Ensures only numbers are entered and stay within 1-500 range
  const validateAndSetDistance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
  
    // Check for non-digit characters or empty string
    if (!/^\d*$/.test(rawValue) || rawValue === '') {
      setValidationErrors(prev => ({
        ...prev,
        distance: 'Distance must be a positive number'
      }));
      setNewAlert(prev => ({ ...prev, distance: 0 }));
      return;
    }
  
    // Remove leading zeros 
    const value = rawValue.replace(/^0+/, '');
  
    // If value is empty after removing leading zeros, it's zero or all zeros
    if (value === '') {
      setValidationErrors(prev => ({
        ...prev,
        distance: 'Distance must be a positive number'
      }));
      setNewAlert(prev => ({ ...prev, distance: 0 }));
      return;
    }
  
    const numValue = Number(value);

  // Check for max value
  if (numValue > MAX_DISTANCE) {
    setValidationErrors(prev => ({
      ...prev,
      distance: `Distance cannot exceed ${MAX_DISTANCE} km`
    }));
    setNewAlert(prev => ({ ...prev, distance: numValue }));
    return;
  }

  // Valid positive integer
  setValidationErrors(prev => ({ ...prev, distance: '' }));
  setNewAlert(prev => ({ ...prev, distance: numValue }));
  };

  // Ensures only numbers are entered and stay within 1-180 range
  const validateAndSetNotifyBefore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
  
    // Check for non-digit characters or empty string
    if (!/^\d*$/.test(rawValue) || rawValue === '') {
      setValidationErrors(prev => ({
        ...prev,
        notifyBefore: 'Notify before time must be a positive number'
      }));
      setNewAlert(prev => ({ ...prev, notifyBefore: 0 }));
      return;
    }
  
    // Remove leading zeros
    const value = rawValue.replace(/^0+/, '');
  
    // If value is empty after removing leading zeros, it's zero or all zeros
    if (value === '') {
      setValidationErrors(prev => ({
        ...prev,
        notifyBefore: 'Notify before time must be a positive number'
      }));
      setNewAlert(prev => ({ ...prev, notifyBefore: 0 }));
      return;
    }
    const numValue = Number(value);

  if (numValue > MAX_NOTIFY_BEFORE) {
    setValidationErrors(prev => ({
      ...prev,
      notifyBefore: `Notify before time cannot exceed ${MAX_NOTIFY_BEFORE} minutes`
    }));
    setNewAlert(prev => ({ ...prev, notifyBefore: numValue }));
    return;
  }

  setValidationErrors(prev => ({ ...prev, notifyBefore: '' }));
  setNewAlert(prev => ({ ...prev, notifyBefore: numValue }));
  };

  // Ensures emails follow standard user@example.com pattern
  const validateAndSetEmail = (value: string | number) => {
    const emailValue = String(value);
    if (emailValue && !emailRegex.test(emailValue)) {
      setValidationErrors(prev => ({ 
        ...prev, 
        email: 'Please enter a valid email address' 
      }));
    } else {
      setValidationErrors(prev => ({ 
        ...prev, 
        email: '' 
      }));
    }
    setNewAlert({ ...newAlert, email: emailValue });
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');

  const inputFields: {
    label: string;
    value: string | number;
    onChange: (v: string | number) => void;
    type: string;
    placeholder: string;
    error?: string;
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
      value: newAlert.distance === 0 ? '' : newAlert.distance,
      onChange: () => {},
      type: "text",
      placeholder: "e.g., 5",
      error: validationErrors.distance,
    },
    {
      label: "Notify Before (minutes)",
      value: newAlert.notifyBefore,
      onChange: () => {},
      type: "text",
      placeholder: "e.g., 15",
      error: validationErrors.notifyBefore,
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
      onChange: validateAndSetEmail,
      type: "email",
      placeholder: "e.g., user@example.com",
      error: validationErrors.email,
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 ">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Flight Alerts</h1>

      <div className="rounded-lg bg-[var(--card)] p-6 mb-8 border border-[var(--border)] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-secondary)]">My Alerts</h2>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            + Create Alert
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-lg shadow-sm">
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
                    className={`w-full p-3 rounded-md border ${field.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2`}
                    value={field.value}
                    onChange={
                      field.label === "Distance (km)"
                        ? validateAndSetDistance
                        : field.label === "Notify Before (minutes)"
                          ? validateAndSetNotifyBefore
                          : (e) =>
                              field.type === "number"
                                ? field.onChange(Number(e.target.value))
                                : field.onChange(e.target.value)
                    }
                    placeholder={field.placeholder}
                    inputMode={["Distance (km)", "Notify Before (minutes)"].includes(field.label) ? "numeric" : undefined}
                    pattern={["Distance (km)", "Notify Before (minutes)"].includes(field.label) ? "[0-9]*" : undefined}
                  />
                  {field.error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {field.error}
                    </p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Aircraft Type
                </label>
                <select
                  className="w-full p-3 rounded-md border border-gray-300 bg-white dark:bg-gray-900 text-[var(--text-secondary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                onClick={() => {setShowForm(false);
                  setValidationErrors({ distance: '', notifyBefore: '', email: '' });
                }}
              >
                Cancel
              </button>
              <button
                disabled={!newAlert.email || hasValidationErrors}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !newAlert.email || hasValidationErrors
                    ? '!bg-gray-400 !text-gray-600 !cursor-not-allowed' // Used !important to ensure accurate styling
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
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
                  setValidationErrors({ distance: '', notifyBefore: '', email: '' });
                }}
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
              className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card-secondary)]  shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-[var(--text-secondary)]">
                    {alert.name}
                  </h3>
                  <div className="text-sm text-[var(--text-tertiary)] mt-2 space-y-1">
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
                    className="font-medium text-red-500 hover:underline"
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
            className="inline-flex items-center font-medium text-blue-500 hover:underline"
          >
            ← Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}
