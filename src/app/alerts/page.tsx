"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaFighterJet, FaPlane, FaUser } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/UseAuth";
import type {
  FlightAlert,
  AlertType,
  NotificationChannel,
} from "@/types/alert";

const AlertLocationPicker = dynamic(
  () => import("@/components/alerts/AlertLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="sm:col-span-2 h-[360px] rounded-lg border border-slate-700 bg-slate-900/40 flex items-center justify-center text-slate-300">
        Loading map picker...
      </div>
    ),
  },
);

type AlertForm = {
  name: string;
  type: AlertType;
  aircraftTypes: AlertType[];
  notificationChannels: NotificationChannel[];
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
  type: "any",
  aircraftTypes: ["any"],
  notificationChannels: ["email"],
  distance: 5,
  notifyBefore: 15,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
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
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [telegram, setTelegram] = useState({
    connected: false,
    chatId: "",
    username: "",
    loading: false,
    pending: false,
    message: "",
  });

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
        if (!response.ok)
          throw new Error(data.error || "Failed to load alerts");
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
      setNewAlert((current) => ({
        ...current,
        email: current.email || user.email || "",
      }));
    }
  }, [user]);

  const loadTelegramStatus = useCallback(async () => {
    if (!user) return;

    setTelegram((current) => ({ ...current, loading: true }));
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/telegram/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to load Telegram status");

      setTelegram((current) => ({
        ...current,
        connected: Boolean(data.connected),
        chatId: data.chatId || "",
        username: data.username || "",
        loading: false,
        pending: data.connected ? false : current.pending,
        message: data.connected
          ? "Telegram alerts are connected."
          : current.message,
      }));
    } catch (err) {
      setTelegram((current) => ({
        ...current,
        loading: false,
        message:
          err instanceof Error ? err.message : "Failed to load Telegram status",
      }));
    }
  }, [user]);

  useEffect(() => {
    loadTelegramStatus();
  }, [loadTelegramStatus]);

  useEffect(() => {
    if (!showForm || !telegram.pending || telegram.connected) return;

    const interval = window.setInterval(() => {
      loadTelegramStatus();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [loadTelegramStatus, showForm, telegram.connected, telegram.pending]);

  const filteredAlerts = useMemo(
    () =>
      alerts
        .filter(
          (alert) =>
            selectedFilter === "All" ||
            (alert.aircraftTypes ?? [alert.type]).includes(
              selectedFilter.toLowerCase() as AlertType,
            ),
        )
        .filter((alert) =>
          alert.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    [alerts, searchTerm, selectedFilter],
  );

  const toggleNotificationChannel = (channel: NotificationChannel) => {
    setNewAlert((current) => {
      const hasChannel = current.notificationChannels.includes(channel);
      const nextChannels = hasChannel
        ? current.notificationChannels.filter((item) => item !== channel)
        : [...current.notificationChannels, channel];

      return {
        ...current,
        notificationChannels:
          nextChannels.length > 0 ? nextChannels : [channel],
      };
    });
  };

  const toggleAircraftType = (type: AlertType) => {
    setNewAlert((current) => {
      if (type === "any") {
        return { ...current, type: "any", aircraftTypes: ["any"] };
      }

      const withoutAny = current.aircraftTypes.filter((item) => item !== "any");
      const nextTypes = withoutAny.includes(type)
        ? withoutAny.filter((item) => item !== type)
        : [...withoutAny, type];
      const aircraftTypes = nextTypes.length > 0 ? nextTypes : ["any"];

      return {
        ...current,
        type: aircraftTypes.includes("any") ? "any" : aircraftTypes[0],
        aircraftTypes,
      };
    });
  };

  const connectTelegram = async () => {
    if (!user) return;

    setTelegram((current) => ({ ...current, loading: true, message: "" }));
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/telegram/link", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to create Telegram link");

      const isPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(
        window.navigator.userAgent,
      );
      if (isPhone) {
        window.location.href = data.appUrl || data.url;
      } else {
        window.open(data.webUrl || data.url, "_blank", "noopener,noreferrer");
      }
      setTelegram((current) => ({
        ...current,
        loading: false,
        pending: true,
        message:
          "Telegram opened. Press Start in the bot, then this page will update automatically.",
      }));
    } catch (err) {
      setTelegram((current) => ({
        ...current,
        loading: false,
        message:
          err instanceof Error ? err.message : "Failed to connect Telegram",
      }));
    }
  };

  const saveAlert = async () => {
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const isEditing = editingAlertId !== null;
      const response = await fetch(
        isEditing ? `/api/alerts/${editingAlertId}` : "/api/alerts",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newAlert,
            telegramChatId: telegram.connected ? telegram.chatId : "",
            email: newAlert.notificationChannels.includes("email")
              ? newAlert.email
              : "",
            name:
              newAlert.name ||
              `${newAlert.aircraftTypes.join(", ")} flights within ${newAlert.distance}km`,
            expiresAt: new Date(newAlert.expiresAt).toISOString(),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save alert");
      setAlerts((current) =>
        isEditing
          ? current.map((alert) =>
              alert.id === editingAlertId ? data.alert : alert,
            )
          : [data.alert, ...current],
      );
      setNewAlert(defaultForm());
      setShowForm(false);
      setEditingAlertId(null);
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
    setAlerts((current) =>
      current.map((item) => (item.id === alert.id ? data.alert : item)),
    );
  };

  const editAlert = (alert: FlightAlert) => {
    setNewAlert({
      name: alert.name,
      type: alert.type,
      aircraftTypes: alert.aircraftTypes ?? [alert.type],
      notificationChannels:
        alert.notificationChannels ??
        (alert.telegramChatId ? ["telegram"] : ["email"]),
      distance: alert.distance,
      notifyBefore: alert.notifyBefore,
      expiresAt: new Date(alert.expiresAt).toISOString().split("T")[0],
      email: alert.email,
      lat: alert.lat,
      lon: alert.lon,
      active: alert.active,
    });
    setEditingAlertId(alert.id);
    setShowForm(true);
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
      case "any":
        return <FaPlane className="inline text-cyan-500 mr-1" />;
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
          {["All", "Any", "Commercial", "Military", "Private"].map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
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
            onClick={() => {
              setEditingAlertId(null);
              setNewAlert(defaultForm());
              setShowForm(true);
            }}
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
            <h3 className="text-lg font-medium mb-4">
              {editingAlertId ? "Edit Alert" : "New Alert Configuration"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <FormInput
                label="Alert Name"
                value={newAlert.name}
                onChange={(value) => setNewAlert({ ...newAlert, name: value })}
                placeholder="Nearby flights"
              />
              <AircraftTypeSelector
                selectedTypes={newAlert.aircraftTypes}
                onToggle={toggleAircraftType}
              />
              <NotificationChannelSelector
                selectedChannels={newAlert.notificationChannels}
                onToggle={toggleNotificationChannel}
              />
              {newAlert.notificationChannels.includes("email") && (
                <FormInput
                  label="Notification Email"
                  type="email"
                  value={newAlert.email}
                  onChange={(value) =>
                    setNewAlert({ ...newAlert, email: value })
                  }
                  placeholder="you@example.com"
                />
              )}
              {newAlert.notificationChannels.includes("telegram") && (
                <TelegramConnectCard
                  connected={telegram.connected}
                  loading={telegram.loading}
                  pending={telegram.pending}
                  username={telegram.username}
                  message={telegram.message}
                  onConnect={connectTelegram}
                  onRefresh={loadTelegramStatus}
                />
              )}
              <AlertLocationPicker
                lat={newAlert.lat}
                lon={newAlert.lon}
                radiusKm={newAlert.distance}
                onLocationChange={(location) =>
                  setNewAlert({ ...newAlert, ...location })
                }
                onRadiusChange={(distance) =>
                  setNewAlert({ ...newAlert, distance })
                }
              />
              <NumberInput
                label="Notify Cooldown (minutes)"
                value={newAlert.notifyBefore}
                min={1}
                max={180}
                onChange={(value) =>
                  setNewAlert({ ...newAlert, notifyBefore: value })
                }
              />
              <FormInput
                label="Expiration Date"
                type="date"
                value={newAlert.expiresAt}
                onChange={(value) =>
                  setNewAlert({ ...newAlert, expiresAt: value })
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setShowForm(false);
                  setEditingAlertId(null);
                }}
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={saveAlert}
              >
                {saving
                  ? "Saving..."
                  : editingAlertId
                    ? "Update Alert"
                    : "Save Alert"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {filteredAlerts.length === 0 && (
            <p className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-slate-300">
              No alerts yet. Create one to start monitoring real aircraft near a
              location.
            </p>
          )}

          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg border shadow-md transition-colors duration-300 ${
                alert.active
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    {renderIcon(alert.type)}
                    {alert.name}
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-400 mt-2 space-y-1">
                    <p>
                      Aircraft:{" "}
                      {(alert.aircraftTypes ?? [alert.type])
                        .map(formatLabel)
                        .join(", ")}
                    </p>
                    <p>
                      Notifications:{" "}
                      {(
                        alert.notificationChannels ??
                        (alert.telegramChatId ? ["telegram"] : ["email"])
                      )
                        .map(formatLabel)
                        .join(", ")}
                    </p>
                    <p>
                      Alert when within {alert.distance} km of{" "}
                      {alert.lat.toFixed(4)}, {alert.lon.toFixed(4)}
                    </p>
                    <p>
                      Cooldown: {alert.notifyBefore} minutes between
                      notifications
                    </p>
                    <p>
                      Expires: {new Date(alert.expiresAt).toLocaleDateString()}
                    </p>
                    {alert.email && <p>Email: {alert.email}</p>}
                    {alert.telegramChatId && (
                      <p>Telegram: {alert.telegramChatId}</p>
                    )}
                    {alert.lastTriggeredAt && (
                      <p>
                        Last sent:{" "}
                        {new Date(alert.lastTriggeredAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={alert.active}
                      onChange={() => {
                        setError("");
                        updateAlert({ ...alert, active: !alert.active }).catch(
                          (err) =>
                            setError(
                              err instanceof Error
                                ? err.message
                                : "Failed to update alert",
                            ),
                        );
                      }}
                    />
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative peer-checked:bg-blue-600 transition-colors duration-300">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                    </div>
                  </label>
                  <button
                    type="button"
                    className="font-medium text-blue-600 hover:underline"
                    onClick={() => editAlert(alert)}
                  >
                    Edit
                  </button>
                  <button
                    className="font-medium text-red-600 hover:underline"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-blue-600 hover:underline"
          >
            Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function AircraftTypeSelector({
  selectedTypes,
  onToggle,
}: {
  selectedTypes: AlertType[];
  onToggle: (type: AlertType) => void;
}) {
  const options: Array<{ value: AlertType; label: string }> = [
    { value: "any", label: "Any" },
    { value: "commercial", label: "Commercial" },
    { value: "military", label: "Military" },
    { value: "private", label: "Private" },
  ];

  return (
    <fieldset>
      <legend className="block text-sm font-medium mb-2">Aircraft Types</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = selectedTypes.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                selected
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function NotificationChannelSelector({
  selectedChannels,
  onToggle,
}: {
  selectedChannels: NotificationChannel[];
  onToggle: (channel: NotificationChannel) => void;
}) {
  const options: Array<{ value: NotificationChannel; label: string }> = [
    { value: "email", label: "Email" },
    { value: "telegram", label: "Telegram" },
  ];

  return (
    <fieldset>
      <legend className="block text-sm font-medium mb-2">Notifications</legend>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = selectedChannels.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                selected
                  ? "border-cyan-500 bg-cyan-500 text-slate-950"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TelegramConnectCard({
  connected,
  loading,
  pending,
  username,
  message,
  onConnect,
  onRefresh,
}: {
  connected: boolean;
  loading: boolean;
  pending: boolean;
  username: string;
  message: string;
  onConnect: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-md border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Telegram Alerts
          </label>
          <p className="text-sm text-slate-400">
            {connected
              ? `Connected${username ? ` to @${username}` : ""}.`
              : "Open @skywatchalertsbot in Telegram and press Start. SkyWatch will save the chat automatically."}
          </p>
          {message && <p className="mt-2 text-xs text-cyan-300">{message}</p>}
        </div>
        <div
          className={`rounded-full px-2 py-1 text-xs font-semibold ${connected ? "bg-green-500/20 text-green-300" : "bg-slate-700 text-slate-300"}`}
        >
          {connected ? "Connected" : pending ? "Waiting" : "Off"}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConnect}
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading
            ? "Opening..."
            : connected
              ? "Reconnect Telegram"
              : "Open Telegram"}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-60"
        >
          Check status
        </button>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  help,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
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
      {help && <p className="mt-1 text-xs text-slate-400">{help}</p>}
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
