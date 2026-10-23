import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateEngagementProfile,
  formatEngagementBadge,
  matchesEngagementFilter,
  ALLOWED_INTERACTIVE_ELEMENTS,
  IndustryEngagementProfile,
} from "../../lib/engagement/profile.ts";

describe("Student Engagement Profile Validation & Filtering (Phase p1)", () => {
  const validProfile: IndustryEngagementProfile = {
    interactive_elements: ["live_demo", "hands_on_activity", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 60,
    engagement_notes: "Guided assembly line testing and 30-min metallurgist Q&A session.",
  };

  it("passes validation for a comprehensive valid engagement profile", () => {
    const result = validateEngagementProfile(validProfile);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  describe("Interactive Elements & Boundaries", () => {
    it("rejects invalid or unauthorized element names", () => {
      const invalid = {
        ...validProfile,
        interactive_elements: ["live_demo", "sightseeing_tour" as any],
      };
      const result = validateEngagementProfile(invalid);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Invalid interactive element 'sightseeing_tour'/);
    });

    it("accepts all allowed interactive elements", () => {
      const allAllowed = {
        ...validProfile,
        interactive_elements: [...ALLOWED_INTERACTIVE_ELEMENTS],
      };
      const result = validateEngagementProfile(allAllowed);
      assert.equal(result.isValid, true);
    });

    it("rejects interactive minutes outside the 0 to 240 boundary", () => {
      const negative = { ...validProfile, estimated_interactive_minutes: -5 };
      assert.equal(validateEngagementProfile(negative).isValid, false);

      const excessive = { ...validProfile, estimated_interactive_minutes: 245 };
      assert.equal(validateEngagementProfile(excessive).isValid, false);

      const boundary240 = { ...validProfile, estimated_interactive_minutes: 240 };
      assert.equal(validateEngagementProfile(boundary240).isValid, true);

      const boundary0 = { ...validProfile, estimated_interactive_minutes: 0 };
      assert.equal(validateEngagementProfile(boundary0).isValid, true);
    });

    it("rejects non-integer interactive minutes", () => {
      const floatVal = { ...validProfile, estimated_interactive_minutes: 45.5 };
      const result = validateEngagementProfile(floatVal);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /must be an integer/);
    });
  });

  describe("Anti-Leisure Scope Guardrails", () => {
    it("strictly rejects prohibited 'fun' or 'enjoyment' score metrics", () => {
      const withFunScore = {
        ...validProfile,
        fun_score: 9.5,
      };
      const result = validateEngagementProfile(withFunScore);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Prohibited field 'fun_score' detected/);
    });

    it("strictly rejects enjoyment rating fields", () => {
      const withEnjoyment = {
        ...validProfile,
        enjoyment_rating: 5,
      };
      const result = validateEngagementProfile(withEnjoyment);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Prohibited field 'enjoyment_rating' detected/);
    });
  });

  describe("Badge Formatting & Search Filtering", () => {
    it("formats badge metadata with clear descriptions", () => {
      const badge = formatEngagementBadge("hands_on_activity");
      assert.equal(badge.label, "Hands-on Activity");
      assert.equal(badge.shortLabel, "Hands-on");
      assert.match(badge.description, /guided laboratory/);
    });

    it("correctly filters facilities by 'hands_on_activity'", () => {
      const facilityWithHandsOn: IndustryEngagementProfile["interactive_elements"] = [
        "live_demo",
        "hands_on_activity",
      ];
      const facilityWithoutHandsOn: IndustryEngagementProfile["interactive_elements"] = [
        "live_demo",
        "product_showcase",
      ];

      assert.equal(matchesEngagementFilter(facilityWithHandsOn, "hands_on_activity"), true);
      assert.equal(matchesEngagementFilter(facilityWithoutHandsOn, "hands_on_activity"), false);
      assert.equal(matchesEngagementFilter(facilityWithoutHandsOn, "all"), true);
    });
  });
});
