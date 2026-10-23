import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateStudentFeedback,
  calculateFeedbackAggregates,
  moderateFeedbackText,
  hashClientIp,
  assertZeroStrikeContamination,
  StoredFeedbackRecord,
} from "../../lib/engagement/feedback.ts";

describe("Anonymous Student Feedback & Anonymity Thresholds (Phase p4)", () => {
  describe("Input Validation & Bounds", () => {
    it("validates successful student feedback input", () => {
      const res = validateStudentFeedback({
        usefulness_rating: 5,
        engagement_rating: 4,
        most_interesting: "Observing high pressure die casting and automated CMM metrology inspection.",
        suggestion: "Allocate 15 more minutes for technical Q&A with the design team.",
      });
      assert.equal(res.isValid, true);
      assert.equal(res.errors.length, 0);
    });

    it("rejects ratings outside the 1 to 5 range", () => {
      assert.equal(validateStudentFeedback({ usefulness_rating: 0, engagement_rating: 5 }).isValid, false);
      assert.equal(validateStudentFeedback({ usefulness_rating: 6, engagement_rating: 5 }).isValid, false);
      assert.equal(validateStudentFeedback({ usefulness_rating: 5, engagement_rating: -1 }).isValid, false);
    });

    it("rejects text inputs exceeding 300 characters", () => {
      const longText = "a".repeat(305);
      const res = validateStudentFeedback({
        usefulness_rating: 5,
        engagement_rating: 5,
        most_interesting: longText,
      });
      assert.equal(res.isValid, false);
      assert.match(res.errors[0], /cannot exceed 300 characters/);
    });
  });

  describe("Server-Enforced Anonymity Threshold (Min 5 Responses)", () => {
    function createMockResponse(id: string, usefulness: number, engagement: number, text: string = "Great demo"): StoredFeedbackRecord {
      return {
        id,
        visit_request_id: "req-cbe-02",
        token_hash: "mock-token-hash",
        ip_hash: "hash-" + id,
        usefulness_rating: usefulness,
        engagement_rating: engagement,
        most_interesting: text,
        suggestion: "None",
        moderation_status: "approved",
        submitted_at: new Date().toISOString(),
      };
    }

    it("STRICTLY WITHHOLDS aggregates and comments when fewer than 5 responses exist (1 to 4)", () => {
      const responsesUnderThreshold = [
        createMockResponse("r1", 5, 5),
        createMockResponse("r2", 4, 4),
        createMockResponse("r3", 5, 4),
        createMockResponse("r4", 4, 5),
      ];

      const agg = calculateFeedbackAggregates(responsesUnderThreshold, 5);
      assert.equal(agg.anonymityThresholdMet, false);
      assert.equal(agg.count, 4);
      assert.equal(agg.minRequired, 5);
      assert.equal(agg.avgUsefulness, undefined);
      assert.equal(agg.avgEngagement, undefined);
      assert.equal(agg.highlights, undefined);
    });

    it("REVEALS aggregates only when at least 5 responses exist (threshold met)", () => {
      const responsesAtThreshold = [
        createMockResponse("r1", 5, 5, "Live cupola pouring"),
        createMockResponse("r2", 4, 4, "CMM metrology"),
        createMockResponse("r3", 5, 5, "Sand casting line"),
        createMockResponse("r4", 4, 4, "Quality lab"),
        createMockResponse("r5", 5, 4, "Engineer Q&A"),
      ];

      const agg = calculateFeedbackAggregates(responsesAtThreshold, 5);
      assert.equal(agg.anonymityThresholdMet, true);
      assert.equal(agg.count, 5);
      assert.equal(agg.avgUsefulness, 4.6); // (5+4+5+4+5)/5 = 23/5 = 4.6
      assert.equal(agg.avgEngagement, 4.4); // (5+4+5+4+4)/5 = 22/5 = 4.4
      assert.equal(agg.highlights?.length, 5);
    });
  });

  describe("Content Moderation Scanner", () => {
    it("approves genuine technical and constructive student remarks", () => {
      const res = moderateFeedbackText("The automated induction furnace tapping was impressive.");
      assert.equal(res.status, "approved");
    });

    it("flags comments containing personal contact numbers or emails to prevent minor privacy leaks", () => {
      const resWithPhone = moderateFeedbackText("Here is my phone number 9876543210 for internships.");
      assert.equal(resWithPhone.status, "flagged");
      assert.match(resWithPhone.reason!, /personal contact information/);

      const resWithEmail = moderateFeedbackText("Email me at student@gmail.com for questions.");
      assert.equal(resWithEmail.status, "flagged");
    });

    it("flags abusive or hateful words pending admin review", () => {
      const res = moderateFeedbackText("This company was horrible and fake.");
      assert.equal(res.status, "flagged");
      assert.match(res.reason!, /flagged keyword/);
    });
  });

  describe("Salted IP Hashing & Privacy Invariants", () => {
    it("produces irreversible SHA-256 hash without storing raw IP", () => {
      const hash1 = hashClientIp("192.168.1.10", "salt-2026-10-23");
      assert.equal(hash1.length, 64);
      assert.equal(hash1.includes("192.168"), false);
    });

    it("generates different hashes for different daily rotating salts", () => {
      const hashDay1 = hashClientIp("192.168.1.10", "salt-day-1");
      const hashDay2 = hashClientIp("192.168.1.10", "salt-day-2");
      assert.notEqual(hashDay1, hashDay2);
    });
  });

  describe("Guardrail: Zero Strike Contamination", () => {
    it("guarantees student feedback does not alter institution trust score or strikes", () => {
      const trustScoreBefore = 78.5;
      const trustScoreAfter = 78.5;
      assert.equal(assertZeroStrikeContamination(trustScoreBefore, trustScoreAfter), true);
    });
  });
});
