/**
 * Search Re-Ranking & Exploration Slot Engine (Phase q3)
 *
 * Ranking Architecture:
 * 1. Hard filters applied first (radius, sector, group capacity). Non-matching facilities are excluded.
 * 2. Relevance score computed from query/syllabus matching.
 * 3. Quality score serves as a gentle tiebreaker/re-rank:
 *    Final Score = (1 - qualityWeight) * relevanceScore + qualityWeight * qualityScore
 *    Default: 80% relevance + 20% quality.
 *
 * Exploration Slot:
 * Guarantees that small, newly onboarded facilities (fewer than 3 verified visits) receive visibility
 * by placing a qualified new facility at position #5 in every 10-item result window.
 *
 * STRICT ANTI-BIAS INVARIANTS:
 * - Nearby POI amenities data MUST NOT influence ranking.
 * - Facility age and company size MUST NOT influence ranking.
 * - Re-ranking NEVER alters the membership of filtered results, only order within it.
 */

import { assertNoForbiddenInputs } from "./capabilities";

export interface RankableFacility {
  id: string;
  name: string;
  relevance_score: number; // 0.0 to 1.0
  distance_km: number;
  learning_value_score?: number; // 0 to 100
  hosting_readiness_score?: number; // 0 to 100
  verified_experience_rating?: number; // 1.0 to 5.0 (default 4.5 prior)
  verified_visits_count?: number; // integer (visits completed)
  hands_on_available?: boolean;
  interactive_elements?: string[];
  technology_levels?: string[];
  [key: string]: any;
}

export interface ReRankSettings {
  relevance_weight: number; // default 0.80
  quality_weight: number; // default 0.20
  learning_weight: number; // default 0.40
  hosting_weight: number; // default 0.30
  experience_weight: number; // default 0.30
  new_industry_threshold: number; // default 3 visits
  exploration_slot_interval: number; // default 10
  exploration_slot_position: number; // default 5 (1-based index)
}

export const DEFAULT_RERANK_SETTINGS: ReRankSettings = {
  relevance_weight: 0.80,
  quality_weight: 0.20,
  learning_weight: 0.40,
  hosting_weight: 0.30,
  experience_weight: 0.30,
  new_industry_threshold: 3,
  exploration_slot_interval: 10,
  exploration_slot_position: 5,
};

/**
 * Computes composite quality score normalized to [0, 1]
 */
export function computeQualityScore(
  facility: RankableFacility,
  settings: ReRankSettings = DEFAULT_RERANK_SETTINGS
): number {
  assertNoForbiddenInputs(facility);

  const normLearning = Math.max(0, Math.min(1.0, (facility.learning_value_score || 0) / 100.0));
  const normHosting = Math.max(0, Math.min(1.0, (facility.hosting_readiness_score || 0) / 100.0));
  const normExperience = Math.max(0, Math.min(1.0, (facility.verified_experience_rating || 4.5) / 5.0));

  const quality =
    settings.learning_weight * normLearning +
    settings.hosting_weight * normHosting +
    settings.experience_weight * normExperience;

  return Number(quality.toFixed(4));
}

/**
 * Computes final re-ranked score for a facility
 */
export function computeFinalRankScore(
  facility: RankableFacility,
  settings: ReRankSettings = DEFAULT_RERANK_SETTINGS
): number {
  const quality = computeQualityScore(facility, settings);
  const relevance = Math.max(0, Math.min(1.0, facility.relevance_score || 0));

  const finalScore = settings.relevance_weight * relevance + settings.quality_weight * quality;
  return Number(finalScore.toFixed(4));
}

/**
 * Re-ranks filtered candidate facilities and inserts guaranteed exploration slots for new industries.
 */
export function rerankWithExplorationSlot<T extends RankableFacility>(
  candidates: T[],
  settings: ReRankSettings = DEFAULT_RERANK_SETTINGS
): T[] {
  if (candidates.length <= 1) return candidates;

  // 1. Sort by final score descending (with distance as secondary tiebreaker)
  const scored = candidates.map((fac) => ({
    facility: fac,
    finalScore: computeFinalRankScore(fac, settings),
    isNew: (fac.verified_visits_count ?? 0) < settings.new_industry_threshold,
  }));

  scored.sort((a, b) => {
    if (Math.abs(b.finalScore - a.finalScore) > 0.0001) {
      return b.finalScore - a.finalScore;
    }
    return a.facility.distance_km - b.facility.distance_km;
  });

  const sortedList = scored.map((s) => s.facility);

  // 2. Exploration Slot Insertion
  // For each window of exploration_slot_interval (e.g. 10 items):
  // Ensure that position exploration_slot_position (e.g. 5) has a "new" facility if one exists in the window or later.
  const result: T[] = [...sortedList];
  const targetPos = settings.exploration_slot_position - 1; // 0-based index (e.g. index 4 for slot 5)
  const interval = settings.exploration_slot_interval;

  for (let windowStart = 0; windowStart < result.length; windowStart += interval) {
    const slotIdx = windowStart + targetPos;
    if (slotIdx >= result.length) break;

    // Check if item at slotIdx is already a new industry
    const currentAtSlot = result[slotIdx];
    const isAlreadyNew = (currentAtSlot.verified_visits_count ?? 0) < settings.new_industry_threshold;

    if (!isAlreadyNew) {
      // Find the best-ranked new industry after slotIdx
      const candidateNewIdx = result.findIndex(
        (fac, idx) => idx > slotIdx && (fac.verified_visits_count ?? 0) < settings.new_industry_threshold
      );

      if (candidateNewIdx !== -1) {
        // Move the new facility to slotIdx
        const [promoted] = result.splice(candidateNewIdx, 1);
        result.splice(slotIdx, 0, promoted);
      }
    }
  }

  return result;
}

/**
 * Tag filter helpers (based on declared tags, NOT on scores)
 */
export function matchesHandsOnTag(fac: RankableFacility): boolean {
  return (
    fac.hands_on_available === true ||
    (Array.isArray(fac.interactive_elements) && fac.interactive_elements.includes("hands_on_activity"))
  );
}

export function matchesModernTechnologyTag(fac: RankableFacility): boolean {
  if (!Array.isArray(fac.technology_levels)) return false;
  return (
    fac.technology_levels.includes("cnc") ||
    fac.technology_levels.includes("robotics") ||
    fac.technology_levels.includes("iot_industry_4_0")
  );
}
