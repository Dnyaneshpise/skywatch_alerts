export type AlertType = "any" | "commercial" | "military" | "private";
export type NotificationChannel = "email" | "telegram";

export interface FlightAlert {
  id: string;
  userId: string;
  name: string;
  type: AlertType;
  aircraftTypes?: AlertType[];
  notificationChannels?: NotificationChannel[];
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
