import LiveRadar from "@/components/map/LiveRadar";
// import Link from "next/link";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">

      <div className="bg-white rounded-xl shadow-lg p-4">
        <LiveRadar />
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Real-time flight tracking with proximity alerts
        </p>
      </div>
    </main>
  );
}
