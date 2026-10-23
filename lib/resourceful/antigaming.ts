/**
 * Anti-Gaming, Contradicted Claims & Audit Trail Engine (Phase q4)
 *
 * Anti-Gaming Rules:
 * 1. Industries cannot buy or request boosts. Zero paid placements.
 * 2. Claims contradicted by post-visit coordinator reports ("facility did not match listing")
 *    trigger admin review. Only confirmed mismatches trigger a score penalty and a "Listing corrected" note.
 * 3. Expired certificates automatically lose verified points upon reaching expiry date.
 * 4. Full audit trail of all score changes is maintained in site_score_audit_log.
 */

import { IndustryCapabilities, IndustryCertification } from "./capabilities";
import { calculateLearningValueScore, calculateHostingReadinessScore } from "./scoring";

export interface ScoreAuditRecord {
  id: string;
  industry_id: string;
  previous_learning_score: number;
  new_learning_score: number;
  previous_hosting_score: number;
  new_hosting_score: number;
  trigger_reason:
    | "capability_update"
    | "admin_verification"
    | "contradicted_claim_penalty"
    | "cert_expiry"
    | "admin_override";
  changed_by?: string;
  created_at: string;
}

export interface ContradictedClaimTicket {
  id: string;
  industry_id: string;
  visit_request_id: string;
  coordinator_id: string;
  mismatch_details: string;
  evidence_notes?: string;
  status: "pending_admin_review" | "confirmed_sanctioned" | "dismissed_unfounded";
  admin_decision_reason?: string;
  created_at: string;
  resolved_at?: string;
}

/**
 * Evaluates certificate expiration and strips unearned points
 */
export function purgeExpiredCertifications(
  certs: IndustryCertification[],
  currentDate = new Date()
): { activeCerts: IndustryCertification[]; expiredCount: number } {
  let expiredCount = 0;
  const activeCerts = certs.map((c) => {
    if (c.expiry_date && new Date(c.expiry_date) < currentDate) {
      expiredCount++;
      return {
        ...c,
        admin_verification_status: "rejected" as const,
        rejection_reason: `Certificate expired on ${c.expiry_date}.`,
      };
    }
    return c;
  });

  return { activeCerts, expiredCount };
}

/**
 * Applies admin decision on a contradicted claim report
 */
export function resolveContradictedClaim(params: {
  ticket: ContradictedClaimTicket;
  currentCapabilities: IndustryCapabilities;
  adminApproved: boolean;
  adminReason: string;
  adminId: string;
}): {
  updatedCapabilities: IndustryCapabilities;
  updatedTicket: ContradictedClaimTicket;
  auditRecord: ScoreAuditRecord;
} {
  const prevLearning = calculateLearningValueScore(params.currentCapabilities).score;
  const prevHosting = calculateHostingReadinessScore(params.currentCapabilities).score;

  let updatedCapabilities = { ...params.currentCapabilities };

  if (params.adminApproved) {
    // Admin confirmed the coordinator's report of listing inaccuracy
    updatedCapabilities.listing_corrected_flag = true;
    updatedCapabilities.listing_corrected_reason = params.adminReason;
  }

  const newLearning = calculateLearningValueScore(updatedCapabilities).score;
  const newHosting = calculateHostingReadinessScore(updatedCapabilities).score;

  const updatedTicket: ContradictedClaimTicket = {
    ...params.ticket,
    status: params.adminApproved ? "confirmed_sanctioned" : "dismissed_unfounded",
    admin_decision_reason: params.adminReason,
    resolved_at: new Date().toISOString(),
  };

  const auditRecord: ScoreAuditRecord = {
    id: `audit-${Date.now()}`,
    industry_id: params.ticket.industry_id,
    previous_learning_score: prevLearning,
    new_learning_score: newLearning,
    previous_hosting_score: prevHosting,
    new_hosting_score: newHosting,
    trigger_reason: params.adminApproved ? "contradicted_claim_penalty" : "admin_override",
    changed_by: params.adminId,
    created_at: new Date().toISOString(),
  };

  return {
    updatedCapabilities,
    updatedTicket,
    auditRecord,
  };
}
