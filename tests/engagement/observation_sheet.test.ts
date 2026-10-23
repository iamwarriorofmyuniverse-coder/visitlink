import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateObservationSheet,
  draftObservationSheetLocally,
  canPrintObservationSheet,
  ObservationSheetData,
} from "../../lib/engagement/observation_sheet.ts";

describe("Student Observation Sheet & Faculty Review Guardrail (Phase p3)", () => {
  const sampleParams = {
    visitRequestId: "req-cbe-02",
    facilityName: "Kovai Precision Foundry & Heavy Castings [Demo]",
    courseName: "Manufacturing Technology & Machine Tools",
    syllabusTopic: "Unit 3: Metal Casting Processes & High-Pressure Die Casting",
    learningObjectives: [
      "Study automated green sand moulding lines and cupola furnace melting.",
      "Observe CNC precision machining operations and CMM quality metrology.",
    ],
    sector: "foundry",
  };

  it("successfully drafts a valid observation sheet from learning objectives", () => {
    const sheet = draftObservationSheetLocally(sampleParams);
    assert.equal(sheet.status, "draft");
    assert.ok(sheet.questions.length >= 2);
    assert.ok(sheet.questions.length <= 8);

    const validation = validateObservationSheet(sheet);
    assert.equal(validation.isValid, true);
    assert.equal(validation.errors.length, 0);
  });

  describe("Schema Validation & Malformed JSON Rejection", () => {
    it("rejects an observation sheet with fewer than 2 questions", () => {
      const invalidSheet: Partial<ObservationSheetData> = {
        visitRequestId: "req-cbe-02",
        courseName: "Manufacturing Technology",
        questions: [
          {
            id: "q1",
            topic: "Casting",
            observation_target: "Furnace",
            prompt: "Describe the furnace tapping and molten temperature.",
            space_lines: 4,
          },
        ],
      };

      const result = validateObservationSheet(invalidSheet);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /between 2 and 8 observation questions/);
    });

    it("rejects questions with prompts shorter than 15 characters", () => {
      const invalidPrompt: Partial<ObservationSheetData> = {
        visitRequestId: "req-cbe-02",
        courseName: "Manufacturing",
        questions: [
          {
            id: "q1",
            topic: "Casting",
            observation_target: "Furnace",
            prompt: "Too short", // < 15 chars
            space_lines: 3,
          },
          {
            id: "q2",
            topic: "Quality",
            observation_target: "CMM",
            prompt: "Observe the coordinate measuring machine tolerances.",
            space_lines: 3,
          },
        ],
      };

      const result = validateObservationSheet(invalidPrompt);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /prompt is too short/);
    });

    it("rejects invalid space_lines outside the 2 to 6 range", () => {
      const invalidLines: Partial<ObservationSheetData> = {
        visitRequestId: "req-cbe-02",
        courseName: "Manufacturing",
        questions: [
          {
            id: "q1",
            topic: "Casting",
            observation_target: "Furnace",
            prompt: "Observe the molten metal pouring temperature.",
            space_lines: 10, // > 6
          },
          {
            id: "q2",
            topic: "Quality",
            observation_target: "CMM",
            prompt: "Observe the coordinate measuring machine tolerances.",
            space_lines: 3,
          },
        ],
      };

      const result = validateObservationSheet(invalidLines);
      assert.equal(result.isValid, false);
      assert.match(result.errors[0], /space_lines must be between 2 and 6/);
    });
  });

  describe("Faculty Review Guardrail: Print Authorization", () => {
    it("BLOCKS print when status is 'draft' (enforces faculty review before print)", () => {
      const draftSheet = draftObservationSheetLocally(sampleParams);
      assert.equal(draftSheet.status, "draft");

      const check = canPrintObservationSheet(draftSheet);
      assert.equal(check.canPrint, false);
      assert.match(check.reason!, /Faculty review required before printing/);
    });

    it("ALLOWS print after faculty marks status as 'reviewed'", () => {
      const reviewedSheet: ObservationSheetData = {
        ...draftObservationSheetLocally(sampleParams),
        status: "reviewed",
        facultyReviewedBy: "Dr. R. Karthikeyan",
        facultyReviewedAt: new Date().toISOString(),
      };

      const check = canPrintObservationSheet(reviewedSheet);
      assert.equal(check.canPrint, true);
    });

    it("supports faculty customization and overriding drafted questions", () => {
      const sheet = draftObservationSheetLocally(sampleParams);

      // Faculty customizes Question #1 with a specific formula calculation
      sheet.questions[0].prompt = "Measure the cycle time for green sand mould preparation and calculate hourly throughput.";
      sheet.questions[0].space_lines = 5;
      sheet.status = "reviewed";

      assert.equal(validateObservationSheet(sheet).isValid, true);
      assert.equal(canPrintObservationSheet(sheet).canPrint, true);
    });
  });
});
