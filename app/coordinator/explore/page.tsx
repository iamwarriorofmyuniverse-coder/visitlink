"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CloudSun,
  Clock,
  Utensils,
  Car,
  Radio,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  formatLiveFacilityStatus,
  type LiveWeatherInput,
} from "@/lib/logistics/live_situation";
import LiveSituationModal from "@/components/logistics/LiveSituationModal";

// Dynamically import Leaflet Map to avoid SSR 'window is not defined' crash
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-sm">
      Loading Coimbatore Map...
    </div>
  ),
});

export default function ExploreIndustriesPage() {
  const [userLat] = useState(11.0168); // Coimbatore Central
  const [userLng] = useState(76.9558);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedSector, setSelectedSector] = useState("all");
  const [groupSize, setGroupSize] = useState<number>(30);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "relevance">("distance");
  const [liveModalFacility, setLiveModalFacility] = useState<any | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherInput | null>(null);

  // Fetch live Coimbatore environmental telemetry from Open-Meteo
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
        // Fallback default for offline/network issues
        setLiveWeather({
          tempC: 26.5,
          apparentTempC: 28.5,
          weatherCode: 1,
          precipitationMm: 0,
          humidityPercent: 70,
          windSpeedKmh: 6.5,
        });
      });

    // Expose global modal opener for Leaflet map popups
    if (typeof window !== "undefined") {
      (window as any).__openLiveSituation = (facilityId: string) => {
        const found = seedCatalog.industries.find(
          (i) => i.readable_id === facilityId || (i as any).id === facilityId
        );
        if (found) {
          setLiveModalFacility({
            ...found,
            distance_km: 15.2,
          });
        }
      };
    }
  }, []);

  // PostGIS spatial math emulation for local client UI
  function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  // Filter and rank facilities
  const filteredFacilities = useMemo(() => {
    return seedCatalog.industries
      .map((ind) => {
        const distance = calculateDistanceKm(userLat, userLng, ind.lat, ind.lng);
        // Basic keyword relevance score baseline
        let score = 0;
        if (semanticQuery.trim()) {
          const qWords = semanticQuery.toLowerCase().split(/\s+/);
          const fullText = `${ind.name} ${ind.sector} ${ind.curriculum_topics} ${ind.highlights}`.toLowerCase();
          const matchCount = qWords.filter((w) => fullText.includes(w)).length;
          score = matchCount / qWords.length;
        }
        return {
          ...ind,
          id: ind.readable_id,
          distance_km: distance,
          relevance_score: score,
        };
      })
      .filter((ind) => {
        // Hard Spatial Radius Filter
        if (ind.distance_km > radiusKm) return false;
        // Sector Filter
        if (selectedSector !== "all" && ind.sector !== selectedSector) return false;
        // Capacity Filter
        if (groupSize && ind.max_group_size < groupSize) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "relevance" && semanticQuery.trim()) {
          return b.relevance_score - a.relevance_score || a.distance_km - b.distance_km;
        }
        return a.distance_km - b.distance_km;
      });
  }, [userLat, userLng, radiusKm, selectedSector, groupSize, semanticQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6">
      {/* Top Search & Filter Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600" />
              Discover Facilities in Coimbatore Hub
            </h1>
            <p className="text-xs text-slate-500">
              PostGIS radius query centered at Coimbatore (11.0168° N, 76.9558° E).
            </p>
          </div>

          {/* AI Syllabus Topic Matcher Input */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              value={semanticQuery}
              onChange={(e) => {
                setSemanticQuery(e.target.value);
                if (e.target.value.trim()) setSortBy("relevance");
              }}
              placeholder="Search syllabus: e.g. CNC, casting, robotics..."
              className="w-full rounded-xl border border-blue-200 bg-blue-50/40 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Sparkles className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-600" />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase">
              Radius: {radiusKm} km
            </label>
            <div className="flex items-center gap-1 mt-1">
              {[5, 10, 25, 50].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition ${
                    radiusKm === r
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase">
              Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              <option value="foundry">Foundry & Castings</option>
              <option value="pumps">Pumps & Hydraulics</option>
              <option value="textiles">Textile Automation</option>
              <option value="automotive">Automotive Sensors</option>
              <option value="manufacturing">Industrial Compressors</option>
              <option value="research_lab">Robotics & 3D Lab</option>
              <option value="renewable_energy">Renewable Energy</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase">
              Students Group Size
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-1.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="distance">Distance (Nearest First)</option>
              <option value="relevance">AI Syllabus Relevance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Map (Left) & Facilities Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-7 h-[420px] lg:h-[680px] sticky top-20 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <LeafletMap
            center={[userLat, userLng]}
            zoom={11}
            facilities={filteredFacilities}
            selectedId={selectedFacilityId}
            onSelectFacility={(id) => setSelectedFacilityId(id)}
            radiusKm={radiusKm}
          />
        </div>

        {/* Facility Cards Column */}
        <div className="lg:col-span-5 space-y-4 max-h-[680px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredFacilities.length}</strong> facilities within {radiusKm} km
            </span>
            <span>Sorted by {sortBy}</span>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <Compass className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 text-sm">No facilities found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try widening your radius slider to 25 km or 50 km, or selecting &ldquo;All Sectors&rdquo;.
              </p>
            </div>
          ) : (
            filteredFacilities.map((fac) => {
              const isSelected = fac.id === selectedFacilityId;
              const liveStatus = formatLiveFacilityStatus({
                ...fac,
                liveWeather: liveWeather ?? undefined,
              });

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className={`rounded-2xl border p-5 transition cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/20 ring-1 ring-blue-500 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
                        {fac.sector}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">
                        {fac.name}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                      {fac.distance_km} km
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                    <strong className="text-slate-700">Highlights:</strong> {fac.highlights}
                  </p>

                  {/* Built-in Live Situation & Logistics Telemetry */}
                  <div className="mt-3.5 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          Live Situation & Logistics
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {liveStatus.transitInfo.trafficState === "normal" ? "🟢 Smooth Route" : "⚠️ Peak Congestion"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="rounded-lg bg-white p-1.5 border border-slate-200/70 flex items-center gap-1.5 shadow-2xs">
                        <CloudSun className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">
                          {liveStatus.weatherBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 border border-slate-200/70 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">
                          {liveStatus.transitBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 border border-slate-200/70 flex items-center gap-1.5 shadow-2xs">
                        <Utensils className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">
                          {liveStatus.canteenBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-1.5 border border-slate-200/70 flex items-center gap-1.5 shadow-2xs">
                        <Car className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate font-medium text-slate-800">
                          {liveStatus.parkingBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      Group: {fac.min_group_size}-{fac.max_group_size}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Min Level: {fac.min_education_level}
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiveModalFacility(fac);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
                    >
                      <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                      Live Situation
                    </button>

                    <Link
                      href={`/coordinator/book/${fac.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Request Visit
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
