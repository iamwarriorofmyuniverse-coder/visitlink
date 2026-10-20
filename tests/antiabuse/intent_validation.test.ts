import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateEducationalIntent,
  isFreemailDomain,
  validateFacultyEmail,
  generateFacultyVerificationToken,
  verifyFacultyVerificationToken,
} from "../../lib/antiabuse/validation.ts";

describe("Educational Intent & Anti-Abuse Form Validation (Phase m1)", () => {
  const validIntentPayload = {
    learning_objectives: [
      "Understand green sand moulding automation and molten metal pouring sequences in high-pressure cupola furnaces",
      "Analyze casting defects (porosity and shrinkage cavities) via ultrasonic nondestructive flaw testing lab",
    ],
    course_name: "Manufacturing Processes & Metallurgy",
    semester_class: "4th Semester B.E. Mechanical",
    syllabus_topic: "Unit 3: Foundry Technology and Casting Defect Analysis",
    pre_visit_agenda:
      "09:30 Safety briefing; 10:00 Core shop & sand plant; 11:30 Furnace tapping & pouring line; 12:30 Metallurgy testing lab.",
    expected_deliverable: "report" as const,
    faculty_name: "Dr. K. Senthil Kumar",
    faculty_email: "senthilkumar@cit.edu.in",
    faculty_phone: "+919876543210",
  };

  it("passes when all mandatory educational intent fields are thorough and valid", () => {
    const result = validateEducationalIntent(validIntentPayload);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  describe("Learning Objectives Validation", () => {
    it("rejects when fewer than 2 learning objectives are provided", () => {
      const payload = {
        ...validIntentPayload,
        learning_objectives: [
          "Understand green sand moulding automation and molten metal pouring sequences in high-pressure cupola furnaces",
        ],
      };
      const result = validateEducationalIntent(payload);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "learning_objectives" && e.message.includes("At least 2")));
    });

    it("rejects when an objective is under 30 characters", () => {
      const payload = {
        ...validIntentPayload,
        learning_objectives: [
          "Learn casting defects", // 21 chars (< 30)
          "Analyze casting defects (porosity and shrinkage cavities) via ultrasonic nondestructive flaw testing lab",
        ],
      };
      const result = validateEducationalIntent(payload);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "learning_objectives" && e.message.includes("at least 30 characters")));
    });

    it("rejects placeholder words like 'visit', 'exposure', 'fun', 'picnic', or 'n/a'", () => {
      const payload = {
        ...validIntentPayload,
        learning_objectives: [
          "Just an industrial visit for exposure and general knowledge", // contains 'exposure' and 'industrial visit' placeholder
          "Analyze casting defects (porosity and shrinkage cavities) via ultrasonic nondestructive flaw testing lab",
        ],
      };
      const result = validateEducationalIntent(payload);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "learning_objectives" && e.message.includes("placeholder")));
    });
  });

  describe("Faculty Email Domain & Verification", () => {
    it("correctly identifies consumer free-mail domains", () => {
      assert.equal(isFreemailDomain("faculty@gmail.com"), true);
      assert.equal(isFreemailDomain("hod@yahoo.co.in"), true);
      assert.equal(isFreemailDomain("coordinator@outlook.com"), true);
      assert.equal(isFreemailDomain("teacher@rediffmail.com"), true);
      assert.equal(isFreemailDomain("staff@psgtech.edu"), false);
      assert.equal(isFreemailDomain("hod@cit.edu.in"), false);
      assert.equal(isFreemailDomain("dean@gct.ac.in"), false);
    });

    it("rejects common free-mail domains for standard institutions", () => {
      const result = validateFacultyEmail("prof.smith@gmail.com", false);
      assert.equal(result.valid, false);
      assert.match(result.error!, /institutional email address/i);
    });

    it("permits consumer email domain when admin override (small school) is enabled", () => {
      const result = validateFacultyEmail("headmaster.govt.school@gmail.com", true);
      assert.equal(result.valid, true);
      assert.equal(result.error, undefined);
    });

    it("generates and verifies faculty confirmation tokens", () => {
      const token = generateFacultyVerificationToken("req-cbe-01", "senthil@cit.edu.in");
      assert.ok(typeof token === "string" && token.length > 20);

      const verified = verifyFacultyVerificationToken(token, "req-cbe-01");
      assert.equal(verified.valid, true);
      assert.equal(verified.email, "senthil@cit.edu.in");

      const invalidReq = verifyFacultyVerificationToken(token, "req-different-99");
      assert.equal(invalidReq.valid, false);
    });
  });

  describe("Agenda & Pre-visit Deliverables", () => {
    it("rejects when agenda is vague or under 40 characters", () => {
      const payload = {
        ...validIntentPayload,
        pre_visit_agenda: "Walk around the factory floor", // 29 chars (< 40)
      };
      const result = validateEducationalIntent(payload);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "pre_visit_agenda"));
    });

    it("rejects empty syllabus topic", () => {
      const payload = {
        ...validIntentPayload,
        syllabus_topic: "n/a", // placeholder
      };
      const result = validateEducationalIntent(payload);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "syllabus_topic"));
    });
  });
});
