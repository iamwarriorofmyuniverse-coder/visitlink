/**
 * Trust Score, Tiers, Strikes & Appeals Engine (Phase m3)
 * Implements deterministic trust score calculation, tier transitions,
 * booking gatekeeper enforcement, and human-in-the-loop strike state machine.
 */

export type InstitutionTrustTier = "new" | "verified" | "trusted" | "restricted";

export interface InstitutionMetrics {
  completedVisits: number;
  reportsSubmittedOnTime: number;
  averageEngagementRating: number; // 1.0 to 5.0
  confirmedNotEducationalCount: number;
  noShowCount: number;
  lateCancellationCount: number;
  approvedVisitsCount: number;
}

export interface TrustSettings {
  minCompletedVisitsForScore?: number;
  defaultNewScore?: number;
  weights?: {
    reportSubmissionRate: number;
    engagementRatingAvg: number;
    notEducationalPenalty: number;
    noShowPenalty: number;
    cancellationPenalty: number;
  };
  tierThresholds?: {
    trustedMinScore: number;
    trustedMinVisits: number;
    trustedMaxStrikes: number;
    verifiedMinScore: number;
    verifiedMinVisits: number;
    verifiedMaxStrikes: number;
    restrictedMinStrikes: number;
    restrictedMaxScore: number;
  };
}

export const DEFAULT_TRUST_SETTINGS: TrustSettings = {
  minCompletedVisitsForScore: 3,
  defaultNewScore: 50.0,
  weights: {
    reportSubmissionRate: 0.3,
    engagementRatingAvg: 0.3,
    notEducationalPenalty: 0.2,
    noShowPenalty: 0.15,
    cancellationPenalty: 0.05,
  },
  tierThresholds: {
    trustedMinScore: 85.0,
    trustedMinVisits: 8,
    trustedMaxStrikes: 0,
    verifiedMinScore: 60.0,
    verifiedMinVisits: 3,
    verifiedMaxStrikes: 1,
    restrictedMinStrikes: 3,
    restrictedMaxScore: 30.0,
  },
};

/**
 * Calculates deterministic institution trust score in [0.00, 100.00]
 */
export function calculateTrustScore(
  metrics: InstitutionMetrics,
  settings: TrustSettings = DEFAULT_TRUST_SETTINGS
): number {
  const minVisits = settings.minCompletedVisitsForScore ?? 3;
  if (metrics.completedVisits < minVisits) {
    return settings.defaultNewScore ?? 50.0;
  }

  const weights = {
    ...DEFAULT_TRUST_SETTINGS.weights,
    ...settings.weights,
  };

  const completed = Math.max(1, metrics.completedVisits);
  const approved = Math.max(completed, metrics.approvedVisitsCount);

  // Positive scores (up to 100.0 points total: 50% reports, 50% engagement)
  const reportScore = (metrics.reportsSubmittedOnTime / completed) * 50.0;
  const clampedRating = Math.max(1.0, Math.min(5.0, metrics.averageEngagementRating));
  const engagementScore = ((clampedRating - 1.0) / 4.0) * 50.0;

  // Severe abuse penalties
  // Each confirmed 'not educational' report deducts 25 points
  // Each no-show deducts 20 points
  // Each late cancellation deducts 10 points
  const notEducationalPenalty = metrics.confirmedNotEducationalCount * 25.0;
  const noShowPenalty = metrics.noShowCount * 20.0;
  const cancellationPenalty = metrics.lateCancellationCount * 10.0;

  const rawScore =
    reportScore +
    engagementScore -
    notEducationalPenalty -
    noShowPenalty -
    cancellationPenalty;

  const finalScore = Math.max(0.0, Math.min(100.0, Math.round(rawScore * 10) / 10));
  return finalScore;
}

/**
 * Determines current trust tier based on score, visit history, and active strike count
 */
export function determineTrustTier(
  score: number,
  completedVisits: number,
  activeStrikes: number,
  settings: TrustSettings = DEFAULT_TRUST_SETTINGS
): InstitutionTrustTier {
  const t = {
    ...DEFAULT_TRUST_SETTINGS.tierThresholds,
    ...settings.tierThresholds,
  };

  // Rule 1: 3 active strikes within 12 months -> restricted
  if (activeStrikes >= (t.restrictedMinStrikes ?? 3) || score < (t.restrictedMaxScore ?? 30.0)) {
    return "restricted";
  }

  // Rule 2: Trusted Tier
  if (
    completedVisits >= (t.trustedMinVisits ?? 8) &&
    score >= (t.trustedMinScore ?? 85.0) &&
    activeStrikes <= (t.trustedMaxStrikes ?? 0)
  ) {
    return "trusted";
  }

  // Rule 3: Verified Tier
  if (
    completedVisits >= (t.verifiedMinVisits ?? 3) &&
    score >= (t.verifiedMinScore ?? 60.0) &&
    activeStrikes <= (t.verifiedMaxStrikes ?? 1)
  ) {
    return "verified";
  }

  // Rule 4: New Tier (0-2 visits)
  return "new";
}

export interface InstitutionProfileLite {
  trust_tier: InstitutionTrustTier;
  trust_score: number;
  active_strikes_count: number;
  restriction_reason?: string;
}

/**
 * Gatekeeper checking if an institution is permitted to book an industry
 */
export function canInstitutionBook(
  institution: InstitutionProfileLite,
  facilityMinTier: string = "new",
  pendingRequestsCount: number = 0
): { allowed: boolean; reason?: string } {
  // 1. Restricted institutions are hard-blocked
  if (institution.trust_tier === "restricted") {
    return {
      allowed: false,
      reason: `Institution booking privileges are currently restricted. Reason: ${
        institution.restriction_reason || "Accumulated policy violations."
      } You may file an appeal through the coordinator dashboard.`,
    };
  }

  // 2. New institutions limited to 2 pending requests at a time
  if (institution.trust_tier === "new" && pendingRequestsCount >= 2) {
    return {
      allowed: false,
      reason:
        "New institutions are subject to an anti-abuse limit of 2 pending requests at a time. Complete existing visits to graduate to Verified status.",
    };
  }

  // 3. Facility Minimum Tier Hierarchy check
  const tierRanks: Record<string, number> = {
    new: 1,
    verified: 2,
    trusted: 3,
  };

  const facilityRank = tierRanks[facilityMinTier] || 1;
  const institutionRank = tierRanks[institution.trust_tier] || 1;

  if (institutionRank < facilityRank) {
    return {
      allowed: false,
      reason: `This facility requires '${facilityMinTier}' trust tier (your current tier is '${institution.trust_tier}'). Complete more verified educational visits to qualify.`,
    };
  }

  return { allowed: true };
}

export interface StrikeRecord {
  id: string;
  institution_id: string;
  strike_type: "not_educational" | "no_show" | "fraudulent_intent";
  status:
    | "pending_admin_review"
    | "approved"
    | "rejected"
    | "appealed"
    | "appeal_granted"
    | "appeal_rejected";
  evidence_notes: string;
  created_at: string;
  appeal_reason?: string;
}

export interface UpdatedStrikeResult {
  strikeId: string;
  status: StrikeRecord["status"];
  countsAsActiveStrike: boolean;
  adminNotes?: string;
}

/**
 * Admin initial review of an industry complaint
 */
export function applyAdminStrikeReview(
  strike: StrikeRecord,
  decision: "approve" | "reject",
  adminId: string,
  notes?: string
): UpdatedStrikeResult {
  if (decision === "approve") {
    return {
      strikeId: strike.id,
      status: "approved",
      countsAsActiveStrike: true,
      adminNotes: notes,
    };
  }

  return {
    strikeId: strike.id,
    status: "rejected",
    countsAsActiveStrike: false,
    adminNotes: notes,
  };
}

/**
 * Admin appeal resolution
 */
export function applyAdminAppealReview(
  strike: StrikeRecord,
  decision: "grant" | "deny",
  adminId: string,
  notes?: string
): UpdatedStrikeResult {
  if (decision === "grant") {
    return {
      strikeId: strike.id,
      status: "appeal_granted",
      countsAsActiveStrike: false,
      adminNotes: notes,
    };
  }

  return {
    strikeId: strike.id,
    status: "appeal_rejected",
    countsAsActiveStrike: true,
    adminNotes: notes,
  };
}
