import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTrustScore,
  determineTrustTier,
  canInstitutionBook,
  applyAdminStrikeReview,
  applyAdminAppealReview,
} from "../../lib/antiabuse/trust.ts";

describe("Trust Score, Tiers, Strikes & Appeals Engine (Phase m3)", () => {
  describe("Trust Score Formula & Edge Cases", () => {
    it("returns default score 50.0 for new institution with under 3 visits", () => {
      const score = calculateTrustScore({
        completedVisits: 1,
        reportsSubmittedOnTime: 1,
        averageEngagementRating: 5.0,
        confirmedNotEducationalCount: 0,
        noShowCount: 0,
        lateCancellationCount: 0,
        approvedVisitsCount: 1,
      });

      assert.equal(score, 50.0);
    });

    it("calculates high score (~95+) for exemplary institution with 10 completed visits, 100% reports and 5-star ratings", () => {
      const score = calculateTrustScore({
        completedVisits: 10,
        reportsSubmittedOnTime: 10,
        averageEngagementRating: 5.0,
        confirmedNotEducationalCount: 0,
        noShowCount: 0,
        lateCancellationCount: 0,
        approvedVisitsCount: 10,
      });

      // 30 (reports) + 30 (engagement) = 60 scaled with base = 100
      assert.equal(score, 100.0);
    });

    it("heavily penalizes no-shows and confirmed not-educational reports", () => {
      const score = calculateTrustScore({
        completedVisits: 5,
        reportsSubmittedOnTime: 2, // 40%
        averageEngagementRating: 2.0, // 25%
        confirmedNotEducationalCount: 2, // 40% penalty
        noShowCount: 1, // 20% penalty
        lateCancellationCount: 1,
        approvedVisitsCount: 6,
      });

      assert.ok(score < 30.0, `Score (${score}) should be below 30.0 due to severe penalties`);
    });

    it("strictly clamps score between 0.0 and 100.0", () => {
      const negativeScenario = calculateTrustScore({
        completedVisits: 4,
        reportsSubmittedOnTime: 0,
        averageEngagementRating: 1.0,
        confirmedNotEducationalCount: 4,
        noShowCount: 3,
        lateCancellationCount: 2,
        approvedVisitsCount: 7,
      });

      assert.equal(negativeScenario, 0.0);
    });
  });

  describe("Tier Transitions & Limits", () => {
    it("assigns 'new' tier for institutions with 0-2 visits and restricts pending requests to 2", () => {
      const tier = determineTrustTier(50.0, 2, 0);
      assert.equal(tier, "new");

      // Check booking limit for new institutions:
      const canBookWith1Pending = canInstitutionBook(
        { trust_tier: "new", trust_score: 50, active_strikes_count: 0 },
        "new",
        1
      );
      assert.equal(canBookWith1Pending.allowed, true);

      const canBookWith2Pending = canInstitutionBook(
        { trust_tier: "new", trust_score: 50, active_strikes_count: 0 },
        "new",
        2
      );
      assert.equal(canBookWith2Pending.allowed, false);
      assert.match(canBookWith2Pending.reason!, /limit of 2 pending requests/i);
    });

    it("promotes to 'verified' when visits >= 3, score >= 60, strikes <= 1", () => {
      const tier = determineTrustTier(75.0, 4, 1);
      assert.equal(tier, "verified");
    });

    it("promotes to 'trusted' when visits >= 8, score >= 85, strikes == 0", () => {
      const tier = determineTrustTier(92.0, 9, 0);
      assert.equal(tier, "trusted");
    });

    it("transitions to 'restricted' when active strikes reach 3 within 12 months", () => {
      const tier = determineTrustTier(70.0, 10, 3);
      assert.equal(tier, "restricted");
    });
  });

  describe("Industry Minimum Trust Tier Gatekeeper", () => {
    it("blocks 'new' or 'verified' institutions when facility requires 'trusted' tier", () => {
      const check = canInstitutionBook(
        { trust_tier: "verified", trust_score: 72, active_strikes_count: 0 },
        "trusted", // facility requires trusted
        0
      );

      assert.equal(check.allowed, false);
      assert.match(check.reason!, /facility requires 'trusted' trust tier/i);
    });

    it("allows 'trusted' institution to book facility requiring 'trusted' tier", () => {
      const check = canInstitutionBook(
        { trust_tier: "trusted", trust_score: 95, active_strikes_count: 0 },
        "trusted",
        0
      );

      assert.equal(check.allowed, true);
    });

    it("hard-blocks 'restricted' institution from any booking", () => {
      const check = canInstitutionBook(
        {
          trust_tier: "restricted",
          trust_score: 25,
          active_strikes_count: 3,
          restriction_reason: "3 strikes for unapproved tourism and no-show",
        },
        "new",
        0
      );

      assert.equal(check.allowed, false);
      assert.match(check.reason!, /restricted/i);
    });
  });

  describe("Strike Lifecycle & Appeal Safeguards", () => {
    const mockStrike = {
      id: "strike-01",
      institution_id: "inst-cbe-01",
      strike_type: "not_educational" as const,
      status: "pending_admin_review" as const,
      evidence_notes: "Only 5 students arrived, no teachers, left after 10 mins.",
      created_at: new Date().toISOString(),
    };

    it("approving strike adds 1 strike and initiates tier review", () => {
      const result = applyAdminStrikeReview(mockStrike, "approve", "admin-01", "Confirmed with factory CCTV");
      assert.equal(result.status, "approved");
      assert.equal(result.countsAsActiveStrike, true);
    });

    it("rejecting strike removes it with zero penalty to the institution", () => {
      const result = applyAdminStrikeReview(mockStrike, "reject", "admin-01", "False alarm: factory gate issue");
      assert.equal(result.status, "rejected");
      assert.equal(result.countsAsActiveStrike, false);
    });

    it("granting appeal clears strike and restores active count", () => {
      const appealedStrike = {
        ...mockStrike,
        status: "appealed" as const,
        appeal_reason: "We provided signed student attendance roster and project report.",
      };

      const result = applyAdminAppealReview(appealedStrike, "grant", "admin-01", "Appeal evidence accepted");
      assert.equal(result.status, "appeal_granted");
      assert.equal(result.countsAsActiveStrike, false);
    });
  });
});
