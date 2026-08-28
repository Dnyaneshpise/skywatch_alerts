import type { FlightAlert, AlertType } from "@/types/alert";

const validTypes = new Set<AlertType>(["commercial", "military", "private"]);

export function normalizeAlertInput(input: Record<string, unknown>, userId: string) {
  const now = new Date().toISOString();
  const type = String(input.type ?? "commercial") as AlertType;
  const distance = Number(input.distance);
  const notifyBefore = Number(input.notifyBefore);
  const lat = Number(input.lat);
  const lon = Number(input.lon);
  const expiresAt = String(input.expiresAt ?? "");
  const email = String(input.email ?? "").trim();
  const telegramChatId = String(input.telegramChatId ?? "").trim();
  const name = String(input.name ?? "").trim();

  if (!validTypes.has(type)) throw new Error("Invalid alert type");
  if (!name) throw new Error("Alert name is required");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email must be valid");
  if (!email && !telegramChatId) throw new Error("Add an email or Telegram chat ID for notifications");
  if (!Number.isFinite(distance) || distance <= 0 || distance > 500) throw new Error("Distance must be between 1 and 500 km");
  if (!Number.isFinite(notifyBefore) || notifyBefore <= 0 || notifyBefore > 180) throw new Error("Notify time must be between 1 and 180 minutes");
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("Longitude must be between -180 and 180");
  if (!expiresAt || Number.isNaN(Date.parse(expiresAt))) throw new Error("Valid expiration date is required");

  const alert = {
    userId,
    name,
    type,
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

export function isAlertExpired(alert: FlightAlert) {
  return Date.parse(alert.expiresAt) <= Date.now();
}

export function shouldSkipRecentlyTriggered(alert: FlightAlert) {
  if (!alert.lastTriggeredAt) return false;
  return Date.now() - Date.parse(alert.lastTriggeredAt) < alert.notifyBefore * 60_000;
}
