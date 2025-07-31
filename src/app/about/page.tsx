import Link from 'next/link';

export default function AboutPage() {
  // Consistent color palette
  const colors = {
    textPrimary: '#1a1a1a',
    textSecondary: '#4a4a4a',
    background: '#ffffff',
    cardBackground: '#f8f9fa',
    primary: '#036ddf',
    primaryHover: '#003d7a',
    border: '#dee2e6'
  };

  return (
    <main 
      className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-[var(--text-primary)]">About SkyWatch Alerts</h1>

        <div
          className="rounded-lg p-8 mb-8 shadow-sm border border-[var(--border-color)]"
          style={{
            backgroundColor: colors.cardBackground
          }}
        >
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.primary }}>
              Our Mission
            </h2>
            <p className="mb-4" style={{ color: colors.textSecondary }}>
              SkyWatch Alerts revolutionizes airspace awareness by providing real-time flight tracking 
              and intelligent proximity alerts, keeping you informed about aircraft movements in your vicinity.
            </p>
            <p style={{ color: colors.textSecondary }}>
              {`Whether you're an aviation enthusiast, professional, or simply curious about air traffic, 
              our platform delivers accurate, timely information right to your fingertips.`}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.primary }}>
              Key Features
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium" style={{ color: colors.textPrimary }}>Live Flight Tracking</h3>
                  <p style={{ color: colors.textSecondary }}>
                    View real-time aircraft positions with detailed flight information including altitude, 
                    speed, and heading.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium" style={{ color: colors.textPrimary }}>Smart Proximity Alerts</h3>
                  <p style={{ color: colors.textSecondary }}>
                    Receive email notifications when aircraft enter your specified radius, with customizable 
                    lead times before arrival.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium" style={{ color: colors.textPrimary }}>Flight History</h3>
                  <p style={{ color: colors.textSecondary }}>
                    {`Explore historical flight paths and analyze patterns with our "Flight Archaeology" feature.`}
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: colors.primary }}>
              How It Works
            </h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li style={{ color: colors.textSecondary }}>
                <span style={{ color: colors.textPrimary }} className="font-medium">Set your location</span> - 
                Allow browser geolocation or enter coordinates manually
              </li>
              <li style={{ color: colors.textSecondary }}>
                <span style={{ color: colors.textPrimary }} className="font-medium">Configure alerts</span> - 
                Specify distance, aircraft types, and notification preferences
              </li>
              <li style={{ color: colors.textSecondary }}>
                <span style={{ color: colors.textPrimary }} className="font-medium">Receive notifications</span> - 
                Get email alerts when matching flights approach your area
              </li>
            </ol>
          </section>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 rounded-lg font-medium border"
            style={{
              color: colors.primary,
              border: `1px solid ${colors.primary}`
            }}
          >
            ← Back to Live Radar
          </Link>
        </div>
      </div>
    </main>
  );
}