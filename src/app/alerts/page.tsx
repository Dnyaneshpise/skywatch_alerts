"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaFighterJet, FaPlane, FaUser } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/UseAuth";
import type { FlightAlert, AlertType } from "@/types/alert";

type AlertForm = {
  name: string;
  type: AlertType;
  distance: number;
  notifyBefore: number;
  expiresAt: string;
  email: string;
  lat: number;
  lon: number;
  active: boolean;
};

const defaultForm = (): AlertForm => ({
  name: "",
  type: "commercial",
  distance: 5,
  notifyBefore: 15,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  email: "",
  lat: 28.6139,
  lon: 77.209,
  active: true,
});

export default function AlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState<FlightAlert[]>([]);
  const [newAlert, setNewAlert] = useState<AlertForm>(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?next=/alerts");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;

    const loadAlerts = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load alerts");
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      setNewAlert((current) => ({ ...current, email: current.email || user.email || "" }));
    }
  }, [user]);

  const filteredAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => selectedFilter === "All" || alert.type === selectedFilter.toLowerCase())
        .filter((alert) => alert.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [alerts, searchTerm, selectedFilter],
  );

  const saveAlert = async () => {
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newAlert,
          name: newAlert.name || `${newAlert.type} flights within ${newAlert.distance}km`,
          expiresAt: new Date(newAlert.expiresAt).toISOString(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save alert");
      setAlerts((current) => [data.alert, ...current]);
      setNewAlert(defaultForm());
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save alert");
    } finally {
      setSaving(false);
    }
  };

  const updateAlert = async (alert: FlightAlert) => {
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(alert),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update alert");
    setAlerts((current) => current.map((item) => (item.id === alert.id ? data.alert : item)));
  };

  const deleteAlert = async (id: string) => {
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch(`/api/alerts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to delete alert");
      return;
    }
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "commercial":
        return <FaPlane className="inline text-blue-500 mr-1" />;
      case "military":
        return <FaFighterJet className="inline text-red-500 mr-1" />;
      case "private":
        return <FaUser className="inline text-green-500 mr-1" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 text-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Flight Alerts</h1>

      {error && (
        <div className="mb-6 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search alerts..."
          className="w-full sm:w-1/2 p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {["All", "Commercial", "Military", "Private"].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === type ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
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

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800"
          >
            <h3 className="text-lg font-medium mb-4">New Alert Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <FormInput label="Alert Name" value={newAlert.name} onChange={(value) => setNewAlert({ ...newAlert, name: value })} placeholder="Nearby flights" />
              <FormInput label="Notification Email" type="email" value={newAlert.email} onChange={(value) => setNewAlert({ ...newAlert, email: value })} placeholder="you@example.com" />
              <NumberInput label="Latitude" value={newAlert.lat} onChange={(value) => setNewAlert({ ...newAlert, lat: value })} />
              <NumberInput label="Longitude" value={newAlert.lon} onChange={(value) => setNewAlert({ ...newAlert, lon: value })} />
              <NumberInput label="Distance (km)" value={newAlert.distance} min={1} max={500} onChange={(value) => setNewAlert({ ...newAlert, distance: value })} />
              <NumberInput label="Notify Cooldown (minutes)" value={newAlert.notifyBefore} min={1} max={180} onChange={(value) => setNewAlert({ ...newAlert, notifyBefore: value })} />
              <FormInput label="Expiration Date" type="date" value={newAlert.expiresAt} onChange={(value) => setNewAlert({ ...newAlert, expiresAt: value })} />
              <div>
                <label className="block text-sm font-medium mb-2">Aircraft Type</label>
                <select
                  value={newAlert.type}
                  onChange={(event) => setNewAlert({ ...newAlert, type: event.target.value as AlertType })}
                  className="w-full p-3 rounded-md border border-gray-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="commercial">Commercial</option>
                  <option value="military">Military</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button disabled={saving} className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" onClick={saveAlert}>
                {saving ? "Saving..." : "Save Alert"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {filteredAlerts.length === 0 && (
            <p className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-slate-300">
              No alerts yet. Create one to start monitoring real aircraft near a location.
            </p>
          )}

          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border shadow-md transition-colors duration-300 ${
                alert.active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {renderIcon(alert.type)}
                    {alert.name}
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-2 space-y-1">
                    <p>Type: {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                    <p>Alert when within {alert.distance} km of {alert.lat.toFixed(4)}, {alert.lon.toFixed(4)}</p>
                    <p>Cooldown: {alert.notifyBefore} minutes between notifications</p>
                    <p>Expires: {new Date(alert.expiresAt).toLocaleDateString()}</p>
                    <p>Email: {alert.email}</p>
                    {alert.lastTriggeredAt && <p>Last sent: {new Date(alert.lastTriggeredAt).toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={alert.active}
                      onChange={() => updateAlert({ ...alert, active: !alert.active }).catch((err) => setError(err.message))}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative peer-checked:bg-blue-600 transition-colors duration-300">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                    </div>
                  </label>
                  <button className="font-medium text-red-600 hover:underline" onClick={() => deleteAlert(alert.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="inline-flex items-center font-medium text-blue-600 hover:underline">
            Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step="any"
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full p-3 rounded-md border border-gray-300 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2"
      />
    </div>
  );
}
