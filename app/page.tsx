import Link from "next/link";
import {
  Compass,
  Building2,
  ShieldAlert,
  CalendarCheck2,
  Users,
  Search,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Bot,
  Utensils,
  CloudSun,
} from "lucide-react";

export default function HomePage() {
  const sectors = [
    "Foundry & Castings",
    "Pumps & Fluid Systems",
    "Textile Automation",
    "Automotive Sensors",
    "Air Compressors",
    "Industrial Robotics",
    "Renewable Energy",
    "Bio-Technology",
    "Cloud Data Centers",
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                Live in Coimbatore Industrial Hub (20+ Facilities Verified)
              </span>
              <Link
                href="/coordinator/requests/req-cbe-01"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition"
              >
                <Utensils className="h-3 w-3 text-emerald-700" />
                <span>New: Visit Logistics & Readiness Engine</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Connect Educational Institutions with{" "}
              <span className="text-blue-600">Industrial Facilities</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Stop wasting weeks cold-calling factories. Search industrial facilities within a
              configurable radius, match visits to your academic syllabus via AI, and book
              capacity-controlled slots with built-in safety compliance.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/coordinator/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition"
              >
                <Compass className="h-5 w-5" />
                Find Facilities Near You
              </Link>
              <Link
                href="/industry/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
              >
                <Building2 className="h-5 w-5" />
                List Your Facility
              </Link>
            </div>

            {/* Quick Sector Tags */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-2">Top Sectors:</span>
              {sectors.map((sec) => (
                <span
                  key={sec}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                >
                  {sec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              The Production Coordination Layer
            </h2>
            <p className="mt-3 text-slate-600">
              Built from the ground up to solve mutual friction for both colleges and industrial
              hosts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-6">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  PostGIS Spatial Radius Search
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Find manufacturing plants within 5km, 10km, 25km, or custom distance. Zero client-side
                  Haversine math; queries are indexed with GiST geometry inside PostgreSQL.
                </p>
                <ul className="space-y-2 text-xs font-medium text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Interactive Leaflet map & distance sort
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Filter by sector, education level, group size
                  </li>
                </ul>
              </div>
              <Link
                href="/coordinator/explore"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-3 border-t border-slate-200"
              >
                Explore Map & Facilities <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-6">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  AI Matching & Pre-screening
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Semantic retrieval embeds academic syllabi and match requests. LLM pre-screens
                  requests against host safety policies, group limits, and PPE requirements.
                </p>
                <ul className="space-y-2 text-xs font-medium text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    pgvector HNSW cosine ranking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Human review enforced (zero auto-approval)
                  </li>
                </ul>
              </div>
              <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 pt-3 border-t border-slate-200">
                Pydantic Strict JSON Validation
              </span>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-6">
                  <CalendarCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Atomic Capacity & Safety
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Database row-level locks prevent overbooking during concurrent approvals. Built-in
                  teacher ratio checks and private consent upload for minors.
                </p>
                <ul className="space-y-2 text-xs font-medium text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Transactional slot approval (no race conditions)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Private encrypted bucket with 5-min signed URLs
                  </li>
                </ul>
              </div>
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 pt-3 border-t border-slate-200">
                100% Anti-Overbooking Lock
              </span>
            </div>

            {/* Card 4: Visit Logistics & Weather Advisory */}
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-6 shadow-sm hover:border-emerald-400 transition flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-6">
                  <CloudSun className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                    New Feature
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Visit Logistics & Weather Advisory
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  Canteen & dietary checks, coach parking capacity with height limits, estimated travel time with peak-hour alerts, and Open-Meteo 16-day weather risk flags.
                </p>
                <ul className="space-y-2 text-xs font-medium text-slate-600 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Food & bus bay capacity validation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Peak-hour transit & departure suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Weather advisory & reschedule proposal
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-emerald-200">
                <Link
                  href="/coordinator/requests/req-cbe-01"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                >
                  Inspect Readiness Card Demo
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/coordinator/book/foundry-cbe-01"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Test Booking Form Warnings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to explore verified facilities in Coimbatore?
          </h2>
          <p className="mt-4 text-slate-300 text-base">
            Join PSG Tech, CIT, GCT and over 20 manufacturing facilities transforming experiential
            industrial education.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/coordinator/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500 transition"
            >
              Start Radius Search
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              Create Coordinator Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
