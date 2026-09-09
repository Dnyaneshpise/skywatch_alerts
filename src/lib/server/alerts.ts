import type { FlightAlert, AlertType, NotificationChannel } from "@/types/alert";

const validTypes = new Set<AlertType>(["any", "commercial", "military", "private"]);
const validNotificationChannels = new Set<NotificationChannel>(["email", "telegram"]);

export function normalizeAlertInput(input: Record<string, unknown>, userId: string) {
  const now = new Date().toISOString();
  const aircraftTypes = normalizeStringArray(input.aircraftTypes)
    .filter((item): item is AlertType => validTypes.has(item as AlertType));
  const selectedAircraftTypes = aircraftTypes.length > 0 ? aircraftTypes : [String(input.type ?? "any") as AlertType];
  const type = selectedAircraftTypes.includes("any") ? "any" : selectedAircraftTypes[0];
  const requestedNotificationChannels = normalizeStringArray(input.notificationChannels)
    .filter((item): item is NotificationChannel => validNotificationChannels.has(item as NotificationChannel));
  const distance = Number(input.distance);
  const notifyBefore = Number(input.notifyBefore);
  const lat = Number(input.lat);
  const lon = Number(input.lon);
  const expiresAt = String(input.expiresAt ?? "");
  const email = String(input.email ?? "").trim();
  const telegramChatId = String(input.telegramChatId ?? "").trim();
  const name = String(input.name ?? "").trim();
  const notificationChannels = requestedNotificationChannels.length > 0
    ? requestedNotificationChannels
    : [
        ...(email ? ["email" as NotificationChannel] : []),
        ...(telegramChatId ? ["telegram" as NotificationChannel] : []),
      ];

  if (!selectedAircraftTypes.every((item) => validTypes.has(item))) throw new Error("Invalid aircraft type");
  if (!name) throw new Error("Alert name is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email must be valid");
  if (notificationChannels.length === 0) throw new Error("Select at least one notification channel");
  if (notificationChannels.includes("email") && !email) throw new Error("Email is required for email notifications");
  if (notificationChannels.includes("telegram") && !telegramChatId) throw new Error("Connect Telegram before enabling Telegram notifications");
  if (!Number.isFinite(distance) || distance <= 0 || distance > 500) throw new Error("Distance must be between 1 and 500 km");
  if (!Number.isFinite(notifyBefore) || notifyBefore <= 0 || notifyBefore > 180) throw new Error("Notify time must be between 1 and 180 minutes");
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("Longitude must be between -180 and 180");
  if (!expiresAt || Number.isNaN(Date.parse(expiresAt))) throw new Error("Valid expiration date is required");

  const alert = {
    userId,
    name,
    type,
    aircraftTypes: selectedAircraftTypes.includes("any") ? ["any"] : selectedAircraftTypes,
    notificationChannels,
    distance,
    notifyBefore,
    expiresAt: new Date(expiresAt).toISOString(),
    email,
    ...(telegramChatId ? { telegramChatId } : {}),
    lat,
    lon,
    active: Boolean(input.active ?? true),
    updatedAt: now,
  };

  if (typeof input.createdAt === "string" && !Number.isNaN(Date.parse(input.createdAt))) {
    return {
      ...alert,
      createdAt: new Date(input.createdAt).toISOString(),
      ...(typeof input.lastTriggeredAt === "string" && !Number.isNaN(Date.parse(input.lastTriggeredAt))
        ? { lastTriggeredAt: new Date(input.lastTriggeredAt).toISOString() }
        : {}),
    };
  }

  return {
    ...alert,
    ...(typeof input.lastTriggeredAt === "string" && !Number.isNaN(Date.parse(input.lastTriggeredAt))
      ? { lastTriggeredAt: new Date(input.lastTriggeredAt).toISOString() }
      : {}),
  };
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

export function isAlertExpired(alert: FlightAlert) {
  return Date.parse(alert.expiresAt) <= Date.now();
}

export function shouldSkipRecentlyTriggered(alert: FlightAlert) {
  if (!alert.lastTriggeredAt) return false;
  return Date.now() - Date.parse(alert.lastTriggeredAt) < alert.notifyBefore * 60_000;
}
