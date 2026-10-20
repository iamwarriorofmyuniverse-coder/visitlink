"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  Star,
  ArrowLeft,
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";

export default function CoordinatorRequestDetailsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "reschedule_proposed" | "completed">("approved");
  const [rescheduleAccepted, setRescheduleAccepted] = useState(false);

  // Logistics Readiness Evaluation for Coordinator
  const hasLogisticsWarning = requestId.includes("warning") || requestId === "req-cbe-02";

  const foodLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    flags: hasLogisticsWarning
      ? ["Meal headcount (65) exceeds facility canteen capacity (50)."]
      : [],
    details: hasLogisticsWarning
      ? "Meal headcount (65) exceeds facility canteen capacity (50)."
      : "Canteen available (veg, non_veg). Capacity sufficient for 40 students.",
  };

  const parkingLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    flags: hasLogisticsWarning
      ? ["Requested buses (4) exceed facility bus parking bays (2)."]
      : [],
    details: hasLogisticsWarning
      ? "Requested buses (4) exceed facility bus parking bays (2)."
      : "Parking allocated: 1 bus bay and 2 car bays. Max vehicle height: 4.5m.",
    entryGateInstructions:
      "Gate 2 (Heavy Vehicle & Logistics Gate) on Avinashi Road; driver must register at security post.",
    maxVehicleHeightM: 4.5,
  };

  const trafficLogistics = {
    status: "warning" as const,
    distanceKm: 18.5,
    durationMinutes: 37,
    peakHourRisk: true,
    peakWindowName: "Morning Peak",
    suggestedDepartureTime: "08:38",
    details:
      "Estimated travel time: 37 mins (18.5 km). Morning Peak traffic expected along route. Suggested departure: 08:38 to ensure on-time arrival.",
    provider: "OpenRouteService",
  };

  const weatherLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    riskType: (hasLogisticsWarning ? "rain_risk" : "none") as "none" | "rain_risk",
    temperatureC: 29.5,
    rainProbability: hasLogisticsWarning ? 75 : 15,
    weatherCode: hasLogisticsWarning ? 61 : 1,
    weatherDescription: hasLogisticsWarning ? "Rain showers" : "Mainly clear",
    details: hasLogisticsWarning
      ? "Rain Risk: High rain probability (75%) forecast on visit date for outdoor operations."
      : "Forecast: Mainly clear. Max temp 31°C, rain probability 15%. Conditions favorable.",
    flags: hasLogisticsWarning
      ? ["Rain Risk: High rain probability (75%) for outdoor facility operations."]
      : [],
    canProposeReschedule: hasLogisticsWarning,
    attribution: "Weather data by Open-Meteo.com",
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-4xl">
      <Link
        href="/coordinator"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Coordinator Dashboard
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">Request #{requestId}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : status === "reschedule_proposed"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Kovai Precision Foundry & Heavy Castings [Demo]
            </h1>
            <p className="text-xs text-slate-500">
              Sector: Foundry & Heavy Castings | Malumichampatti, Coimbatore
            </p>
          </div>

          <div className="flex items-center gap-2">
            {status === "approved" && (
              <button
                type="button"
                onClick={() => setStatus("completed")}
                className="px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
              >
                Mark Visit Completed
              </button>
            )}
            {status === "completed" && (
              <Link
                href={`/feedback/${requestId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
              >
                <Star className="h-4 w-4" />
                Submit Visit Feedback
              </Link>
            )}
          </div>
        </div>

        {/* Reschedule Proposal Banner if applicable */}
        {status === "reschedule_proposed" && !rescheduleAccepted && (
          <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Industry Manager Proposed an Alternative Date
            </div>
            <p className="text-xs text-amber-700">
              The facility has limited capacity or weather advisory on your requested date and has offered the following alternative:
            </p>
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-semibold text-slate-900">
              Proposed Date: Tuesday, Nov 17, 2026 (10:00 AM - 1:00 PM)
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRescheduleAccepted(true);
                  setStatus("approved");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                Accept New Date
              </button>
              <button
                type="button"
                onClick={() => alert("Reschedule declined. Request cancelled.")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Decline & Cancel
              </button>
            </div>
          </div>
        )}

        {/* Unified Visit Readiness & Logistics Card */}
        <VisitReadinessCard
          food={foodLogistics}
          parking={parkingLogistics}
          traffic={trafficLogistics}
          weather={weatherLogistics}
          isApproved={status === "approved" || status === "completed"}
        />

        {/* Visit Parameters Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Visit Parameters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Date</span>
              <strong className="text-slate-900 text-sm">Tuesday, Nov 10, 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Time Window</span>
              <strong className="text-slate-900 text-sm">10:00 AM - 1:00 PM</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Group Size</span>
              <strong className="text-slate-900 text-sm">40 Students (3 Teachers)</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Minors Present</span>
              <strong className="text-slate-900 text-sm">No (All 18+)</strong>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase mb-1">
              Safety Briefing & Gate Instructions from Facility Head:
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              &ldquo;Please ensure all students arrive wearing safety shoes and safety glasses. Report to Gate 2 at 9:45 AM for the safety induction briefing. No mobile phones permitted on the main casting shop floor.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
