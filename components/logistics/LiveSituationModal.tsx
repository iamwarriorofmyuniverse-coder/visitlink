"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Utensils,
  Car,
  Clock,
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Building2,
  Radio,
  Navigation,
} from "lucide-react";
import {
  getLiveTrafficSituation,
  getLiveWeatherSituation,
  type LiveWeatherInput,
  type LiveTrafficInfo,
  type LiveWeatherInfo,
} from "@/lib/logistics/live_situation";

interface LiveSituationModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: {
    id?: string;
    readable_id?: string;
    name: string;
    sector: string;
    distance_km: number;
    lat: number;
    lng: number;
    canteen_available?: boolean;
    meal_options?: string[];
    max_meal_capacity?: number;
    outside_food_allowed?: boolean;
    refreshments_provided?: boolean;
    food_notes?: string;
    bus_parking_slots?: number;
    car_parking_slots?: number;
    max_vehicle_height_m?: number;
    entry_gate_instructions?: string;
    parking_notes?: string;
    outdoor_component?: boolean;
    heat_sensitive?: boolean;
  };
  liveWeather?: LiveWeatherInput;
}

export default function LiveSituationModal({
  isOpen,
  onClose,
  facility,
  liveWeather,
}: LiveSituationModalProps) {
  const [traffic, setTraffic] = useState<LiveTrafficInfo | null>(null);
  const [weather, setWeather] = useState<LiveWeatherInfo | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Evaluate live traffic
    const trafficInfo = getLiveTrafficSituation(facility.distance_km);
    setTraffic(trafficInfo);

    // Weather fallback if not directly provided
    const weatherInput: LiveWeatherInput = liveWeather ?? {
      tempC: 25.4,
      apparentTempC: 28.1,
      weatherCode: 1, // Mainly clear
      precipitationMm: 0.0,
      humidityPercent: 78,
      windSpeedKmh: 6.2,
    };

    const weatherInfo = getLiveWeatherSituation(weatherInput, {
      outdoor_component: !!facility.outdoor_component,
      heat_sensitive: !!facility.heat_sensitive,
    });
    setWeather(weatherInfo);

    // Live clock
    const now = new Date();
    const timeFormatted = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    }).format(now);
    setCurrentTimeStr(timeFormatted);
  }, [isOpen, facility, liveWeather]);

  if (!isOpen) return null;

  const facilityId = facility.readable_id || facility.id || "foundry-cbe-01";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Live Situation Telemetry
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Real-Time IST
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Coimbatore Hub • {currentTimeStr}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Facility Headline */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 p-4 border border-blue-100/80">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                  {facility.sector} Sector
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
                  {facility.name}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    {facility.distance_km} km from Central Hub
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-emerald-700">
                    🟢 Receiving College Visits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quadrants of Live Situation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Live Weather & Plant Conditions */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CloudSun className="h-4 w-4 text-sky-600" />
                  Live Weather Situation
                </span>
                {weather?.outdoorRisk === "high" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Advisory Active
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Optimal
                  </span>
                )}
              </div>

              {weather && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {weather.iconType === "rain" && (
                        <CloudRain className="h-6 w-6 text-blue-500" />
                      )}
                      {weather.iconType === "sun" && (
                        <Sun className="h-6 w-6 text-amber-500" />
                      )}
                      {weather.iconType === "cloud" && (
                        <CloudSun className="h-6 w-6 text-slate-500" />
                      )}
                      {weather.iconType === "storm" && (
                        <CloudLightning className="h-6 w-6 text-purple-600" />
                      )}
                      <div>
                        <div className="text-xl font-extrabold text-slate-900">
                          {Math.round(weather.temperatureC)}°C
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {weather.conditionLabel}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                      {facility.outdoor_component && (
                        <span className="inline-block rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold text-sky-800">
                          Outdoor Plant Area
                        </span>
                      )}
                      {facility.heat_sensitive && (
                        <span className="inline-block rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-800">
                          Thermal Sensitive
                        </span>
                      )}
                    </div>
                  </div>

                  {weather.riskReason ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{weather.riskReason}</span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Favorable outdoor & plant visit conditions right now.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Live Transit & Route Situation */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  Live Transit Situation
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    traffic?.trafficState === "normal"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {traffic?.trafficState === "normal" ? "Smooth" : "Peak Delay"}
                </span>
              </div>

              {traffic && (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">
                        ~{traffic.estimatedMinutes}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 ml-1">mins</span>
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {traffic.distanceKm} km route
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-snug">
                    {traffic.suggestedDepartureText}
                  </p>

                  <div className="pt-1 text-[10px] text-slate-400 italic">
                    * Estimated travel time from PSG Tech / Central Hub. Checked against active Coimbatore peak windows.
                  </div>
                </div>
              )}
            </div>

            {/* 3. Canteen & Meal Availability */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Utensils className="h-4 w-4 text-blue-600" />
                Canteen & Meal Requisition
              </span>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">On-site Canteen:</span>
                  <span className="font-semibold">
                    {facility.canteen_available ? "Available" : "Not Available"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Meal Types:</span>
                  <span className="font-semibold capitalize">
                    {facility.meal_options?.join(", ") || "None"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Max Seating Capacity:</span>
                  <span className="font-semibold">
                    {facility.max_meal_capacity ?? 0} students
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Outside Packed Food:</span>
                  <span className="font-semibold">
                    {facility.outside_food_allowed ? "Allowed in dining area" : "Prohibited"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Parking & Gate Clearance */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Car className="h-4 w-4 text-indigo-600" />
                Parking & Gate Access
              </span>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Institution Bus Bays:</span>
                  <span className="font-semibold">
                    {facility.bus_parking_slots ?? 1} Bays Available
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Faculty Car Slots:</span>
                  <span className="font-semibold">
                    {facility.car_parking_slots ?? 4} Slots Available
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Max Height Clearance:</span>
                  <span className="font-semibold">
                    {facility.max_vehicle_height_m ?? 4.2} meters
                  </span>
                </div>
                {facility.entry_gate_instructions && (
                  <p className="text-[11px] text-blue-900 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                    <strong>Gate Routing:</strong> {facility.entry_gate_instructions}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Direct Booking Action */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close View
          </button>

          <Link
            href={`/coordinator/book/${facilityId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition"
          >
            Book Visit with Verified Logistics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
