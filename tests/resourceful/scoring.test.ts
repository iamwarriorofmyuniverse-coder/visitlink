import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateLearningValueScore,
  calculateHostingReadinessScore,
  isCertificationActiveAndVerified,
  DEFAULT_LEARNING_WEIGHTS,
  DEFAULT_HOSTING_WEIGHTS,
} from "../../lib/resourceful/scoring.ts";
import { IndustryCapabilities } from "../../lib/resourceful/capabilities.ts";

describe("Resourceful Sites Score Computation & Boundary Tests (Phase q2)", () => {
  const emptyCapabilities: IndustryCapabilities = {
    process_stages_visible: [],
    technology_levels: [],
    live_demo_available: false,
    hands_on_available: false,
    engineer_qa_available: false,
    guide_available: false,
    estimated_interactive_minutes: 0,
    student_observation_description: "",
    briefing_room: false,
    av_equipment: false,
    safe_visitor_walkway: false,
    restrooms_available: false,
    ppe_supplied: false,
    max_group_size: 10,
    visitor_staff_count: 0,
    photos: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"],
    certifications: [],
  };

  const fullyVerifiedCapabilities: IndustryCapabilities = {
    process_stages_visible: [
      "raw_material_prep",
      "primary_forming",
      "precision_machining",
      "quality_ndt_testing",
    ],
    technology_levels: ["robotics", "cnc"],
    live_demo_available: true,
    hands_on_available: true,
    engineer_qa_available: true,
    guide_available: true,
    estimated_interactive_minutes: 60,
    student_observation_description: "Comprehensive foundry and CNC observation.",
    briefing_room: true,
    av_equipment: true,
    safe_visitor_walkway: true,
    restrooms_available: true,
    ppe_supplied: true,
    max_group_size: 45,
    visitor_staff_count: 3,
    photos: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"],
    certifications: [
      {
        cert_type: "ISO 9001",
        cert_file_path: "/certs/iso9001.pdf",
        expiry_date: "2028-12-31",
        admin_verification_status: "verified",
      },
    ],
    admin_verified_claims: {
      process_stages_visible: true,
      technology_levels: true,
      live_demo_available: true,
      hands_on_available: true,
      engineer_qa_available: true,
      guide_available: true,
      estimated_interactive_minutes: true,
      briefing_room: true,
      safe_visitor_walkway: true,
      restrooms_available: true,
      ppe_supplied: true,
      max_group_size: true,
      visitor_staff_count: true,
    },
  };

  describe("Baseline & Boundary Values", () => {
    it("returns 0 score for baseline facility with no declared capabilities", () => {
      const learning = calculateLearningValueScore(emptyCapabilities);
      assert.equal(learning.score, 0);

      const hosting = calculateHostingReadinessScore(emptyCapabilities);
      assert.equal(hosting.score, 0);
    });

    it("returns 100 score for fully declared and admin-verified facility", () => {
      const learning = calculateLearningValueScore(fullyVerifiedCapabilities);
      assert.equal(learning.score, 100);

      const hosting = calculateHostingReadinessScore(fullyVerifiedCapabilities);
      assert.equal(hosting.score, 100);
    });
  });

  describe("Unverified Claims Discount (50% Factor)", () => {
    it("discounts declared claims by exactly 50% when unverified", () => {
      // Unverified version of fully declared facility
      const unverified: IndustryCapabilities = {
        ...fullyVerifiedCapabilities,
        admin_verified_claims: {}, // No claims verified yet
        certifications: [], // No verified certs
      };

      const learning = calculateLearningValueScore(unverified);
      // 100 max * 0.5 = 50
      assert.equal(learning.score, 50);
      assert.equal(learning.unverifiedDiscountApplied, true);

      const hosting = calculateHostingReadinessScore(unverified);
      // 90 unverified points * 0.5 = 45 (certs was 10 pts verified only)
      assert.equal(hosting.score, 45);
      assert.equal(hosting.unverifiedDiscountApplied, true);
    });
  });

  describe("Contradicted Claims Penalty Flow", () => {
    it("applies exact 15-point penalty when listing is flagged as corrected", () => {
      const contradicted: IndustryCapabilities = {
        ...fullyVerifiedCapabilities,
        listing_corrected_flag: true,
        listing_corrected_reason: "Visiting coordinator reported robotic cell was offline and inaccessible to students.",
      };

      const result = calculateLearningValueScore(contradicted);
      // 100 - 15 = 85
      assert.equal(result.score, 85);
      assert.equal(result.penaltyPoints, 15);
      assert.match(result.penaltyReason!, /robotic cell was offline/);
    });
  });

  describe("Certifications Lifecycle & Expiry Handling", () => {
    it("accepts active verified certificate", () => {
      const cert = {
        cert_type: "ISO 9001" as const,
        cert_file_path: "/cert.pdf",
        expiry_date: "2028-06-30",
        admin_verification_status: "verified" as const,
      };
      assert.equal(isCertificationActiveAndVerified(cert, new Date("2026-10-23")), true);
    });

    it("rejects expired certificate and awards 0 points", () => {
      const expiredCert = {
        cert_type: "ISO 9001" as const,
        cert_file_path: "/cert.pdf",
        expiry_date: "2025-01-01", // Expired
        admin_verification_status: "verified" as const,
      };
      assert.equal(isCertificationActiveAndVerified(expiredCert, new Date("2026-10-23")), false);

      const facilityWithExpired = {
        ...fullyVerifiedCapabilities,
        certifications: [expiredCert],
      };
      const hosting = calculateHostingReadinessScore(facilityWithExpired);
      // 90 points from physical facilities, 0 from expired cert -> 90
      assert.equal(hosting.score, 90);
    });

    it("rejects pending or unverified certificate", () => {
      const pendingCert = {
        cert_type: "ISO 9001" as const,
        cert_file_path: "/cert.pdf",
        expiry_date: "2028-01-01",
        admin_verification_status: "pending" as const,
      };
      assert.equal(isCertificationActiveAndVerified(pendingCert, new Date("2026-10-23")), false);
    });
  });

  describe("Strict Anti-Bias Invariant in Scoring Engine", () => {
    it("strictly throws anti-bias violation when facility_age is supplied", () => {
      assert.throws(
        () => calculateLearningValueScore({ ...fullyVerifiedCapabilities, facility_age: 40 } as any),
        /Field 'facility_age' is strictly forbidden/
      );
    });

    it("strictly throws anti-bias violation when company_size is supplied", () => {
      assert.throws(
        () => calculateHostingReadinessScore({ ...fullyVerifiedCapabilities, company_size: "tier_1_vendor" } as any),
        /Field 'company_size' is strictly forbidden/
      );
    });
  });
});
