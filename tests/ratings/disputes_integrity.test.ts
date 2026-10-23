import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scanReviewContentForPII,
  validateReviewReply,
  resolveReviewDispute,
  detectReviewIntegrityAnomalies,
  calculateUpdatedTrustScoreWithPrivateRatings,
  ReviewDisputeTicket,
} from "../../lib/ratings/disputes.ts";

describe("Review Moderation, Disputes & Integrity Engine (Phases r3-r5)", () => {
  describe("PII & Defamation Content Filter", () => {
    it("flags review text containing personal mobile numbers", () => {
      const result = scanReviewContentForPII(
        "Great foundry walkthrough, contact our coordinator at 9842112345 or +91 9443218920."
      );
      assert.equal(result.isFlagged, true);
      assert.equal(result.detectedType, "phone");
    });

    it("flags review text containing personal email addresses", () => {
      const result = scanReviewContentForPII(
        "Incredible experience! Send the video footage to student.lead@gmail.com please."
      );
      assert.equal(result.isFlagged, true);
      assert.equal(result.detectedType, "email");
    });

    it("flags review text containing abusive or defamatory language", () => {
      const result = scanReviewContentForPII("This plant is a total scam and the engineers are cheaters.");
      assert.equal(result.isFlagged, true);
      assert.equal(result.detectedType, "profanity");
    });

    it("approves genuine technical educational review text", () => {
      const result = scanReviewContentForPII(
        "Students learned the continuous sand casting process, melting operations in the induction furnace, and observed ultrasonic flaw detection testing."
      );
      assert.equal(result.isFlagged, false);
    });
  });

  describe("Industry Public Reply Validation", () => {
    it("rejects empty or whitespace-only reply", () => {
      const result = validateReviewReply({
        review_id: "rev-1",
        industry_profile_id: "prof-1",
        reply_text: "   ",
      });
      assert.equal(result.isValid, false);
      assert.match(result.error!, /Reply text cannot be empty/);
    });

    it("rejects replies exceeding 500 characters", () => {
      const result = validateReviewReply({
        review_id: "rev-1",
        industry_profile_id: "prof-1",
        reply_text: "A".repeat(505),
      });
      assert.equal(result.isValid, false);
      assert.match(result.error!, /cannot exceed 500 characters/);
    });

    it("approves valid constructive industry reply", () => {
      const result = validateReviewReply({
        review_id: "rev-1",
        industry_profile_id: "prof-1",
        reply_text:
          "Thank you for visiting Kovai Foundry! We are delighted that your mechanical engineering batch appreciated the CNC machining demonstration.",
      });
      assert.equal(result.isValid, true);
    });
  });

  describe("Review Dispute Lifecycle & Admin Adjudication", () => {
    const disputeTicket: ReviewDisputeTicket = {
      id: "disp-101",
      review_id: "rev-101",
      disputed_by_role: "industry",
      dispute_reason: "Reviewer claims we did not provide safety helmets, but gate CCTV log shows full PPE distribution.",
      status: "under_review",
      created_at: new Date().toISOString(),
    };

    it("resolves dispute with 'resolved_hidden' and hides review", () => {
      const result = resolveReviewDispute({
        dispute: disputeTicket,
        decision: "resolved_hidden",
        adminReason: "CCTV evidence verified: PPE was distributed to all students. Review contained false factual claims.",
        adminId: "admin-super-01",
      });

      assert.equal(result.updatedDispute.status, "resolved_hidden");
      assert.equal(result.newReviewModerationStatus, "hidden_by_admin");
      assert.match(result.adminAuditNote, /PPE was distributed/);
    });

    it("resolves dispute with 'resolved_kept' and maintains published status", () => {
      const result = resolveReviewDispute({
        dispute: disputeTicket,
        decision: "resolved_kept",
        adminReason: "Review expresses genuine educational opinion on tour pacing; no policy violation.",
        adminId: "admin-super-01",
      });

      assert.equal(result.updatedDispute.status, "resolved_kept");
      assert.equal(result.newReviewModerationStatus, "published");
    });
  });

  describe("Collusion & Retaliation Pattern Detection", () => {
    it("flags institution that submits exclusively 1-star reviews across 3+ visits (retaliation)", () => {
      const result = detectReviewIntegrityAnomalies({
        institutionId: "inst-1",
        industryId: "ind-1",
        historicalReviewsFromInstitution: [
          { overall_rating: 1.0, industry_id: "ind-1" },
          { overall_rating: 1.0, industry_id: "ind-2" },
          { overall_rating: 1.0, industry_id: "ind-3" },
        ],
        pairHistoricalReviews: [],
      });

      assert.equal(result.flags.length, 1);
      assert.equal(result.flags[0].target_type, "retaliation_all_1s");
      assert.equal(result.flags[0].status, "pending_admin_review");
    });

    it("flags institution-industry pair with repeated mutual 5-star reviews (collusion)", () => {
      const result = detectReviewIntegrityAnomalies({
        institutionId: "inst-1",
        industryId: "ind-1",
        historicalReviewsFromInstitution: [
          { overall_rating: 5.0, industry_id: "ind-1" },
          { overall_rating: 5.0, industry_id: "ind-1" },
          { overall_rating: 5.0, industry_id: "ind-1" },
        ],
        pairHistoricalReviews: [
          { overall_rating: 5.0 },
          { overall_rating: 5.0 },
          { overall_rating: 5.0 },
        ],
      });

      const collusionFlag = result.flags.find((f) => f.target_type === "collusion_mutual_5s");
      assert.ok(collusionFlag);
      assert.equal(collusionFlag?.status, "pending_admin_review");
    });
  });

  describe("Institution Trust Score Blending with Private Host Ratings", () => {
    it("blends private industry behavioral ratings into institution trust score", () => {
      const currentTrustScore = 80.0;
      const ratings = [
        { punctuality: 5, discipline: 5, preparedness: 5, headcount_accuracy: 5 }, // 20/20 = 100%
        { punctuality: 4, discipline: 5, preparedness: 4, headcount_accuracy: 5 }, // 18/20 = 90%
      ];

      // Average private score = 95% = 95.0
      // Blended with 30% weight: 0.70 * 80.0 + 0.30 * 95.0 = 56.0 + 28.5 = 84.5
      const result = calculateUpdatedTrustScoreWithPrivateRatings({
        currentTrustScore,
        privateRatings: ratings,
        privateRatingsWeight: 0.30,
      });

      assert.equal(result.privateRatingsComponentScore, 95.0);
      assert.equal(result.updatedTrustScore, 84.5);
      assert.equal(result.ratingsCount, 2);
    });
  });
});
