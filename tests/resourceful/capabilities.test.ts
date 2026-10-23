import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateCapabilities,
  assertNoForbiddenInputs,
  FORBIDDEN_SCORING_FIELDS,
  IndustryCapabilities,
  ALLOWED_PROCESS_STAGES,
  ALLOWED_TECHNOLOGY_LEVELS,
} from "../../lib/resourceful/capabilities.ts";

describe("Resourceful Sites Capabilities & Anti-Bias Validation (Phase q1)", () => {
  const validCapabilities: IndustryCapabilities = {
    process_stages_visible: ["raw_material_prep", "primary_forming", "precision_machining", "quality_ndt_testing"],
    technology_levels: ["semi_automated", "cnc", "robotics"],
    live_demo_available: true,
    hands_on_available: true,
    engineer_qa_available: true,
    guide_available: true,
    estimated_interactive_minutes: 60,
    student_observation_description: "Students observe cupola tapping, CNC 5-axis milling, and CMM metrology inspection.",
    briefing_room: true,
    av_equipment: true,
    safe_visitor_walkway: true,
    restrooms_available: true,
    ppe_supplied: true,
    max_group_size: 45,
    visitor_staff_count: 2,
    photos: [
      "/images/plants/casting_floor_real.jpg",
      "/images/plants/cnc_machining_bay_real.jpg",
      "/images/plants/metrology_lab_real.jpg",
      "/images/plants/safety_walkway_real.jpg",
    ],
    certifications: [
      {
        cert_type: "ISO 9001",
        cert_file_path: "/certs/iso9001_kovai_foundry.pdf",
        expiry_date: "2027-12-31",
        admin_verification_status: "verified",
      },
    ],
  };

  it("passes validation for complete valid industry capabilities", () => {
    const result = validateCapabilities(validCapabilities);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  describe("STRICT ANTI-BIAS FORBIDDEN INPUTS INVARIANTS", () => {
    it("asserts all defined forbidden fields are present in the audit list", () => {
      assert.ok(FORBIDDEN_SCORING_FIELDS.includes("facility_age"));
      assert.ok(FORBIDDEN_SCORING_FIELDS.includes("company_size"));
      assert.ok(FORBIDDEN_SCORING_FIELDS.includes("annual_turnover"));
      assert.ok(FORBIDDEN_SCORING_FIELDS.includes("photo_aesthetics"));
      assert.ok(FORBIDDEN_SCORING_FIELDS.includes("sponsored_boost"));
    });

    it("throws anti-bias error when facility_age is passed", () => {
      assert.throws(
        () => assertNoForbiddenInputs({ facility_age: 25 }),
        /Field 'facility_age' is strictly forbidden/
      );
    });

    it("throws anti-bias error when company_size is passed", () => {
      assert.throws(
        () => assertNoForbiddenInputs({ company_size: "large_enterprise" }),
        /Field 'company_size' is strictly forbidden/
      );
    });

    it("throws anti-bias error when annual_turnover is passed", () => {
      assert.throws(
        () => assertNoForbiddenInputs({ annual_turnover: "100_crores" }),
        /Field 'annual_turnover' is strictly forbidden/
      );
    });

    it("throws anti-bias error when photo_aesthetics or image beauty score is passed", () => {
      assert.throws(
        () => assertNoForbiddenInputs({ photo_aesthetics: 9.2 }),
        /Field 'photo_aesthetics' is strictly forbidden/
      );
      assert.throws(
        () => assertNoForbiddenInputs({ image_beauty_score: 88 }),
        /Field 'image_beauty_score' is strictly forbidden/
      );
    });

    it("throws anti-bias error when sponsored_boost is passed", () => {
      assert.throws(
        () => assertNoForbiddenInputs({ sponsored_boost: true }),
        /Field 'sponsored_boost' is strictly forbidden/
      );
    });

    it("rejects capability payload containing forbidden fields via validateCapabilities", () => {
      const contaminated = { ...validCapabilities, facility_age: 15 };
      const result = validateCapabilities(contaminated as any);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /facility_age.*strictly forbidden/);
    });
  });

  describe("Listing & Photo Requirements (Min 4 Real Photos)", () => {
    it("rejects when fewer than 4 real photos are provided", () => {
      const insufficientPhotos = {
        ...validCapabilities,
        photos: ["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"],
      };
      const result = validateCapabilities(insufficientPhotos);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /At least 4 real facility photos must be provided/);
    });

    it("accepts when 4 or more real photos are provided", () => {
      const validPhotos = {
        ...validCapabilities,
        photos: [
          "/images/1.jpg",
          "/images/2.jpg",
          "/images/3.jpg",
          "/images/4.jpg",
          "/images/5.jpg",
        ],
      };
      const result = validateCapabilities(validPhotos);
      assert.equal(result.isValid, true);
    });
  });

  describe("Interactive & Physical Boundaries", () => {
    it("rejects interactive minutes outside 0 to 240 range", () => {
      assert.equal(
        validateCapabilities({ ...validCapabilities, estimated_interactive_minutes: -10 }).isValid,
        false
      );
      assert.equal(
        validateCapabilities({ ...validCapabilities, estimated_interactive_minutes: 250 }).isValid,
        false
      );
    });

    it("rejects negative visitor staff count", () => {
      const negativeStaff = { ...validCapabilities, visitor_staff_count: -1 };
      assert.equal(validateCapabilities(negativeStaff).isValid, false);
    });

    it("rejects invalid process stage names", () => {
      const invalidStage = {
        ...validCapabilities,
        process_stages_visible: ["raw_material_prep", "tourist_gift_shop" as any],
      };
      const result = validateCapabilities(invalidStage);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /Invalid process stage 'tourist_gift_shop'/);
    });
  });

  describe("Certifications Validation", () => {
    it("rejects certification with invalid cert type", () => {
      const invalidCert = {
        ...validCapabilities,
        certifications: [
          {
            cert_type: "BEST_FACTORY_AWARD" as any,
            cert_file_path: "/certs/award.pdf",
            expiry_date: "2027-12-31",
            admin_verification_status: "pending" as const,
          },
        ],
      };
      const result = validateCapabilities(invalidCert);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /invalid cert_type 'BEST_FACTORY_AWARD'/);
    });

    it("rejects certification with missing file path", () => {
      const missingFile = {
        ...validCapabilities,
        certifications: [
          {
            cert_type: "ISO 9001" as const,
            cert_file_path: "",
            expiry_date: "2027-12-31",
            admin_verification_status: "pending" as const,
          },
        ],
      };
      const result = validateCapabilities(missingFile);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /missing a certificate file path/);
    });
  });
});
