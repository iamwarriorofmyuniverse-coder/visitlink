/**
 * Unguessable, Expiring, Revocable Token Management (Phase p2 & p4)
 * Generates 128-bit cryptographically secure tokens for pre-visit briefs
 * and anonymous student feedback links.
 */

import crypto from "crypto";

export type VisitTokenType = "brief" | "student_feedback";

export interface VisitAccessTokenRecord {
  id: string;
  visit_request_id: string;
  token_type: VisitTokenType;
  token_hash: string;
  token_preview: string;
  expires_at: string; // ISO 8601
  revoked_at?: string | null;
  created_at: string;
}

export interface GeneratedTokenOutput {
  rawToken: string;
  tokenHash: string;
  tokenPreview: string;
  expiresAt: string;
  tokenType: VisitTokenType;
  visitRequestId: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  reason?: "invalid" | "expired" | "revoked" | "wrong_type";
  record?: VisitAccessTokenRecord;
}

/**
 * Generates a 128-bit cryptographically secure random token with SHA-256 hash
 * Expiry default: visit date + 7 days at 23:59:59 UTC
 */
export function generateVisitAccessToken(
  visitRequestId: string,
  tokenType: VisitTokenType,
  visitDate: string | Date
): GeneratedTokenOutput {
  if (!visitRequestId) {
    throw new Error("visitRequestId is required to generate access token");
  }

  // 128 bits = 16 bytes = 32 hex chars
  const rawToken = crypto.randomBytes(16).toString("hex");
  const tokenHash = hashToken(rawToken);
  const tokenPreview = rawToken.slice(0, 6);

  // Compute expiry: visit date + 7 days
  const baseDate = typeof visitDate === "string" ? new Date(visitDate) : new Date(visitDate.getTime());
  const expiryDate = new Date(baseDate.getTime());
  expiryDate.setUTCDate(expiryDate.getUTCDate() + 7);
  expiryDate.setUTCHours(23, 59, 59, 999);

  return {
    rawToken,
    tokenHash,
    tokenPreview,
    expiresAt: expiryDate.toISOString(),
    tokenType,
    visitRequestId,
  };
}

/**
 * Computes deterministic SHA-256 hash of plain token
 */
export function hashToken(rawToken: string): string {
  if (!rawToken || typeof rawToken !== "string") return "";
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

/**
 * Verifies raw token against stored record using timing-safe comparison
 */
export function verifyVisitAccessToken(
  rawToken: string,
  expectedType: VisitTokenType,
  record?: VisitAccessTokenRecord | null,
  referenceNow: Date = new Date()
): TokenVerificationResult {
  if (!rawToken || !record || !record.token_hash) {
    return { valid: false, reason: "invalid" };
  }

  // 1. Timing-safe hash comparison
  const incomingHash = hashToken(rawToken);
  if (incomingHash.length !== record.token_hash.length) {
    return { valid: false, reason: "invalid" };
  }

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(incomingHash, "utf-8"),
    Buffer.from(record.token_hash, "utf-8")
  );

  if (!isMatch) {
    return { valid: false, reason: "invalid" };
  }

  // 2. Token Type Check
  if (record.token_type !== expectedType) {
    return { valid: false, reason: "wrong_type" };
  }

  // 3. Revocation Check
  if (record.revoked_at) {
    return { valid: false, reason: "revoked" };
  }

  // 4. Expiry Check
  const expiry = new Date(record.expires_at);
  if (referenceNow.getTime() > expiry.getTime()) {
    return { valid: false, reason: "expired" };
  }

  return {
    valid: true,
    record,
  };
}

/**
 * Revokes an access token (sets revoked_at timestamp)
 */
export function revokeVisitAccessToken(
  record: VisitAccessTokenRecord
): VisitAccessTokenRecord {
  return {
    ...record,
    revoked_at: new Date().toISOString(),
  };
}
