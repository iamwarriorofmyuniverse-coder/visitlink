import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeQualityScore,
  computeFinalRankScore,
  rerankWithExplorationSlot,
  matchesHandsOnTag,
  matchesModernTechnologyTag,
  RankableFacility,
} from "../../lib/resourceful/rerank.ts";

describe("Search Re-Ranking & Exploration Slot Engine (Phase q3)", () => {
  const baseFacility: RankableFacility = {
    id: "fac-1",
    name: "Coimbatore Precision Engineering",
    relevance_score: 0.80,
    distance_km: 12.0,
    learning_value_score: 80,
    hosting_readiness_score: 85,
    verified_experience_rating: 4.8,
    verified_visits_count: 5,
    hands_on_available: true,
    interactive_elements: ["hands_on_activity", "live_demo"],
    technology_levels: ["cnc", "robotics"],
  };

  describe("Re-Ranking Math & Tiebreaker Behavior", () => {
    it("computes normalized composite quality score correctly", () => {
      // Learning: 80/100 * 0.40 = 0.32
      // Hosting: 85/100 * 0.30 = 0.255
      // Experience: 4.8/5.0 * 0.30 = 0.288
      // Sum = 0.863
      const quality = computeQualityScore(baseFacility);
      assert.ok(Math.abs(quality - 0.863) < 0.001);
    });

    it("evaluates final score using 80% relevance + 20% quality", () => {
      // Relevance: 0.80 * 0.80 = 0.64
      // Quality: 0.863 * 0.20 = 0.1726
      // Sum = 0.8126
      const finalScore = computeFinalRankScore(baseFacility);
      assert.ok(Math.abs(finalScore - 0.8126) < 0.001);
    });

    it("uses quality score as a tiebreaker when relevance is equal", () => {
      const highQuality = { ...baseFacility, id: "fac-high", learning_value_score: 95, hosting_readiness_score: 95 };
      const lowQuality = { ...baseFacility, id: "fac-low", learning_value_score: 40, hosting_readiness_score: 40 };

      const scoreHigh = computeFinalRankScore(highQuality);
      const scoreLow = computeFinalRankScore(lowQuality);

      assert.ok(scoreHigh > scoreLow);
    });

    it("guarantees high relevance dominates lower relevance (quality is only tiebreaker)", () => {
      const highRelevanceLowQuality: RankableFacility = {
        id: "fac-rel",
        name: "Direct Syllabus Match Foundry",
        relevance_score: 0.95,
        distance_km: 10,
        learning_value_score: 40,
        hosting_readiness_score: 40,
        verified_experience_rating: 3.5,
      };

      const lowRelevanceHighQuality: RankableFacility = {
        id: "fac-qual",
        name: "General Mechanical Unit",
        relevance_score: 0.60,
        distance_km: 10,
        learning_value_score: 100,
        hosting_readiness_score: 100,
        verified_experience_rating: 5.0,
      };

      const score1 = computeFinalRankScore(highRelevanceLowQuality);
      const score2 = computeFinalRankScore(lowRelevanceHighQuality);

      // High relevance (0.95) must beat low relevance (0.60)
      assert.ok(score1 > score2);
    });
  });

  describe("Hard Filter Invariant (Membership Preservation)", () => {
    it("never alters the candidate count or set of items (preserves filtered membership)", () => {
      const candidates: RankableFacility[] = Array.from({ length: 7 }, (_, i) => ({
        id: `fac-${i + 1}`,
        name: `Plant ${i + 1}`,
        relevance_score: 0.7 + i * 0.03,
        distance_km: 5 + i * 2,
        verified_visits_count: 4,
      }));

      const reranked = rerankWithExplorationSlot(candidates);

      assert.equal(reranked.length, 7);
      const originalIds = new Set(candidates.map((c) => c.id));
      const rerankedIds = new Set(reranked.map((c) => c.id));
      assert.deepEqual(rerankedIds, originalIds);
    });
  });

  describe("Exploration Slot for New Industries (< 3 Visits)", () => {
    it("guarantees exposure by placing a new industry into slot #5 (index 4) of a 10-item result window", () => {
      // 10 facilities where 1-9 are established (visits=10) and facility 10 is new (visits=0)
      const facilities: RankableFacility[] = [
        ...Array.from({ length: 9 }, (_, i) => ({
          id: `est-${i + 1}`,
          name: `Established Plant ${i + 1}`,
          relevance_score: 0.90 - i * 0.02,
          distance_km: 10 + i,
          verified_visits_count: 10,
          learning_value_score: 80,
          hosting_readiness_score: 80,
        })),
        {
          id: "new-star",
          name: "Innovative New Workshop",
          relevance_score: 0.70,
          distance_km: 15,
          verified_visits_count: 0, // NEW!
          learning_value_score: 85,
          hosting_readiness_score: 80,
        },
      ];

      const reranked = rerankWithExplorationSlot(facilities);

      // Total count remains 10
      assert.equal(reranked.length, 10);

      // The new facility must be hoisted to index 4 (5th position)
      assert.equal(reranked[4].id, "new-star");
    });

    it("does not displace items if slot #5 already naturally holds a new facility", () => {
      const facilities: RankableFacility[] = Array.from({ length: 10 }, (_, i) => ({
        id: `fac-${i + 1}`,
        name: `Plant ${i + 1}`,
        relevance_score: 0.90 - i * 0.05,
        distance_km: 5 + i,
        verified_visits_count: i === 4 ? 1 : 10, // Index 4 is already a new facility
      }));

      const reranked = rerankWithExplorationSlot(facilities);
      assert.equal(reranked[4].id, "fac-5");
    });
  });

  describe("Tag-Based Filters (Independent of Scores)", () => {
    it("identifies hands-on facilities from boolean or interactive_elements array", () => {
      assert.equal(matchesHandsOnTag(baseFacility), true);
      assert.equal(matchesHandsOnTag({ ...baseFacility, hands_on_available: false, interactive_elements: [] }), false);
    });

    it("identifies modern technology facilities based on CNC, robotics, or IoT tags", () => {
      assert.equal(matchesModernTechnologyTag(baseFacility), true); // Has cnc & robotics

      const manualPlant: RankableFacility = {
        ...baseFacility,
        technology_levels: ["manual", "semi_automated"],
      };
      assert.equal(matchesModernTechnologyTag(manualPlant), false);

      const iotPlant: RankableFacility = {
        ...baseFacility,
        technology_levels: ["iot_industry_4_0"],
      };
      assert.equal(matchesModernTechnologyTag(iotPlant), true);
    });
  });

  describe("Strict Anti-Bias Invariant", () => {
    it("strictly throws anti-bias violation when company_size is passed to quality score", () => {
      assert.throws(
        () => computeQualityScore({ ...baseFacility, company_size: "tier_1" } as any),
        /Field 'company_size' is strictly forbidden/
      );
    });
  });
});
