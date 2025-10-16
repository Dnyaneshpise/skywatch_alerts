"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaPlane, FaFighterJet, FaUser } from "react-icons/fa";

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
    {
      id: 2,
      name: "Military Alert",
      type: "military",
      distance: 10,
      notifyBefore: 30,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      email: "user@example.com",
      active: false,
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

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setFormattedDates(alerts.map((a) => a.expiresAt.toLocaleDateString()));
  }, [alerts]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateAndSetDistance = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!/^\d*$/.test(rawValue) || rawValue === '') {
      setValidationErrors(prev => ({ ...prev, distance: 'Distance must be a positive number' }));
      setNewAlert(prev => ({ ...prev, distance: 0 }));
      return;
    }
    const value = rawValue.replace(/^0+/, '');
    if (value === '') {
      setValidationErrors(prev => ({ ...prev, distance: 'Distance must be a positive number' }));
      setNewAlert(prev => ({ ...prev, distance: 0 }));
      return;
    }
    const numValue = Number(value);
    if (numValue > MAX_DISTANCE) {
      setValidationErrors(prev => ({ ...prev, distance: `Distance cannot exceed ${MAX_DISTANCE} km` }));
      setNewAlert(prev => ({ ...prev, distance: numValue }));
      return;
    }
    setValidationErrors(prev => ({ ...prev, distance: '' }));
    setNewAlert(prev => ({ ...prev, distance: numValue }));
  };

  const validateAndSetNotifyBefore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!/^\d*$/.test(rawValue) || rawValue === '') {
      setValidationErrors(prev => ({ ...prev, notifyBefore: 'Notify before time must be a positive number' }));
      setNewAlert(prev => ({ ...prev, notifyBefore: 0 }));
      return;
    }
    const value = rawValue.replace(/^0+/, '');
    if (value === '') {
      setValidationErrors(prev => ({ ...prev, notifyBefore: 'Notify before time must be a positive number' }));
      setNewAlert(prev => ({ ...prev, notifyBefore: 0 }));
      return;
    }
    const numValue = Number(value);
    if (numValue > MAX_NOTIFY_BEFORE) {
      setValidationErrors(prev => ({ ...prev, notifyBefore: `Notify before time cannot exceed ${MAX_NOTIFY_BEFORE} minutes` }));
      setNewAlert(prev => ({ ...prev, notifyBefore: numValue }));
      return;
    }
    setValidationErrors(prev => ({ ...prev, notifyBefore: '' }));
    setNewAlert(prev => ({ ...prev, notifyBefore: numValue }));
  };

  const validateAndSetEmail = (value: string | number) => {
    const emailValue = String(value);
    if (emailValue && !emailRegex.test(emailValue)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
    setNewAlert({ ...newAlert, email: emailValue });
  };

  const hasValidationErrors = Object.values(validationErrors).some(error => error !== '');

  const inputFields = [
    { label: "Alert Name", value: newAlert.name, onChange: (v: string) => setNewAlert({ ...newAlert, name: v }), type: "text", placeholder: "e.g., Nearby Commercial Flights" },
    { label: "Distance (km)", value: newAlert.distance === 0 ? '' : newAlert.distance, onChange: () => {}, type: "text", placeholder: "e.g., 5", error: validationErrors.distance },
    { label: "Notify Before (minutes)", value: newAlert.notifyBefore, onChange: () => {}, type: "text", placeholder: "e.g., 15", error: validationErrors.notifyBefore },
    { label: "Expiration Date", value: newAlert.expiresAt.toISOString().split("T")[0], onChange: (v: string) => setNewAlert({ ...newAlert, expiresAt: new Date(v) }), type: "date", placeholder: "" },
    { label: "Notification Email", value: newAlert.email, onChange: validateAndSetEmail, type: "email", placeholder: "e.g., user@example.com", error: validationErrors.email },
  ];

  // Filter and search alerts
  const filteredAlerts = alerts
    .filter(a => selectedFilter === "All" || a.type === selectedFilter.toLowerCase())
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Icon for alert type
  const renderIcon = (type: string) => {
    switch (type) {
      case "commercial": return <FaPlane className="inline text-blue-500 mr-1" />;
      case "military": return <FaFighterJet className="inline text-red-500 mr-1" />;
      case "private": return <FaUser className="inline text-green-500 mr-1" />;
      default: return null;
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Flight Alerts</h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search alerts..."
          className="w-full sm:w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
          {["All", "Commercial", "Military", "Private"].map(type => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
              onClick={() => setSelectedFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg p-6 border border-gray-200 bg-white dark:bg-gray-900 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Alerts</h2>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            + Create Alert
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800"
          >
            <h3 className="text-lg font-medium mb-4">New Alert Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {inputFields.map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={
                      field.label === "Distance (km)"
                        ? validateAndSetDistance
                        : field.label === "Notify Before (minutes)"
                          ? validateAndSetNotifyBefore
                          : (e) => field.onChange(e.target.value)
                    }
                    placeholder={field.placeholder}
                    className={`w-full p-3 rounded-md border ${field.error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2`}
                  />
                  {field.error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{field.error}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-2">Aircraft Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                onClick={() => {
                  setShowForm(false);
                  setValidationErrors({ distance: '', notifyBefore: '', email: '' });
                }}
              >
                Cancel
              </button>
              <button
                disabled={!newAlert.email || hasValidationErrors}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !newAlert.email || hasValidationErrors
                    ? '!bg-gray-400 !text-gray-600 !cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={() => {
                  setAlerts([
                    ...alerts,
                    { ...newAlert, id: alerts.length + 1, name: newAlert.name || `${newAlert.type} within ${newAlert.distance}km` },
                  ]);
                  setShowForm(false);
                  setValidationErrors({ distance: '', notifyBefore: '', email: '' });
                }}
              >
                Save Alert
              </button>
            </div>
          </motion.div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border shadow-md transition-colors duration-300 ${
                alert.active ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {renderIcon(alert.type)}
                    {alert.name}
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-2 space-y-1">
                    <p>Type: {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                    <p>Alert when within {alert.distance} km</p>
                    <p>Notify {alert.notifyBefore} minutes before arrival</p>
                    <p>Expires: {formattedDates[index] || alert.expiresAt.toISOString().split("T")[0]}</p>
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
                        setAlerts(alerts.map((a) => a.id === alert.id ? { ...a, active: !a.active } : a))
                      }
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative peer-checked:bg-blue-600 transition-colors duration-300">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                  <button
                    className="font-medium text-red-600 hover:underline"
                    onClick={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Link */}
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
