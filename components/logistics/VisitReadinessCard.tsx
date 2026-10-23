"use client";

import {
  Utensils,
  Car,
  Clock,
  CloudSun,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Info,
  Calendar,
  ArrowRight,
} from "lucide-react";
import type { FoodEvaluationResult, ParkingEvaluationResult, ReadinessStatus } from "@/lib/logistics/validation";
import type { TrafficEvaluationResult } from "@/lib/logistics/routing";
import type { WeatherEvaluationResult } from "@/lib/logistics/weather";

export interface VisitReadinessCardProps {
  food: FoodEvaluationResult;
  parking: ParkingEvaluationResult;
  traffic: TrafficEvaluationResult;
  weather: WeatherEvaluationResult;
  isApproved?: boolean;
  canProposeReschedule?: boolean;
  onProposeReschedule?: () => void;
}

function StatusBadge({ status }: { status: ReadinessStatus }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="h-3 w-3" />
        OK
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-3 w-3" />
        Warning
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <HelpCircle className="h-3 w-3" />
      Unavailable
    </span>
  );
}

export default function VisitReadinessCard({
  food,
  parking,
  traffic,
  weather,
  isApproved = false,
  canProposeReschedule = false,
  onProposeReschedule,
}: VisitReadinessCardProps) {
  const hasAnyWarning =
    food.status === "warning" ||
    parking.status === "warning" ||
    traffic.status === "warning" ||
    weather.status === "warning";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Visit Readiness & Logistics</h2>
            {hasAnyWarning ? (
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800 text-[11px] font-semibold px-2.5 py-0.5">
                Logistics Warnings Flagged
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5">
                All Systems Clear
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pre-visit operational evaluation: food options, parking slots, estimated transit, and weather advisory.
          </p>
        </div>

        {canProposeReschedule && weather.canProposeReschedule && (
          <button
            type="button"
            onClick={onProposeReschedule}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
            Propose Reschedule
          </button>
        )}
      </div>

      {/* Grid of 4 Logistics Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Food Logistics */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Utensils className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Food & Dietary Logistics
            </span>
            <StatusBadge status={food.status} />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{food.details}</p>
          {food.flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {food.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Parking Logistics */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Car className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Parking & Vehicle Bays
            </span>
            <StatusBadge status={parking.status} />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{parking.details}</p>
          {parking.flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {parking.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Estimated Travel Time & Transit Risk */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Estimated Travel Time
            </span>
            <StatusBadge status={traffic.status} />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{traffic.details}</p>
          {traffic.suggestedDepartureTime && (
            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Suggested Departure:</span>
              <span className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold text-blue-700 dark:text-blue-400">
                {traffic.suggestedDepartureTime}
              </span>
            </div>
          )}
          <div className="pt-1 text-[10px] text-slate-400 dark:text-slate-500 italic">
            * Estimated travel time based on standard road network distance and historical peak-hour windows. Does not reflect live GPS traffic.
          </div>
        </div>

        {/* 4. Weather Forecast Advisory */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <CloudSun className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Weather Advisory
            </span>
            <StatusBadge status={weather.status} />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{weather.details}</p>
          {weather.flags.length > 0 && (
            <div className="mt-2 space-y-1">
              {weather.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-2 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          )}
          <div className="pt-1 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>Advisory only — never auto-cancels visits</span>
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Weather by Open-Meteo.com
            </a>
          </div>
        </div>
      </div>

      {/* Entry Gate Instructions Callout (Prominently shown if approved) */}
      {isApproved && parking.entryGateInstructions && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
              Approved Entry Gate & Vehicle Access Instructions
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
              {parking.entryGateInstructions}
            </p>
            {parking.maxVehicleHeightM && (
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Height Clearance Restriction: <strong>{parking.maxVehicleHeightM} meters</strong>. Coach drivers must observe barrier limits.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
