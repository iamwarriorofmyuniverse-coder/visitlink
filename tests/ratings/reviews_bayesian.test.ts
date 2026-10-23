import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateCoordinatorRatingInput,
  calculateServerOverallRating,
  validatePrivateInstitutionRatingInput,
  calculatePrivateInstitutionOverallRating,
} from "../../lib/ratings/reviews.ts";
import {
  calculateBayesianRating,
  RatingRecord,
  DEFAULT_BAYESIAN_SETTINGS,
} from "../../lib/ratings/bayesian.ts";

describe("Verified Ratings & Bayesian Aggregation Engine (Phases r1-r2)", () => {
  describe("Review Submission & Completed-Visit Guardrail", () => {
    it("rejects review if visit is not completed (e.g. pending or approved)", () => {
      const invalid = {
        visit_request_id: "req-1",
        visit_status: "approved", // NOT completed
        learning_value_rating: 5,
        hosting_organisation_rating: 5,
        staff_guide_quality_rating: 5,
        safety_rating: 5,
        listing_accuracy_rating: 5,
      };

      const result = validateCoordinatorRatingInput(invalid);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Visit must be confirmed as 'completed'/);
    });

    it("enforces 1-hour post-visit cooldown", () => {
      const now = new Date();
      const justCompleted = new Date(now.getTime() - 20 * 60 * 1000).toISOString(); // 20 mins ago

      const input = {
        visit_request_id: "req-1",
        visit_status: "completed",
        visit_completed_at: justCompleted,
        learning_value_rating: 5,
        hosting_organisation_rating: 5,
        staff_guide_quality_rating: 5,
        safety_rating: 5,
        listing_accuracy_rating: 5,
      };

      const result = validateCoordinatorRatingInput(input, now);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Cooldown in effect/);
    });

    it("passes validation when visit is completed and cooldown has elapsed", () => {
      const now = new Date();
      const completedTwoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

      const input = {
        visit_request_id: "req-1",
        visit_status: "completed",
        visit_completed_at: completedTwoHoursAgo,
        learning_value_rating: 5,
        hosting_organisation_rating: 4,
        staff_guide_quality_rating: 5,
        safety_rating: 5,
        listing_accuracy_rating: 4,
      };

      const result = validateCoordinatorRatingInput(input, now);
      assert.equal(result.isValid, true);
      assert.equal(result.serverOverallRating, 4.6);
    });

    it("calculates server-side overall rating from the 5 dimensions", () => {
      const overall = calculateServerOverallRating({
        learning_value_rating: 4,
        hosting_organisation_rating: 4,
        staff_guide_quality_rating: 5,
        safety_rating: 5,
        listing_accuracy_rating: 5,
      });
      // (4 + 4 + 5 + 5 + 5) / 5 = 23 / 5 = 4.60
      assert.equal(overall, 4.6);
    });

    it("validates private institution rating (4 dimensions)", () => {
      const valid = {
        visit_request_id: "req-1",
        visit_status: "completed",
        punctuality_rating: 5,
        discipline_rating: 5,
        preparedness_rating: 4,
        headcount_accuracy_rating: 5,
      };
      const result = validatePrivateInstitutionRatingInput(valid);
      assert.equal(result.isValid, true);
      assert.equal(result.serverOverallRating, 4.75); // (5+5+4+5)/4 = 19/4 = 4.75
    });
  });

  describe("Bayesian Smoothing & Boundary Values", () => {
    const makeRating = (rating: number, monthsAgo = 0): RatingRecord => {
      const date = new Date("2026-10-23");
      date.setMonth(date.getMonth() - monthsAgo);
      return {
        id: `r-${Math.random()}`,
        overall_rating: rating,
        learning_value_rating: rating,
        hosting_organisation_rating: rating,
        staff_guide_quality_rating: rating,
        safety_rating: rating,
        listing_accuracy_rating: rating,
        created_at: date.toISOString(),
      };
    };

    it("boundary n=1: smooths single 5-star rating towards platform mean (4.50)", () => {
      // Formula: (5 * 4.5 + 1 * 5.0) / (5 + 1) = 27.5 / 6 = 4.58
      const ratings = [makeRating(5.0)];
      const result = calculateBayesianRating(ratings, new Date("2026-10-23"));

      assert.equal(result.showPublicScore, false); // n=1 < 5 threshold
      assert.equal(result.isNewBadge, true);
      assert.equal(result.totalVerifiedVisits, 1);
      assert.equal(result.bayesianAverage, undefined); // Hidden publicly
      assert.equal(result.explain.formula, "(5 × 4.5 + ∑(w_i × R_i)) / (5 + ∑w_i)");
    });

    it("boundary n=4: withholds public numerical score below 5 verified visits", () => {
      const ratings = [makeRating(5.0), makeRating(5.0), makeRating(4.0), makeRating(4.0)];
      const result = calculateBayesianRating(ratings, new Date("2026-10-23"));

      assert.equal(result.showPublicScore, false);
      assert.equal(result.isNewBadge, true);
      assert.equal(result.totalVerifiedVisits, 4);
    });

    it("boundary n=5: reveals public Bayesian average when threshold is met", () => {
      // 5 visits with 5.0 rating: (5 * 4.5 + 5 * 5.0) / (5 + 5) = 47.5 / 10 = 4.75
      const ratings = [
        makeRating(5.0),
        makeRating(5.0),
        makeRating(5.0),
        makeRating(5.0),
        makeRating(5.0),
      ];
      const result = calculateBayesianRating(ratings, new Date("2026-10-23"));

      assert.equal(result.showPublicScore, true);
      assert.equal(result.isNewBadge, false);
      assert.equal(result.totalVerifiedVisits, 5);
      assert.equal(result.bayesianAverage, 4.75);
      assert.equal(result.rawArithmeticAverage, 5.0);
    });

    it("boundary n=100: empirical data dominates prior weight", () => {
      // 100 visits of 5.0: (5 * 4.5 + 100 * 5.0) / (5 + 100) = 522.5 / 105 = 4.98
      const ratings = Array.from({ length: 100 }, () => makeRating(5.0));
      const result = calculateBayesianRating(ratings, new Date("2026-10-23"));

      assert.equal(result.showPublicScore, true);
      assert.equal(result.totalVerifiedVisits, 100);
      assert.equal(result.bayesianAverage, 4.98);
    });
  });

  describe("Recency Weighting (24-Month Cutoff)", () => {
    const makeRating = (rating: number, monthsAgo: number): RatingRecord => {
      const date = new Date("2026-10-23");
      date.setMonth(date.getMonth() - monthsAgo);
      return {
        id: `r-${Math.random()}`,
        overall_rating: rating,
        learning_value_rating: rating,
        hosting_organisation_rating: rating,
        staff_guide_quality_rating: rating,
        safety_rating: rating,
        listing_accuracy_rating: rating,
        created_at: date.toISOString(),
      };
    };

    it("applies 50% discount to ratings older than 24 months", () => {
      const now = new Date("2026-10-23");
      // 5 recent ratings (1.0 weight) and 5 old ratings from 30 months ago (0.50 weight)
      const ratings = [
        makeRating(5.0, 2),
        makeRating(5.0, 6),
        makeRating(5.0, 12),
        makeRating(5.0, 18),
        makeRating(5.0, 22),
        makeRating(3.0, 26), // old -> weight 0.5
        makeRating(3.0, 28), // old -> weight 0.5
        makeRating(3.0, 30), // old -> weight 0.5
        makeRating(3.0, 32), // old -> weight 0.5
        makeRating(3.0, 34), // old -> weight 0.5
      ];

      const result = calculateBayesianRating(ratings, now);

      assert.equal(result.totalVerifiedVisits, 10);
      assert.equal(result.explain.olderDiscountedCount, 5);
      // Effective weights: 5 * 1.0 + 5 * 0.5 = 7.5
      assert.equal(result.explain.effectiveWeightSum, 7.5);
    });
  });
});
