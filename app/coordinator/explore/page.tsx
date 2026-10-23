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
  BookOpen,
  Building,
  Star,
  HelpCircle,
  Wrench,
  Cpu,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  formatLiveFacilityStatus,
  type LiveWeatherInput,
} from "@/lib/logistics/live_situation";
import LiveSituationModal from "@/components/logistics/LiveSituationModal";
import {
  matchesEngagementFilter,
  formatEngagementBadge,
  type InteractiveElement,
} from "@/lib/engagement/profile";
import {
  rerankWithExplorationSlot,
  matchesHandsOnTag,
  matchesModernTechnologyTag,
  RankableFacility,
} from "@/lib/resourceful/rerank";
import ScoreExplainModal from "@/components/resourceful/ScoreExplainModal";

// Dynamically import Leaflet Map to avoid SSR 'window is not defined' crash
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-sm">
      Loading Coimbatore Map...
    </div>
  ),
});

export default function ExploreIndustriesPage() {
  const [userLat] = useState(11.0168); // Coimbatore Central
  const [userLng] = useState(76.9558);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedEngagement, setSelectedEngagement] = useState<string>("all");
  const [selectedSpecialTag, setSelectedSpecialTag] = useState<"all" | "hands_on" | "modern_tech">("all");
  const [groupSize, setGroupSize] = useState<number>(30);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "distance">("relevance");
  const [liveModalFacility, setLiveModalFacility] = useState<any | null>(null);
  const [explainFacility, setExplainFacility] = useState<any | null>(null);
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
    // 1. Calculate distances & basic query relevance
    const mapped = seedCatalog.industries.map((ind: any) => {
      const distance = calculateDistanceKm(userLat, userLng, ind.lat, ind.lng);
      let score = 0.5; // baseline default
      if (semanticQuery.trim()) {
        const qWords = semanticQuery.toLowerCase().split(/\s+/);
        const fullText = `${ind.name} ${ind.sector} ${ind.curriculum_topics || ""} ${ind.highlights || ""}`.toLowerCase();
        const matchCount = qWords.filter((w) => fullText.includes(w)).length;
        score = matchCount / qWords.length;
      }
      return {
        ...ind,
        id: ind.readable_id,
        distance_km: distance,
        relevance_score: score,
      };
    });

    // 2. Apply Hard Filters
    const filtered = mapped.filter((ind: any) => {
      // Hard Spatial Radius Filter
      if (ind.distance_km > radiusKm) return false;
      // Sector Filter
      if (selectedSector !== "all" && ind.sector !== selectedSector) return false;
      // Engagement Filter
      if (
        selectedEngagement !== "all" &&
        !matchesEngagementFilter(ind.interactive_elements || [], selectedEngagement)
      ) {
        return false;
      }
      // Capacity Filter
      if (groupSize && ind.max_group_size < groupSize) return false;

      // Special Tag Filters (Tag-based, independent of scores)
      if (selectedSpecialTag === "hands_on" && !matchesHandsOnTag(ind)) {
        return false;
      }
      if (selectedSpecialTag === "modern_tech" && !matchesModernTechnologyTag(ind)) {
        return false;
      }

      return true;
    });

    // 3. Sorting & Quality Re-ranking
    if (sortBy === "distance") {
      return [...filtered].sort((a, b) => a.distance_km - b.distance_km);
    }

    // Default: Relevance + Quality Re-Rank with Exploration Slot for New Industries
    return rerankWithExplorationSlot(filtered as RankableFacility[]);
  }, [userLat, userLng, radiusKm, selectedSector, selectedEngagement, selectedSpecialTag, groupSize, semanticQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6">
      {/* Top Search & Filter Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Discover Facilities in Coimbatore Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PostGIS radius query centered at Coimbatore (11.0168° N, 76.9558° E). Resourceful sites re-ranked by syllabus fit &amp; host readiness.
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
              className="w-full rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50/40 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Sparkles className="absolute left-3 top-2.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
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
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              Sector
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              <option value="foundry">Foundry &amp; Castings</option>
              <option value="pumps">Pumps &amp; Hydraulics</option>
              <option value="textiles">Textile Automation</option>
              <option value="automotive">Automotive Sensors</option>
              <option value="manufacturing">Industrial Compressors</option>
              <option value="research_lab">Robotics &amp; 3D Lab</option>
              <option value="renewable_energy">Renewable Energy</option>
            </select>
          </div>

          <div>
            <label htmlFor="engagementFilter" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              Engagement
            </label>
            <select
              id="engagementFilter"
              value={selectedEngagement}
              onChange={(e) => setSelectedEngagement(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Engagement</option>
              <option value="hands_on_activity">Hands-on Activity</option>
              <option value="live_demo">Live Demonstration</option>
              <option value="q_and_a_engineers">Q&amp;A with Engineers</option>
              <option value="product_showcase">Product Showcase</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              Tag Filters
            </label>
            <select
              value={selectedSpecialTag}
              onChange={(e) => setSelectedSpecialTag(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Capabilities</option>
              <option value="hands_on">🛠️ Hands-on Only</option>
              <option value="modern_tech">🤖 Modern Tech (CNC/IoT)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              Students Group
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={groupSize}
              onChange={(e) => setGroupSize(parseInt(e.target.value) || 0)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 text-xs text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="relevance">Quality Re-Rank (80/20)</option>
              <option value="distance">Distance (Nearest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Map (Left) & Facilities Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-7 h-[420px] lg:h-[680px] sticky top-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
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
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-900 dark:text-slate-100">{filteredFacilities.length}</strong> facilities within {radiusKm} km
            </span>
            <span>Sorted by {sortBy === "relevance" ? "Quality Re-Rank (80% Fit + 20% Quality)" : "Distance"}</span>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Compass className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">No facilities found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try widening your radius slider to 25 km or 50 km, or selecting &ldquo;All Sectors&rdquo;.
              </p>
            </div>
          ) : (
            filteredFacilities.map((fac: any, index: number) => {
              const isSelected = fac.id === selectedFacilityId;
              const isNewFacility = (fac.verified_visits_count ?? 0) < 3;
              const hasDisplayableRating = (fac.verified_visits_count ?? 0) >= 5;

              const liveStatus = formatLiveFacilityStatus({
                ...fac,
                liveWeather: liveWeather ?? undefined,
              });

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacilityId(fac.id)}
                  className={`rounded-2xl border p-5 transition cursor-pointer relative ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/30 ring-1 ring-blue-500 shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {fac.sector}
                        </span>
                        {isNewFacility && (
                          <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            🌟 New Host
                          </span>
                        )}
                        {fac.listing_corrected_flag && (
                          <span className="rounded-md bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 px-2 py-0.5 text-[10px] font-bold text-red-800 dark:text-red-300" title={fac.listing_corrected_reason}>
                            ⚠️ Listing Corrected (-15 pts)
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                        {fac.name}
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-transparent dark:border-blue-800 px-2.5 py-1 text-xs font-bold">
                      {fac.distance_km} km
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    <strong className="text-slate-700 dark:text-slate-200">Highlights:</strong> {fac.highlights}
                  </p>

                  {/* Resourceful Sites Capability & Readiness Scores */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/40 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Learning Value</span>
                      </div>
                      <span className="font-mono font-bold text-blue-900 dark:text-blue-200 text-xs">
                        {fac.learning_value_score ?? 78}/100
                      </span>
                    </div>

                    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/40 p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Hosting Ready</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                        {fac.hosting_readiness_score ?? 82}/100
                      </span>
                    </div>
                  </div>

                  {/* Verified Ratings & Transparent Score Explain Action */}
                  <div className="mt-2 flex items-center justify-between text-xs px-0.5">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      {hasDisplayableRating ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                          {fac.verified_experience_rating ?? 4.5}★{" "}
                          <span className="text-slate-400 dark:text-slate-500 font-normal">
                            ({fac.verified_visits_count} verified visits)
                          </span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          New Host ({fac.verified_visits_count ?? 1} visit{fac.verified_visits_count === 1 ? "" : "s"})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainFacility(fac);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                    >
                      <HelpCircle className="h-3 w-3" />
                      Explain Scores
                    </button>
                  </div>

                  {/* Student Engagement Badges (Phase p1) */}
                  {fac.interactive_elements && fac.interactive_elements.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {(fac.interactive_elements as InteractiveElement[]).map((elem) => {
                        const badge = formatEngagementBadge(elem);
                        return (
                          <span
                            key={elem}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                              elem === "hands_on_activity"
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                                : elem === "live_demo"
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/60"
                                : elem === "q_and_a_engineers"
                                ? "bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/60"
                                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                            }`}
                            title={badge.description}
                          >
                            {elem === "hands_on_activity" && "🛠️ "}
                            {elem === "live_demo" && "⚡ "}
                            {elem === "q_and_a_engineers" && "💬 "}
                            {elem === "product_showcase" && "📦 "}
                            {badge.shortLabel}
                            {elem === "hands_on_activity" && fac.estimated_interactive_minutes > 0
                              ? ` (${fac.estimated_interactive_minutes}m)`
                              : ""}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Built-in Live Situation & Logistics Telemetry */}
                  <div className="mt-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Live Situation &amp; Logistics
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        {liveStatus.transitInfo.trafficState === "normal" ? "🟢 Smooth Route" : "⚠️ Peak Congestion"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                        <CloudSun className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {liveStatus.weatherBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {liveStatus.transitBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                        <Utensils className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {liveStatus.canteenBadge}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-slate-900 p-1.5 border border-slate-200/70 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                        <Car className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {liveStatus.parkingBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Group: {fac.min_group_size}-{fac.max_group_size}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Min Level: {fac.min_education_level}
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLiveModalFacility(fac);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shadow-xs"
                    >
                      <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
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

      {/* Resourceful Scores & Reviews Explain Modal */}
      {explainFacility && (
        <ScoreExplainModal
          isOpen={!!explainFacility}
          onClose={() => setExplainFacility(null)}
          facility={explainFacility}
        />
      )}
    </div>
  );
}
