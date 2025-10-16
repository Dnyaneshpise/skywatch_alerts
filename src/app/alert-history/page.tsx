
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDistanceToNowStrict, isBefore } from "date-fns"

interface AlertItem {
  id: string | number
  name: string
  type: string
  location?: string
  eventType?: string
  distance: number
  notifyBefore: number
  email: string
  expiresAt: Date
  active: boolean
}



const groupByTimeRange = (alerts: AlertItem[]) => {
  const now = new Date()
  const groups: Record<string, AlertItem[]> = {
    "Expiring in <3 Days": [],
    "Expiring in <7 Days": [],
    "Expiring Later": [],
    "Expired": [],
  }

  for (const alert of alerts) {
    const expiry = new Date(alert.expiresAt)
    const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)

    if (isBefore(expiry, now)) groups["Expired"].push(alert)
    else if (daysDiff <= 3) groups["Expiring in <3 Days"].push(alert)
    else if (daysDiff <= 7) groups["Expiring in <7 Days"].push(alert)
    else groups["Expiring Later"].push(alert)
  }

  return groups
}

export default function Page() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Expiring in <7 Days");

useEffect(() => {
  const stored = localStorage.getItem("flightAlertHistory");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const revived = parsed.map((a: any) => ({
        ...a,
        expiresAt: new Date(a.expiresAt),
      }));
      setAlerts(revived);
    } catch (err) {
      console.error("Failed to parse alert history from localStorage", err);
    }
  }
}, []);


  const grouped = groupByTimeRange(alerts)
  return (
  <div className="p-6 space-y-10">
    <h1 className="text-3xl font-bold tracking-tight">Your Alert History</h1>

    {/* Filter Dropdown */}
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <label htmlFor="category" className="text-sm font-medium text-muted-foreground">
        Filter by Expiry:
      </label>
      <select
        id="category"
        className="w-full sm:w-60 rounded-md border border-border bg-muted/20 text-foreground px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring focus:ring-primary"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {Object.keys(grouped).map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
         localStorage.removeItem("flightAlertHistory");
        setAlerts([]);
         }}
       className="bg-red-500 hover:underline border-transparent rounded-xl p-2"
      >
    Clear History
    </button>
    <button
  onClick={() => window.location.reload()}
  className=" bg-blue-600 hover:underline border-transparent p-2 rounded-xl"
>
  Refresh
</button>
    </div>
    

    {/* Alerts List */}
    {grouped[selectedCategory]?.length === 0 ? (
      <p className="text-sm text-muted-foreground italic mt-6">No alerts in this category.</p>
    ) : (
      <div className="flex flex-wrap gap-6 mt-4">
        {grouped[selectedCategory].map((alert) => (
          <Card
            key={alert.id}
            className="w-full sm:w-[48%] lg:w-[30%] bg-white/5 backdrop-blur border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <CardContent className="p-5 space-y-3">
              {/* Title */}
              <div className="text-lg font-bold text-foreground text-white/65">{alert.name}</div>

              {/* Description */}
              <div className="text-sm text-muted-foreground text-white/55">
                Type: <span className="capitalize">{alert.type}</span> <br />
                Distance: {alert.distance} km <br />Notify before: {alert.notifyBefore} min
              </div>

              {/* Expiry Button */}
              <Button
                variant="outline"
                className="w-full justify-between text-sm font-medium text-muted-foreground hover:bg-muted px-3 py-1 rounded-md"
              >
                <span>
                  Expires{" "}
                  {formatDistanceToNowStrict(new Date(alert.expiresAt), { addSuffix: true })}
                </span>
              </Button>

              {/* Status */}
              <div className="text-sm">
                <span className="text-muted-foreground text-white/55">Status:</span>{" "}
                <span
                  className={
                    alert.active
                      ? "text-green-500 font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {alert.active ? "Active" : "Disabled"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
)
}
