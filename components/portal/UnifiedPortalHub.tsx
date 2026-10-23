"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  School,
  Building2,
  Utensils,
  Compass,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  Clock,
  Car,
  CloudSun,
  AlertTriangle,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";
import LiveSituationModal from "@/components/logistics/LiveSituationModal";
import seedCatalog from "@/supabase/seed_catalog.json";

export type PortalTab = "coordinator" | "industry" | "logistics";

interface UnifiedPortalHubProps {
  initialTab?: PortalTab;
}

function UnifiedPortalHubContent({ initialTab = "coordinator" }: UnifiedPortalHubProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as PortalTab | null;

  const [activeTab, setActiveTab] = useState<PortalTab>(() => {
    if (tabParam && ["coordinator", "industry", "logistics"].includes(tabParam)) {
      return tabParam;
    }
    return initialTab;
  });

  const [liveModalFacility, setLiveModalFacility] = useState<any | null>(null);
  const [liveWeather, setLiveWeather] = useState<any | null>(null);

  // Sync tab with URL search parameter if it changes
  useEffect(() => {
    if (tabParam && ["coordinator", "industry", "logistics"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Fetch live Coimbatore environmental telemetry
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=11.0168&longitude=76.9558&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.current) {
          setLiveWeather({
            tempC: data.current.temperature_2m,
            apparentTempC: data.current.apparent_temperature,
            weatherCode: data.current.weather_code,
            precipitationMm: data.current.precipitation ?? 0,
            humidityPercent: data.current.relative_humidity_2m ?? 65,
            windSpeedKmh: data.current.wind_speed_10m ?? 8,
          });
        }
      })
      .catch(() => {
        setLiveWeather({
          tempC: 26.5,
          apparentTempC: 28.5,
          weatherCode: 1,
          precipitationMm: 0,
          humidityPercent: 70,
          windSpeedKmh: 6.5,
        });
      });
  }, []);

  function handleTabChange(tab: PortalTab) {
    setActiveTab(tab);
    // Smooth URL update without reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }

  // Coordinator sample requests
  const coordinatorRequests = [
    {
      id: "req-cbe-01",
      facility: "Kovai Precision Foundry & Heavy Castings [Demo]",
      sector: "Foundry & Heavy Engineering",
      date: "Nov 10, 2026",
      time: "10:00 AM - 01:00 PM",
      students: 30,
      teachers: 2,
      department: "4th Sem B.E. Mechanical Engineering",
      status: "approved",
      statusLabel: "Approved",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      complianceStatus: "Verified & Locked",
    },
    {
      id: "req-cbe-02",
      facility: "Marudham Automated Textile Machineries [Demo]",
      sector: "Textile Machinery & Automation",
      date: "Nov 18, 2026",
      time: "02:00 PM - 05:00 PM",
      students: 25,
      teachers: 2,
      department: "5th Sem Textile Technology",
      status: "pending",
      statusLabel: "Pending Triage",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
      complianceStatus: "AI Pre-screening Passed",
    },
    {
      id: "req-cbe-03",
      facility: "Siruvani Eco Water & Agro-Tech Processing [Demo]",
      sector: "Food Processing & Agro-Tech",
      date: "Oct 12, 2026",
      time: "10:00 AM - 01:00 PM",
      students: 40,
      teachers: 3,
      department: "3rd Sem Biotechnology",
      status: "completed",
      statusLabel: "Completed",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
      complianceStatus: "Feedback Submitted (4.9/5)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">
      <div className="container mx-auto px-4 py-6 sm:px-6 max-w-7xl">
        {/* Unified Interface Header & Tab Switcher */}
        <div className="mb-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-xs backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-0.5 text-xs font-semibold">
                  Unified VisitLink Command Center
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Coimbatore Hub</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
                Integrated Operations Portal
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Switch seamlessly between Academic Coordinator, Industry Host, and Visit Logistics on one screen.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/coordinator/explore"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              >
                <Compass className="h-4 w-4" />
                Find Industries
              </Link>
            </div>
          </div>

          {/* The 3-Function Segmented Tab Switcher */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="inline-flex w-full sm:w-auto p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => handleTabChange("coordinator")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "coordinator"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <School className="h-4 w-4" />
                <span>Schools &amp; Colleges</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("industry")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "industry"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Industry Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("logistics")}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === "logistics"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Utensils className="h-4 w-4" />
                <span>Visit Logistics</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                Active view:{" "}
                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                  {activeTab === "coordinator" && "Academic Coordinator"}
                  {activeTab === "industry" && "Industry Host Portal"}
                  {activeTab === "logistics" && "Logistics & Real-Time Readiness"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: SCHOOLS & COLLEGES VIEW */}
        {activeTab === "coordinator" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800 px-2 py-0.5 text-xs font-semibold">
                    PSG College of Technology [Demo]
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Coimbatore Central Hub</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                  Coordinator Visit Management
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Search nearby industries, coordinate visit schedules, and monitor student compliance rosters.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/coordinator/explore"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
                >
                  <Compass className="h-4 w-4" />
                  Explore Industries
                </Link>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">1 Approved, 1 Pending</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Students Participating</span>
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">95</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 3 academic departments</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Compliance Status</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Parental consent &amp; ratio validated</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Completed Visits</span>
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">1</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average rating: 4.9/5</p>
              </div>
            </div>

            {/* Safety Checklist Reminder Callout */}
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <span className="font-semibold text-blue-900 dark:text-blue-200">
                    Mandatory Safety &amp; Compliance Guardrails
                  </span>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    1:15 faculty-to-student escort ratio required. Signed parental consent slips must be uploaded for students under 18 prior to facility dispatch.
                  </p>
                </div>
              </div>
              <Link
                href="/coordinator/explore"
                className="whitespace-nowrap text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition flex items-center gap-1"
              >
                Book new facility visit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Visit Requests Table */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Visit Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Track status history, view approved slot passes, and inspect logistics.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {coordinatorRequests.map((req) => (
                  <div
                    key={req.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 p-3 rounded-2xl transition"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {req.facility}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${req.statusColor}`}>
                          {req.statusLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {req.date} ({req.time})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {req.students} Students ({req.teachers} Faculty)
                        </span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                          {req.department}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Compliance: <span className="text-slate-600 dark:text-slate-300 font-medium">{req.complianceStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTabChange("logistics")}
                        className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
                      >
                        <Utensils className="h-3.5 w-3.5" />
                        Logistics
                      </button>
                      <Link
                        href={`/coordinator/requests/${req.id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs"
                      >
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INDUSTRY HOST PORTAL VIEW */}
        {activeTab === "industry" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800 px-2 py-0.5 text-xs font-semibold">
                    Kovai Precision Foundry &amp; Heavy Castings [Demo]
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Host Facility Portal</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                  Industry Host Portal
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Manage your industrial facility profile, configure capacity slots, and screen student visit requests.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/industry/slots"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <Calendar className="h-4 w-4" />
                  Manage Slots
                </Link>
                <Link
                  href="/industry/profile"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
                >
                  <Building2 className="h-4 w-4" />
                  Edit Facility Profile
                </Link>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
                  <ClipboardList className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">3</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Requires manager review &amp; triage</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Slots / Week</span>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">4</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tue &amp; Thu (10am-1pm, 2pm-5pm)</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Weekly Capacity</span>
                  <Users className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">180 Students</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Zero overbooking guaranteed</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Safety Status</span>
                  <ShieldAlert className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verified</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">PPE rules &amp; Minors policy active</p>
              </div>
            </div>

            {/* Incoming Requests Review Queue */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Incoming Visit Requests</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI pre-screened requests waiting for your approval.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/30">
                  3 Pending
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Request 1 */}
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        PSG College of Technology [Demo]
                      </span>
                      <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800">
                        Undergraduate
                      </span>
                      <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-transparent dark:border-emerald-800">
                        AI Triage: Pass
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Department: <span className="font-medium text-slate-800 dark:text-slate-200">4th Sem B.E. Mechanical Engineering</span> | Group: <span className="font-medium text-slate-800 dark:text-slate-200">40 Students, 3 Faculty</span> (Ratio 1:13 OK)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requested Slot: <span className="font-medium">Tuesday, Nov 10, 2026 (10:00 AM - 1:00 PM)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/industry/requests/demo-req-01"
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                    >
                      Review &amp; Triage
                    </Link>
                  </div>
                </div>

                {/* Request 2 */}
                <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Stanes Higher Secondary School [Demo]
                      </span>
                      <span className="rounded bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800">
                        School / Minors Present
                      </span>
                      <span className="rounded bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-transparent dark:border-amber-800">
                        AI Triage: Flagged (Minors)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Department: <span className="font-medium text-slate-800 dark:text-slate-200">11th Grade Science Stream</span> | Group: <span className="font-medium text-slate-800 dark:text-slate-200">30 Students, 2 Faculty</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Requested Slot: <span className="font-medium">Thursday, Nov 12, 2026 (2:00 PM - 5:00 PM)</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/industry/requests/demo-req-02"
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs"
                    >
                      Review &amp; Triage
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VISIT LOGISTICS & ENVIRONMENTAL TELEMETRY VIEW */}
        {activeTab === "logistics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800 px-2 py-0.5 text-xs font-semibold">
                    Real-Time Logistics Engine
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Active Booking: req-cbe-01</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
                  Visit Logistics &amp; Operational Readiness
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Pre-visit logistics verification covering transit route conditions, weather advisory, canteen catering, and coach parking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const found = seedCatalog.industries[0];
                    setLiveModalFacility({
                      ...found,
                      distance_km: 15.2,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
                >
                  <Radio className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                  Live Situation Telemetry
                </button>
              </div>
            </div>

            {/* Interactive Logistics Readiness Card */}
            <VisitReadinessCard
              food={{
                status: "ok",
                flags: [],
                details: "Plant canteen meals provided for 30 students and 2 faculty. RO drinking water points active.",
              }}
              parking={{
                status: "ok",
                flags: [],
                details: "2 dedicated heavy bus bays reserved at Gate 2. Clearance height 4.5m with driver lounge.",
              }}
              traffic={{
                status: "ok",
                distanceKm: 15.2,
                durationMinutes: 28,
                peakHourRisk: false,
                details: "Distance 15.2 km (~28 mins transit) via Avinashi bypass. Low congestion expected.",
                suggestedDepartureTime: "09:15 AM",
                provider: "openrouteservice",
              }}
              weather={{
                status: "ok",
                riskType: "none",
                temperatureC: liveWeather?.tempC ?? 26.5,
                rainProbability: liveWeather?.precipitationMm ? 40 : 10,
                weatherCode: liveWeather?.weatherCode ?? 1,
                weatherDescription: "Partly cloudy / Clear skies",
                details: `Live conditions: ${liveWeather?.tempC ?? 26.5}°C, humidity ${liveWeather?.humidityPercent ?? 65}%, clear skies. Optimal conditions for plant visit.`,
                flags: [],
                canProposeReschedule: false,
                attribution: "Open-Meteo",
              }}
              isApproved={true}
            />

            {/* Operational Briefing & Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center gap-2">
                  <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Transit &amp; Parking Routing Guide
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Heavy coach buses must enter through <strong>Gate 2 (Avinashi Road bypass)</strong>. Designated bus bay 1A has been assigned for 10:00 AM arrival. Driver waiting lounge and restrooms are situated beside the security office.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Assigned Bay: <strong>Bay 1A</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Driver Pass Issued</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-2 flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Food &amp; Dining Guidelines
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Plant cafeteria provides RO purified drinking water stations throughout the visitor walkway. Pre-packaged hygienic lunch packets will be served in the Executive Dining Hall at 12:30 PM. Outside snacks are not allowed on the shop floor.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Hall: <strong>Executive Dining</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">RO Water Stations Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Situation Telemetry Modal */}
      {liveModalFacility && (
        <LiveSituationModal
          isOpen={!!liveModalFacility}
          onClose={() => setLiveModalFacility(null)}
          facility={liveModalFacility}
          liveWeather={liveWeather ?? undefined}
        />
      )}
    </div>
  );
}

export default function UnifiedPortalHub({ initialTab = "coordinator" }: UnifiedPortalHubProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 text-sm">
          Loading Unified Portal...
        </div>
      }
    >
      <UnifiedPortalHubContent initialTab={initialTab} />
    </Suspense>
  );
}
