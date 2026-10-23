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
  Building2,
  Star,
  HelpCircle,
  Wrench,
  Zap,
  MessageSquare,
  Package,
  ChevronDown,
  Navigation,
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
    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-3xl text-slate-400 dark:text-slate-500 text-sm font-medium animate-pulse">
      <div className="flex items-center gap-2">
        <Compass className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
        Loading Coimbatore Map...
      </div>
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
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="container mx-auto px-4 py-8 sm:px-6 max-w-7xl">
        {/* Page Hero & Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Coimbatore Industrial Hub · Real-Time PostGIS Radius
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
              <Compass className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              Discover Facilities in Coimbatore Hub
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Curriculum-aligned industrial learning plants vetted for safety, student engagement, and host readiness.
            </p>
          </div>

          {/* Syllabus Search Bar */}
          <div className="w-full md:w-96 relative">
            <input
              type="text"
              value={semanticQuery}
              onChange={(e) => {
                setSemanticQuery(e.target.value);
                if (e.target.value.trim()) setSortBy("relevance");
              }}
              placeholder="Search syllabus: e.g. CNC, casting, robotics..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
            {semanticQuery && (
              <button
                type="button"
                onClick={() => setSemanticQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Modern Filter Card */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-xs backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            {/* Radius Segmented Pills */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Radius: {radiusKm} km
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">PostGIS origin</span>
              </div>
              <div className="inline-flex w-full p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                {[5, 10, 25, 50].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRadiusKm(r)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      radiusKm === r
                        ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            {/* Sector Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Sector
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
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

            {/* Engagement Dropdown */}
            <div>
              <label htmlFor="engagementFilter" className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Engagement
              </label>
              <select
                id="engagementFilter"
                value={selectedEngagement}
                onChange={(e) => setSelectedEngagement(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              >
                <option value="all">All Engagement</option>
                <option value="hands_on_activity">Hands-on Activity</option>
                <option value="live_demo">Live Demonstration</option>
                <option value="q_and_a_engineers">Q&amp;A with Engineers</option>
                <option value="product_showcase">Product Showcase</option>
              </select>
            </div>

            {/* Special Tag Filters */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Special Tags
              </label>
              <select
                value={selectedSpecialTag}
                onChange={(e) => setSelectedSpecialTag(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              >
                <option value="all">All Capabilities</option>
                <option value="hands_on">Hands-on Workshops</option>
                <option value="modern_tech">Modern Tech (CNC/Robotics)</option>
              </select>
            </div>

            {/* Students Group & Sort Order */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Group
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Sort
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 px-2 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                >
                  <option value="relevance">Quality Re-Rank</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Leaflet Map (Left) & Facilities Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Leaflet Map Column */}
          <div className="lg:col-span-7 h-[440px] lg:h-[720px] sticky top-6 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800/90 shadow-sm bg-white dark:bg-slate-900">
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
          <div className="lg:col-span-5 space-y-4 max-h-[720px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 py-0.5">
              <span>
                Showing <strong className="text-slate-900 dark:text-slate-100 font-semibold">{filteredFacilities.length}</strong> facilities within {radiusKm} km
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {sortBy === "relevance" ? "80% Curriculum + 20% Quality" : "Nearest First"}
              </span>
            </div>

            {filteredFacilities.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <Compass className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">No facilities found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Try widening your radius to 25 km or 50 km, or clearing specific engagement filters.
                </p>
              </div>
            ) : (
              filteredFacilities.map((fac: any) => {
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
                    className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/15 dark:bg-blue-950/25 ring-2 ring-blue-500/30 shadow-md"
                        : "border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Header: Sector & Badges (Left) + Distance (Right) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {fac.sector}
                        </span>
                        {isNewFacility && (
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            New Host
                          </span>
                        )}
                        {fac.listing_corrected_flag && (
                          <span
                            className="rounded-md bg-red-50 dark:bg-red-950/40 border border-red-300/60 dark:border-red-800/60 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-400"
                            title={fac.listing_corrected_reason}
                          >
                            Listing Corrected (-15 pts)
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                        <Navigation className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        {fac.distance_km} km
                      </span>
                    </div>

                    {/* Facility Title & Summary */}
                    <div className="mt-2.5">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {fac.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-700 dark:text-slate-300 font-medium">Highlights: </strong>
                        {fac.highlights}
                      </p>
                    </div>

                    {/* Resourceful Sites Score Badges (Learning Value & Hosting Ready) */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <BookOpen className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px] leading-tight">
                              Learning Value
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Curriculum Fit</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-xs">
                          {fac.learning_value_score ?? 78}/100
                        </span>
                      </div>

                      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px] leading-tight">
                              Hosting Ready
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Verified Safety</span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                          {fac.hosting_readiness_score ?? 82}/100
                        </span>
                      </div>
                    </div>

                    {/* Verified Experience Rating & Explain Link */}
                    <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        {hasDisplayableRating ? (
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {fac.verified_experience_rating ?? 4.5}★{" "}
                            <span className="text-slate-400 dark:text-slate-500 font-normal">
                              ({fac.verified_visits_count} verified visits)
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Explain Scores
                      </button>
                    </div>

                    {/* Student Engagement Badges (Hands-on, Live Demo, Q&A) */}
                    {fac.interactive_elements && fac.interactive_elements.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {(fac.interactive_elements as InteractiveElement[]).map((elem) => {
                          const badge = formatEngagementBadge(elem);
                          return (
                            <span
                              key={elem}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                              title={badge.description}
                            >
                              {elem === "hands_on_activity" && <Wrench className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                              {elem === "live_demo" && <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />}
                              {elem === "q_and_a_engineers" && <MessageSquare className="h-3 w-3 text-purple-600 dark:text-purple-400" />}
                              {elem === "product_showcase" && <Package className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
                              <span>{badge.shortLabel}</span>
                              {elem === "hands_on_activity" && fac.estimated_interactive_minutes > 0
                                ? ` (${fac.estimated_interactive_minutes}m)`
                                : ""}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Integrated Live Situation & Logistics Banner */}
                    <div className="mt-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-800/30 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            Live Situation &amp; Logistics
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {liveStatus.transitInfo.trafficState === "normal" ? "Smooth Route" : "Peak Traffic"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <div className="rounded-lg bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                          <CloudSun className="h-3 w-3 text-sky-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {liveStatus.weatherBadge}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                          <Clock className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {liveStatus.transitBadge}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                          <Utensils className="h-3 w-3 text-amber-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {liveStatus.canteenBadge}
                          </span>
                        </div>
                        <div className="rounded-lg bg-white dark:bg-slate-900 px-2 py-1 border border-slate-200/50 dark:border-slate-800 flex items-center gap-1.5 shadow-2xs">
                          <Car className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                            {liveStatus.parkingBadge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Footer: Capacity & Minimum Level */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {fac.min_group_size}-{fac.max_group_size} students
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                          {fac.min_education_level}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLiveModalFacility(fac);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Radio className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        Live Situation
                      </button>

                      <Link
                        href={`/coordinator/book/${fac.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 dark:bg-blue-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Request Visit
                        <ArrowRight className="h-3.5 w-3.5" />
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
    </div>
  );
}
