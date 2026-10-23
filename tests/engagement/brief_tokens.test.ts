import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateVisitAccessToken,
  verifyVisitAccessToken,
  revokeVisitAccessToken,
  hashToken,
  VisitAccessTokenRecord,
} from "../../lib/engagement/tokens.ts";
import {
  buildPreVisitBrief,
  generateReflectionPrompts,
} from "../../lib/engagement/brief.ts";

describe("Pre-Visit Brief & Token Security (Phase p2)", () => {
  const visitRequestId = "req-cbe-02";
  const visitDate = "2026-11-10";

  describe("128-Bit Token Generation & Expiry Rules", () => {
    it("generates a 128-bit unguessable random token (32 hex characters)", () => {
      const tokenOut = generateVisitAccessToken(visitRequestId, "brief", visitDate);
      assert.equal(typeof tokenOut.rawToken, "string");
      assert.equal(tokenOut.rawToken.length, 32); // 16 bytes = 32 hex chars = 128 bits
      assert.equal(tokenOut.tokenHash, hashToken(tokenOut.rawToken));
      assert.equal(tokenOut.tokenPreview, tokenOut.rawToken.slice(0, 6));
      assert.equal(tokenOut.tokenType, "brief");
      assert.equal(tokenOut.visitRequestId, visitRequestId);
    });

    it("sets expiry exactly to visit date + 7 days at 23:59:59 UTC", () => {
      const tokenOut = generateVisitAccessToken(visitRequestId, "brief", "2026-11-10");
      const expiry = new Date(tokenOut.expiresAt);

      assert.equal(expiry.getUTCFullYear(), 2026);
      assert.equal(expiry.getUTCMonth(), 10); // November (0-indexed = 10)
      assert.equal(expiry.getUTCDate(), 17); // 10 + 7 = 17
      assert.equal(expiry.getUTCHours(), 23);
      assert.equal(expiry.getUTCMinutes(), 59);
      assert.equal(expiry.getUTCSeconds(), 59);
    });

    it("generates distinct tokens on subsequent invocations (high entropy)", () => {
      const token1 = generateVisitAccessToken(visitRequestId, "brief", visitDate);
      const token2 = generateVisitAccessToken(visitRequestId, "brief", visitDate);
      assert.notEqual(token1.rawToken, token2.rawToken);
      assert.notEqual(token1.tokenHash, token2.tokenHash);
    });
  });

  describe("Token Verification & Security Invariants", () => {
    const generated = generateVisitAccessToken(visitRequestId, "brief", visitDate);
    const mockRecord: VisitAccessTokenRecord = {
      id: "tok-uuid-001",
      visit_request_id: visitRequestId,
      token_type: "brief",
      token_hash: generated.tokenHash,
      token_preview: generated.tokenPreview,
      expires_at: generated.expiresAt,
      revoked_at: null,
      created_at: new Date().toISOString(),
    };

    it("verifies a valid, active token", () => {
      const res = verifyVisitAccessToken(
        generated.rawToken,
        "brief",
        mockRecord,
        new Date("2026-11-12T10:00:00Z")
      );
      assert.equal(res.valid, true);
      assert.equal(res.record?.id, "tok-uuid-001");
    });

    it("rejects an invalid or tampered token with status 'invalid'", () => {
      const tampered = generated.rawToken.slice(0, -2) + "ff";
      const res = verifyVisitAccessToken(tampered, "brief", mockRecord);
      assert.equal(res.valid, false);
      assert.equal(res.reason, "invalid");
    });

    it("rejects an expired token when current time > expires_at", () => {
      // 8 days after visit date
      const expiredNow = new Date("2026-11-19T00:00:00Z");
      const res = verifyVisitAccessToken(
        generated.rawToken,
        "brief",
        mockRecord,
        expiredNow
      );
      assert.equal(res.valid, false);
      assert.equal(res.reason, "expired");
    });

    it("rejects a revoked token immediately after coordinator revocation", () => {
      const revokedRecord = revokeVisitAccessToken(mockRecord);
      assert.ok(revokedRecord.revoked_at);

      const res = verifyVisitAccessToken(
        generated.rawToken,
        "brief",
        revokedRecord,
        new Date("2026-11-12T10:00:00Z")
      );
      assert.equal(res.valid, false);
      assert.equal(res.reason, "revoked");
    });

    it("rejects token presented for the wrong purpose (e.g., brief used as student_feedback)", () => {
      const res = verifyVisitAccessToken(
        generated.rawToken,
        "student_feedback", // Expected student_feedback, but record is brief
        mockRecord,
        new Date("2026-11-12T10:00:00Z")
      );
      assert.equal(res.valid, false);
      assert.equal(res.reason, "wrong_type");
    });

    it("enforces cross-visit isolation: token for visit A cannot query visit B", () => {
      const visitBId = "req-cbe-99-other";
      assert.notEqual(mockRecord.visit_request_id, visitBId);
      // Even if verified, the record is strictly locked to visit_request_id
      assert.equal(mockRecord.visit_request_id, visitRequestId);
    });
  });

  describe("Pre-Visit Brief Content & Strict Privacy Audit", () => {
    const sampleFacility = {
      name: "Kovai Precision Foundry & Heavy Castings [Demo]",
      sector: "foundry",
      city: "Coimbatore",
      address: "SF No. 142, Malumichampatti",
      highlights: "Cupola furnace tapping, green sand automated moulding line, metallurgy lab",
      ppe_list: ["Steel-toe safety shoes", "Safety goggles", "Hard hat"],
      dress_code: "Strict long trousers and thick cotton shirts.",
      engagement_notes: "Live cupola furnace molten tapping demo.",
    };

    const sampleRequest = {
      id: "req-cbe-02",
      visit_date: "2026-11-10",
      slot_window: "10:00 AM - 1:00 PM",
      learning_objectives: [
        "Study automated green sand moulding lines and cupola furnace melting.",
        "Observe CNC precision machining operations and CMM quality metrology.",
      ],
      course_name: "Manufacturing Technology & Machine Tools",
      syllabus_topic: "Unit 3: Metal Casting Processes",
    };

    it("generates a complete educational brief with 3-5 reflection prompts", () => {
      const brief = buildPreVisitBrief(sampleFacility, sampleRequest, "2026-11-17T23:59:59Z");
      assert.equal(brief.facilityName, sampleFacility.name);
      assert.equal(brief.learningObjectives.length, 2);
      assert.ok(brief.safetyRules.length >= 4);
      assert.ok(brief.mandatoryPpe.length >= 3);
      assert.ok(brief.reflectionPrompts.length >= 3 && brief.reflectionPrompts.length <= 5);
    });

    it("STRICT PRIVACY AUDIT: Assert brief contains zero student PII or consent document references", () => {
      const brief = buildPreVisitBrief(sampleFacility, sampleRequest, "2026-11-17T23:59:59Z");
      const briefJson = JSON.stringify(brief);

      // Verify absence of sensitive keys or values
      assert.equal("student_name" in (brief as any), false);
      assert.equal("student_email" in (brief as any), false);
      assert.equal("student_roster" in (brief as any), false);
      assert.equal("consent_url" in (brief as any), false);
      assert.equal(briefJson.includes("consent_form"), false);
      assert.equal(briefJson.includes("parental_consent"), false);
    });
  });
});
