# SkyWatch Alerts ✈️

Real-time flight tracking application with proximity alerts and smart data management.

## Features

### Live Radar
- Real-time flight tracking on an interactive map
- Aircraft position, altitude, speed, and heading information
- Custom airplane icons with proper heading rotation
- Automatic location detection

### Smart Data Management
- Intelligent polling system that adapts to:
  - Number of active flights (5-30 second intervals)
  - User activity status
  - API rate limit conditions
- Client-side caching with:
  - 5-second TTL for fresh data
  - 30-second maximum cache age
  - Automatic cache invalidation

### Rate Limiting
- Server-side rate limiting (60 requests/minute per IP)
- Client-side rate limit management
- Exponential backoff with jitter
- Visual feedback for rate limit status
- Proper rate limit headers (X-RateLimit-*)

### Error Handling
- Comprehensive error type system
- Automatic retry logic with backoff
- User-friendly error messages
- Network error recovery
- Error boundary implementation

### Flight Alerts
- Customizable proximity alerts
- Alert configuration for:
  - Distance thresholds
  - Aircraft types
  - Notification preferences
- Email notifications
- Alert history tracking

## Technical Stack

### Frontend
- Next.js 15.3
- React 19.0
- TypeScript
- Leaflet/React-Leaflet for mapping
- TailwindCSS for styling

### Backend
- Next.js API Routes
- ADSB Exchange API integration
- In-memory rate limiting
- Response caching

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/skywatch-alerts.git
cd skywatch-alerts
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture

### Data Flow
1. User loads the application
2. Browser geolocation is requested
3. Live Radar component initializes
4. Smart polling begins with adaptive intervals
5. Flight data is cached and displayed on the map

### Rate Limit Management
- RateLimitHandler (Singleton)
  - Tracks API rate limits
  - Implements exponential backoff
  - Shares rate limit state

### Caching System
- CacheService (Singleton)
  - Coordinates-based cache keys
  - TTL and max age management
  - Automatic cache invalidation

### Error Management
- Typed error system
- Error boundaries for component isolation
- Automatic retry mechanism
- User-friendly error states

## API Endpoints

### GET /api/flights
Fetches nearby flights based on location.

Parameters:
- lat (required): Latitude
- lon (required): Longitude
- radius (optional): Search radius in nautical miles (default: 50)

Response Headers:
- X-RateLimit-Limit: Maximum requests per window
- X-RateLimit-Remaining: Remaining requests
- X-RateLimit-Reset: Timestamp when limit resets

### GET /api/alerts
Manages user alert configurations.

Parameters:
- userId (required): User identifier
- type (optional): Alert type filter

## Configuration

### Rate Limiting
\`\`\`typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // requests per minute
\`\`\`

### Caching
\`\`\`typescript
const CACHE_TTL = 5000; // 5 seconds
const MAX_CACHE_AGE = 30000; // 30 seconds
\`\`\`

### Polling
\`\`\`typescript
const MIN_POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_INTERVAL = 30000; // 30 seconds
const INACTIVE_THRESHOLD = 300000; // 5 minutes
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ADSB Exchange](https://www.adsbexchange.com/) for flight data
- [Leaflet](https://leafletjs.com/) for mapping functionality
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the framework