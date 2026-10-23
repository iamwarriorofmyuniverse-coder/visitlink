import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateSocialBreakMinutes,
  buildCertificateTemplate,
} from "../../lib/engagement/certificate.ts";

describe("Participation Certificate & Social Break Invariants (Phase p5)", () => {
  describe("Social Break Scheduling (0 to 30 Minutes)", () => {
    it("accepts valid social break durations (0, 15, 30 min)", () => {
      assert.equal(validateSocialBreakMinutes(0).isValid, true);
      assert.equal(validateSocialBreakMinutes(15).isValid, true);
      assert.equal(validateSocialBreakMinutes(30).isValid, true);
    });

    it("rejects negative durations and clamps to 0", () => {
      const res = validateSocialBreakMinutes(-10);
      assert.equal(res.isValid, false);
      assert.equal(res.sanitizedMinutes, 0);
      assert.match(res.error!, /between 0 and 30 minutes/);
    });

    it("rejects excessive durations (>30 min) and clamps to 30", () => {
      const res = validateSocialBreakMinutes(45);
      assert.equal(res.isValid, false);
      assert.equal(res.sanitizedMinutes, 30);
      assert.match(res.error!, /between 0 and 30 minutes/);
    });
  });

  describe("Certificate Template Generation & Privacy Guard", () => {
    it("generates complete certificate template metadata", () => {
      const template = buildCertificateTemplate({
        institutionName: "PSG College of Technology",
        facilityName: "Kovai Precision Foundry",
        visitDate: "2026-11-10",
        departmentCourse: "B.E. Mechanical Engineering - Manufacturing Technology",
        learningObjectives: [
          "Study automated green sand moulding lines and cupola furnace melting",
          "Observe CNC precision machining operations and CMM quality metrology",
        ],
      });

      assert.equal(template.institutionName, "PSG College of Technology");
      assert.equal(template.facilityName, "Kovai Precision Foundry");
      assert.equal(template.learningObjectives.length, 2);
    });

    it("STRICT PRIVACY AUDIT: Assert certificate template contains zero persisted student names", () => {
      const template = buildCertificateTemplate({
        institutionName: "PSG College of Technology",
        facilityName: "Kovai Precision Foundry",
        visitDate: "2026-11-10",
        departmentCourse: "B.E. Mechanical",
        learningObjectives: ["Study casting"],
      });

      // Verify no student personal properties exist on the template DTO
      assert.equal("student_name" in (template as any), false);
      assert.equal("student_id" in (template as any), false);
      assert.equal("student_email" in (template as any), false);
    });
  });
});
