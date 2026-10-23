/**
 * Bayesian Rating Aggregation & Recency Engine (Phase r2)
 *
 * Mathematical Properties:
 * 1. Bayesian Smoothing:
 *    R_bayesian = (C * m + sum(w_i * R_i)) / (C + sum(w_i))
 *    - C: Prior weight constant (default 5.0)
 *    - m: Platform-wide historical mean (default 4.5)
 *    - w_i: Recency weight (1.0 for <= 24 months, 0.50 for > 24 months)
 *
 * 2. Anonymity & Noise Threshold:
 *    - If n < 5 verified visits: Numerical score is hidden publicly; displays "N verified visits" and "New" badge.
 *    - If n >= 5 verified visits: Displays smoothed Bayesian average, per-dimension breakdown, and star distribution.
 *
 * 3. Transparent Explain View:
 *    - Exposes exact inputs (C, m, n, effective weighted sum) to coordinators and industry managers.
 */

export interface RatingRecord {
  id: string;
  overall_rating: number; // 1.0 to 5.0
  learning_value_rating: number;
  hosting_organisation_rating: number;
  staff_guide_quality_rating: number;
  safety_rating: number;
  listing_accuracy_rating: number;
  created_at: string; // ISO date
}

export interface BayesianSettings {
  prior_weight_c: number; // default 5.0
  platform_mean_m: number; // default 4.5
  recency_cutoff_months: number; // default 24
  recency_decay_factor: number; // default 0.50
  min_verified_visits_for_display: number; // default 5
}

export const DEFAULT_BAYESIAN_SETTINGS: BayesianSettings = {
  prior_weight_c: 5.0,
  platform_mean_m: 4.5,
  recency_cutoff_months: 24,
  recency_decay_factor: 0.50,
  min_verified_visits_for_display: 5,
};

export interface BayesianAggregatesResult {
  showPublicScore: boolean;
  isNewBadge: boolean;
  totalVerifiedVisits: number;
  minRequiredForDisplay: number;
  bayesianAverage?: number; // e.g. 4.68
  rawArithmeticAverage?: number; // e.g. 4.80
  dimensionAverages?: {
    learning_value: number;
    hosting_organisation: number;
    staff_guide_quality: number;
    safety: number;
    listing_accuracy: number;
  };
  starDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  explain: {
    priorWeightC: number;
    platformMeanM: number;
    totalRatingsCount: number;
    effectiveWeightSum: number;
    olderDiscountedCount: number;
    formula: string;
  };
}

/**
 * Computes months between two dates
 */
export function getMonthsDifference(d1: Date, d2: Date): number {
  return Math.max(0, (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth()));
}

/**
 * Calculates Bayesian smoothed rating with recency decay
 */
export function calculateBayesianRating(
  ratings: RatingRecord[],
  currentDate = new Date(),
  customSettings: Partial<BayesianSettings> = {}
): BayesianAggregatesResult {
  const settings: BayesianSettings = { ...DEFAULT_BAYESIAN_SETTINGS, ...customSettings };
  const n = ratings.length;
  const threshold = settings.min_verified_visits_for_display;

  let weightedSum = 0;
  let effectiveWeightSum = 0;
  let olderDiscountedCount = 0;

  const dimSums = {
    learning_value: 0,
    hosting_organisation: 0,
    staff_guide_quality: 0,
    safety: 0,
    listing_accuracy: 0,
  };

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (const r of ratings) {
    const ratingDate = new Date(r.created_at);
    const monthsAgo = getMonthsDifference(currentDate, ratingDate);
    const weight = monthsAgo > settings.recency_cutoff_months ? settings.recency_decay_factor : 1.0;

    if (weight < 1.0) olderDiscountedCount++;

    weightedSum += weight * r.overall_rating;
    effectiveWeightSum += weight;

    // Dimension breakdown sums
    dimSums.learning_value += r.learning_value_rating;
    dimSums.hosting_organisation += r.hosting_organisation_rating;
    dimSums.staff_guide_quality += r.staff_guide_quality_rating;
    dimSums.safety += r.safety_rating;
    dimSums.listing_accuracy += r.listing_accuracy_rating;

    // Rounded star distribution
    const rounded = Math.max(1, Math.min(5, Math.round(r.overall_rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[rounded] = (distribution[rounded] || 0) + 1;
  }

  const C = settings.prior_weight_c;
  const m = settings.platform_mean_m;
  const bayesianAverage = Number(((C * m + weightedSum) / (C + effectiveWeightSum)).toFixed(2));
  const rawArithmeticAverage = n > 0 ? Number((ratings.reduce((acc, r) => acc + r.overall_rating, 0) / n).toFixed(2)) : undefined;

  const showPublicScore = n >= threshold;
  const isNewBadge = n < threshold;

  const explain = {
    priorWeightC: C,
    platformMeanM: m,
    totalRatingsCount: n,
    effectiveWeightSum: Number(effectiveWeightSum.toFixed(2)),
    olderDiscountedCount,
    formula: `(${C} × ${m} + ∑(w_i × R_i)) / (${C} + ∑w_i)`,
  };

  if (!showPublicScore) {
    return {
      showPublicScore: false,
      isNewBadge: true,
      totalVerifiedVisits: n,
      minRequiredForDisplay: threshold,
      explain,
    };
  }

  return {
    showPublicScore: true,
    isNewBadge: false,
    totalVerifiedVisits: n,
    minRequiredForDisplay: threshold,
    bayesianAverage,
    rawArithmeticAverage,
    dimensionAverages: {
      learning_value: Number((dimSums.learning_value / n).toFixed(2)),
      hosting_organisation: Number((dimSums.hosting_organisation / n).toFixed(2)),
      staff_guide_quality: Number((dimSums.staff_guide_quality / n).toFixed(2)),
      safety: Number((dimSums.safety / n).toFixed(2)),
      listing_accuracy: Number((dimSums.listing_accuracy / n).toFixed(2)),
    },
    starDistribution: distribution,
    explain,
  };
}
