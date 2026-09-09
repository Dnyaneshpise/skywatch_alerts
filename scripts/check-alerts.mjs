const endpoint =
  process.env.ALERT_CHECK_URL || "http://localhost:3000/api/alerts/check";
const secret = process.env.CRON_SECRET || "local-dev-secret";
const intervalMs = Number(process.env.ALERT_CHECK_INTERVAL_MS || 60_000);

async function checkAlerts() {
  try {
    const response = await fetch(endpoint, {
      headers: { "x-cron-secret": secret },
    });
    const data = await response.json();
    const time = new Date().toLocaleTimeString();

    if (!response.ok) {
      console.error(
        `[${time}] Alert check failed:`,
        data.error || response.statusText,
      );
      return;
    }

    console.log(`[${time}] Alert check:`, JSON.stringify(data));
  } catch (error) {
    console.error("Alert watcher connection failed:", error.message);
  }
}

console.log(`Watching alerts at ${endpoint} every ${intervalMs / 1000}s`);
await checkAlerts();
setInterval(checkAlerts, intervalMs);
