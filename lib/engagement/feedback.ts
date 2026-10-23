/**
 * Anonymous Student Feedback Engine & Anonymity Enforcement (Phase p4)
 * Strict Privacy Guarantees:
 * 1. Zero student accounts, zero student names, zero emails or contact details.
 * 2. Rotating salted IP-hash rate limiting (zero raw IPs stored).
 * 3. Server-enforced anonymity threshold: aggregates and comments remain hidden
 *    until at least 5 responses exist.
 * 4. Content moderation: flagged free-text is held pending admin review.
 * 5. Scope Guard: Student feedback NEVER feeds institution strikes or nearby matching.
 */

import crypto from "crypto";

export interface StudentFeedbackSubmission {
  usefulness_rating: number; // 1 to 5
  engagement_rating: number; // 1 to 5
  most_interesting?: string; // max 300 chars
  suggestion?: string; // max 300 chars
}

export interface StoredFeedbackRecord {
  id: string;
  visit_request_id: string;
  token_hash: string;
  ip_hash: string;
  usefulness_rating: number;
  engagement_rating: number;
  most_interesting?: string;
  suggestion?: string;
  moderation_status: "approved" | "flagged" | "rejected";
  moderation_reason?: string;
  submitted_at: string;
}

export interface FeedbackAggregatesResult {
  anonymityThresholdMet: boolean;
  count: number;
  minRequired: number;
  avgUsefulness?: number;
  avgEngagement?: number;
  highlights?: string[];
  suggestions?: string[];
  pendingModerationCount?: number;
}

// Banned words & abusive patterns for basic automated moderation
export const MODERATION_FLAG_KEYWORDS = [
  "abuse",
  "hate",
  "fake",
  "stupid",
  "scam",
  "idiot",
  "horrible",
  "kill",
  "phone",
  "call me",
  "whatsapp",
];

/**
 * Validates student feedback submission input
 */
export function validateStudentFeedback(
  input: Partial<StudentFeedbackSubmission>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (
    typeof input.usefulness_rating !== "number" ||
    input.usefulness_rating < 1 ||
    input.usefulness_rating > 5
  ) {
    errors.push("usefulness_rating must be an integer between 1 and 5.");
  }

  if (
    typeof input.engagement_rating !== "number" ||
    input.engagement_rating < 1 ||
    input.engagement_rating > 5
  ) {
    errors.push("engagement_rating must be an integer between 1 and 5.");
  }

  if (input.most_interesting && input.most_interesting.length > 300) {
    errors.push("most_interesting text cannot exceed 300 characters.");
  }

  if (input.suggestion && input.suggestion.length > 300) {
    errors.push("suggestion text cannot exceed 300 characters.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Hashes client IP with a server rotating salt (SHA-256)
 * Prevents tracking across days while allowing daily rate-limiting per visit
 */
export function hashClientIp(clientIp: string, dailySalt: string = "visitlink-default-salt"): string {
  if (!clientIp) return "unknown-ip";
  return crypto.createHash("sha256").update(`${clientIp}-${dailySalt}`).digest("hex");
}

/**
 * Basic content moderation scanner
 * Identifies abusive language or accidental phone/email sharing
 */
export function moderateFeedbackText(text?: string): {
  status: "approved" | "flagged";
  reason?: string;
} {
  if (!text || !text.trim()) return { status: "approved" };

  const lower = text.toLowerCase();

  // Check for phone numbers or email patterns
  const phonePattern = /\b\d{10}\b|\+91\d{10}/;
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

  if (phonePattern.test(text) || emailPattern.test(text)) {
    return {
      status: "flagged",
      reason: "Contains personal contact information (phone number or email).",
    };
  }

  for (const kw of MODERATION_FLAG_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        status: "flagged",
        reason: `Contains potentially offensive or flagged keyword ('${kw}').`,
      };
    }
  }

  return { status: "approved" };
}

/**
 * Calculates feedback aggregates with server-enforced anonymity threshold (N >= 5)
 * If responses count < 5, NO averages or student text are exposed.
 */
export function calculateFeedbackAggregates(
  responses: StoredFeedbackRecord[],
  minThreshold: number = 5
): FeedbackAggregatesResult {
  const count = responses.length;

  if (count < minThreshold) {
    return {
      anonymityThresholdMet: false,
      count,
      minRequired: minThreshold,
    };
  }

  const sumUsefulness = responses.reduce((acc, r) => acc + r.usefulness_rating, 0);
  const sumEngagement = responses.reduce((acc, r) => acc + r.engagement_rating, 0);

  const avgUsefulness = Math.round((sumUsefulness / count) * 10) / 10;
  const avgEngagement = Math.round((sumEngagement / count) * 10) / 10;

  // Filter approved highlights and suggestions (exclude flagged/rejected)
  const highlights = responses
    .filter((r) => r.moderation_status === "approved" && r.most_interesting && r.most_interesting.trim().length > 0)
    .map((r) => r.most_interesting!.trim());

  const suggestions = responses
    .filter((r) => r.moderation_status === "approved" && r.suggestion && r.suggestion.trim().length > 0)
    .map((r) => r.suggestion!.trim());

  const pendingModerationCount = responses.filter((r) => r.moderation_status === "flagged").length;

  return {
    anonymityThresholdMet: true,
    count,
    minRequired: minThreshold,
    avgUsefulness,
    avgEngagement,
    highlights,
    suggestions,
    pendingModerationCount,
  };
}

/**
 * Guardrail Enforcement: Verifies that student feedback does not alter institution trust score or strikes
 */
export function assertZeroStrikeContamination(institutionScoreBefore: number, institutionScoreAfter: number): boolean {
  return institutionScoreBefore === institutionScoreAfter;
}
