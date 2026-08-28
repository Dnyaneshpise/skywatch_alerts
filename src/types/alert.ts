export type AlertType = "commercial" | "military" | "private";

export interface FlightAlert {
  id: string;
  userId: string;
  name: string;
  type: AlertType;
  distance: number;
  notifyBefore: number;
  expiresAt: string;
  email: string;
  telegramChatId?: string;
  lat: number;
  lon: number;
  active: boolean;
  lastTriggeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
