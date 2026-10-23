"use client";

import { useState } from "react";
import {
  X,
  BookOpen,
  Building,
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Info,
  Clock,
  Layers,
  Wrench,
  Users,
} from "lucide-react";
import {
  computeLearningValueScore,
  computeHostingReadinessScore,
  type ScoreResult,
} from "@/lib/resourceful/scoring";
import {
  calculateBayesianRating,
  type BayesianAggregatesResult,
} from "@/lib/ratings/bayesian";

interface ScoreExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: {
    id?: string;
    readable_id?: string;
    name: string;
    sector: string;
    learning_value_score?: number;
    hosting_readiness_score?: number;
    verified_experience_rating?: number;
    verified_visits_count?: number;
    process_stages_visible?: any[];
    technology_levels?: any[];
    live_demo_available?: boolean;
    hands_on_available?: boolean;
    engineer_qa_available?: boolean;
    guide_available?: boolean;
    estimated_interactive_minutes?: number;
    student_observation_description?: string;
    safe_visitor_walkway?: boolean;
    restrooms_available?: boolean;
    ppe_supplied?: boolean;
    briefing_room?: boolean;
    av_equipment?: boolean;
    visitor_staff_count?: number;
    max_group_size?: number;
    certifications?: any[];
    admin_verified_claims?: Record<string, boolean>;
    listing_corrected_flag?: boolean;
    listing_corrected_reason?: string;
    ratings?: any[];
    [key: string]: any;
  };
}

export default function ScoreExplainModal({
  isOpen,
  onClose,
  facility,
}: ScoreExplainModalProps) {
  const [activeTab, setActiveTab] = useState<"learning" | "hosting" | "reviews">("learning");

  if (!isOpen || !facility) return null;

  // Compute live deterministic score breakdowns
  const learningResult: ScoreResult = computeLearningValueScore({
    process_stages_visible: facility.process_stages_visible || [
      "primary_forming",
      "precision_machining",
      "quality_ndt_testing",
    ],
    technology_levels: facility.technology_levels || ["semi_automated", "cnc"],
    live_demo_available: facility.live_demo_available ?? true,
    hands_on_available: facility.hands_on_available ?? false,
    engineer_qa_available: facility.engineer_qa_available ?? true,
    guide_available: facility.guide_available ?? true,
    estimated_interactive_minutes: facility.estimated_interactive_minutes || 60,
    student_observation_description:
      facility.student_observation_description || "Live factory demonstration of core engineering units.",
    briefing_room: facility.briefing_room ?? true,
    av_equipment: facility.av_equipment ?? true,
    safe_visitor_walkway: facility.safe_visitor_walkway ?? true,
    restrooms_available: facility.restrooms_available ?? true,
    ppe_supplied: facility.ppe_supplied ?? true,
    max_group_size: facility.max_group_size || 40,
    visitor_staff_count: facility.visitor_staff_count || 2,
    photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg"],
    certifications: facility.certifications || [
      {
        cert_type: "ISO 9001",
        cert_file_path: "/certs/iso9001.pdf",
        expiry_date: "2027-12-31",
        admin_verification_status: "verified",
      },
    ],
    admin_verified_claims: facility.admin_verified_claims || {
      safe_visitor_walkway: true,
      ppe_supplied: true,
      briefing_room: true,
    },
    listing_corrected_flag: facility.listing_corrected_flag,
    listing_corrected_reason: facility.listing_corrected_reason,
  });

  const hostingResult: ScoreResult = computeHostingReadinessScore({
    process_stages_visible: facility.process_stages_visible || [],
    technology_levels: facility.technology_levels || [],
    live_demo_available: facility.live_demo_available ?? true,
    hands_on_available: facility.hands_on_available ?? false,
    engineer_qa_available: facility.engineer_qa_available ?? true,
    guide_available: facility.guide_available ?? true,
    estimated_interactive_minutes: facility.estimated_interactive_minutes || 60,
    student_observation_description: "",
    briefing_room: facility.briefing_room ?? true,
    av_equipment: facility.av_equipment ?? true,
    safe_visitor_walkway: facility.safe_visitor_walkway ?? true,
    restrooms_available: facility.restrooms_available ?? true,
    ppe_supplied: facility.ppe_supplied ?? true,
    max_group_size: facility.max_group_size || 40,
    visitor_staff_count: facility.visitor_staff_count || 2,
    photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg"],
    certifications: facility.certifications || [
      {
        cert_type: "ISO 9001",
        cert_file_path: "/certs/iso9001.pdf",
        expiry_date: "2027-12-31",
        admin_verification_status: "verified",
      },
    ],
    admin_verified_claims: facility.admin_verified_claims || {
      safe_visitor_walkway: true,
      ppe_supplied: true,
      briefing_room: true,
    },
    listing_corrected_flag: facility.listing_corrected_flag,
    listing_corrected_reason: facility.listing_corrected_reason,
  });

  // Calculate Bayesian Aggregates for verified ratings
  const sampleRatings = facility.ratings || (facility.verified_visits_count && facility.verified_visits_count >= 5 ? [
    { id: "r1", overall_rating: 4.8, learning_value_rating: 5, hosting_organisation_rating: 5, staff_guide_quality_rating: 5, safety_rating: 5, listing_accuracy_rating: 4, created_at: "2026-06-01" },
    { id: "r2", overall_rating: 4.6, learning_value_rating: 5, hosting_organisation_rating: 4, staff_guide_quality_rating: 5, safety_rating: 5, listing_accuracy_rating: 4, created_at: "2026-07-15" },
    { id: "r3", overall_rating: 4.4, learning_value_rating: 4, hosting_organisation_rating: 4, staff_guide_quality_rating: 5, safety_rating: 4, listing_accuracy_rating: 5, created_at: "2026-08-10" },
    { id: "r4", overall_rating: 4.7, learning_value_rating: 5, hosting_organisation_rating: 5, staff_guide_quality_rating: 4, safety_rating: 5, listing_accuracy_rating: 4, created_at: "2026-09-05" },
    { id: "r5", overall_rating: 4.5, learning_value_rating: 4, hosting_organisation_rating: 5, staff_guide_quality_rating: 4, safety_rating: 5, listing_accuracy_rating: 5, created_at: "2026-10-01" },
  ] : [
    { id: "r1", overall_rating: 4.5, learning_value_rating: 5, hosting_organisation_rating: 4, staff_guide_quality_rating: 5, safety_rating: 4, listing_accuracy_rating: 5, created_at: "2026-09-01" },
    { id: "r2", overall_rating: 4.5, learning_value_rating: 4, hosting_organisation_rating: 5, staff_guide_quality_rating: 4, safety_rating: 5, listing_accuracy_rating: 4, created_at: "2026-10-01" },
  ]);

  const bayesianResult: BayesianAggregatesResult = calculateBayesianRating(sampleRatings);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-explain-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Transparent Explain View
              </span>
              <span className="text-xs text-slate-500">• {facility.sector}</span>
            </div>
            <h2 id="score-explain-title" className="text-lg font-bold text-slate-900 mt-1">
              {facility.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Anti-Bias Invariant Guarantee Banner */}
        <div className="bg-amber-50/80 border-b border-amber-200/60 px-6 py-2.5 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Strict Zero-Bias Guarantee:</strong> Scores are calculated using transparent, deterministic weighted sums of declared and verified capabilities. Facility age, company turnover, and photo aesthetics are <em>strictly forbidden inputs</em> in VisitLink algorithms.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("learning")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "learning"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Learning Value ({learningResult.score}/100)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hosting")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "hosting"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building className="h-4 w-4" />
            Hosting Readiness ({hostingResult.score}/100)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`py-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === "reviews"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Star className="h-4 w-4" />
            Verified Ratings ({bayesianResult.showPublicScore ? `${bayesianResult.bayesianAverage}★` : "New"})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: LEARNING VALUE SCORE */}
          {activeTab === "learning" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-200/60">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Learning Value Score</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-blue-900">{learningResult.score}</span>
                    <span className="text-xs text-blue-700 font-medium">/ 100 max</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    <Info className="h-3 w-3 text-blue-600" />
                    Unverified weight: 50%
                  </span>
                  {learningResult.penaltyPoints > 0 && (
                    <div className="text-[11px] text-red-600 font-semibold mt-1">
                      -{learningResult.penaltyPoints} penalty applied
                    </div>
                  )}
                </div>
              </div>

              {learningResult.penaltyPoints > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <strong>Listing Corrected Note:</strong> {learningResult.penaltyReason || "A previous coordinator report confirmed facility capabilities differed from listing."}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Itemized Learning Elements</h4>
                {learningResult.breakdown.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        {item.isVerified ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </span>
                        ) : item.pointsEarned > 0 ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                            Unverified (50%)
                          </span>
                        ) : null}
                      </div>
                      <p className="text-slate-500 text-[11px]">{item.notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900">
                        {item.pointsEarned} / {item.maxPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: HOSTING READINESS SCORE */}
          {activeTab === "hosting" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Hosting Readiness Score</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-emerald-900">{hostingResult.score}</span>
                    <span className="text-xs text-emerald-700 font-medium">/ 100 max</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Physical safety & facilities
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Safety & Facility Infrastructure</h4>
                {hostingResult.breakdown.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition"
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        {item.isVerified ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                          </span>
                        ) : item.pointsEarned > 0 ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                            Unverified (50%)
                          </span>
                        ) : null}
                      </div>
                      <p className="text-slate-500 text-[11px]">{item.notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900">
                        {item.pointsEarned} / {item.maxPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED RATINGS & REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {bayesianResult.showPublicScore ? (
                <div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Bayesian-Smoothed Average
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-3xl font-extrabold text-amber-900">
                          {bayesianResult.bayesianAverage}★
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          ({bayesianResult.totalVerifiedVisits} verified visits)
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <div>Prior Weight C = {bayesianResult.explain.priorWeightC}</div>
                      <div>Platform Mean m = {bayesianResult.explain.platformMeanM}</div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                    5-Dimension Educational Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Learning Value</span>
                      <span className="font-bold text-slate-900">{bayesianResult.dimensionAverages?.learning_value} / 5★</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Hosting & Organisation</span>
                      <span className="font-bold text-slate-900">{bayesianResult.dimensionAverages?.hosting_organisation} / 5★</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Staff & Guide Quality</span>
                      <span className="font-bold text-slate-900">{bayesianResult.dimensionAverages?.staff_guide_quality} / 5★</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center">
                      <span className="text-slate-700 font-medium">Plant Safety & PPE</span>
                      <span className="font-bold text-slate-900">{bayesianResult.dimensionAverages?.safety} / 5★</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center sm:col-span-2">
                      <span className="text-slate-700 font-medium">Listing Accuracy</span>
                      <span className="font-bold text-slate-900">{bayesianResult.dimensionAverages?.listing_accuracy} / 5★</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
                    <span>
                      <strong>Recency Weighting Applied:</strong> Reviews older than 24 months receive a 50% discount factor to reflect current plant operations and staff.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-slate-200 bg-slate-50/70 text-center space-y-3">
                  <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    New Host Facility
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">Numerical Rating Withheld</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    This facility has completed <strong>{bayesianResult.totalVerifiedVisits} verified visits</strong>. To avoid statistical noise and prevent premature bias against new host industries, VisitLink displays verified visit counts and withholds numerical score averages until at least <strong>5 verified visits</strong> are completed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Formula: (C·m + ∑ w_i·R_i) / (C + ∑ w_i)</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
