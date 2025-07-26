import LiveRadar from "@/components/map/LiveRadar";
import Link from "next/link";
import { Radar } from "lucide-react"; // Choose any icon you prefer

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Icon + Brand Name */}
        <div className="flex items-center space-x-3">
          {/* Unique Icon */}
          <Radar className="w-10 h-10 text-blue-400" />
          {/* Brand Name */}
          <span className="text-3xl font-extrabold tracking-wide text-gray-100 hover:scale-105 hover:text-blue-200 transition duration-300 ease-in-out drop-shadow-lg">
            SkyWatch Alerts
          </span>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4">
          <Link href="/alerts" className="text-blue-400 hover:underline">
            My Alerts
          </Link>
          <Link href="/about" className="text-blue-400 hover:underline">
            About
          </Link>
        </div>
      </div>

      {/* Live Radar Component */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <LiveRadar />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-300">
          Real-time flight tracking with proximity alerts
        </p>
      </div>
    </main>
  );
}
