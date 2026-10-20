import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateIndustryConfirmation,
  determinePostVisitStatus,
  evaluateReportReminders,
  processPostVisitOutcome,
} from "../../lib/antiabuse/post_visit.ts";

describe("Post-Visit Verification & Expiry Flow (Phase m2)", () => {
  describe("Industry Post-Visit Confirmation Validation", () => {
    it("validates successful confirmation with educational purpose observed", () => {
      const result = validateIndustryConfirmation({
        attended: true,
        actual_headcount: 38,
        industry_engagement_rating: 5,
        purpose_observed: "educational",
        industry_post_visit_notes: "Students asked insightful questions about green sand moulding.",
      });

      assert.equal(result.isValid, true);
      assert.equal(result.errors.length, 0);
    });

    it("rejects confirmation with rating outside 1 to 5 range", () => {
      const result = validateIndustryConfirmation({
        attended: true,
        actual_headcount: 30,
        industry_engagement_rating: 6, // invalid
        purpose_observed: "educational",
      });

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "industry_engagement_rating"));
    });

    it("rejects confirmation with negative headcount", () => {
      const result = validateIndustryConfirmation({
        attended: true,
        actual_headcount: -5,
        industry_engagement_rating: 4,
        purpose_observed: "mixed",
      });

      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.field === "actual_headcount"));
    });
  });

  describe("Lifecycle Status Transitions (Unverified & Completed)", () => {
    it("moves to 'unverified' when industry does not confirm within 10 days", () => {
      const status = determinePostVisitStatus({
        industryConfirmed: false,
        daysElapsed: 11, // > 10 days
        reportUploaded: true,
      });

      assert.equal(status, "unverified");
    });

    it("remains 'pending_industry_verification' if under 10 days without confirmation", () => {
      const status = determinePostVisitStatus({
        industryConfirmed: false,
        daysElapsed: 5, // < 10 days
        reportUploaded: false,
      });

      assert.equal(status, "pending_industry_verification");
    });

    it("reaches 'completed' only after industry confirms positive attendance", () => {
      const status = determinePostVisitStatus({
        industryConfirmed: true,
        daysElapsed: 2,
        attended: true,
        purposeObserved: "educational",
        reportUploaded: true,
      });

      assert.equal(status, "completed");
    });

    it("marks 'no_show' if industry confirms that group did not attend", () => {
      const status = determinePostVisitStatus({
        industryConfirmed: true,
        daysElapsed: 1,
        attended: false,
        purposeObserved: "not_educational",
        reportUploaded: false,
      });

      assert.equal(status, "no_show");
    });
  });

  describe("Scheduled Report Reminder Notifications (Day 3 and Day 6)", () => {
    it("triggers reminder at day 3 when report is not yet uploaded", () => {
      const reminder = evaluateReportReminders({
        daysSinceVisit: 3,
        reportUploaded: false,
        remindersSent: 0,
      });

      assert.equal(reminder.shouldSend, true);
      assert.equal(reminder.reminderType, "first_reminder_day_3");
    });

    it("triggers urgent reminder at day 6 when report is still pending", () => {
      const reminder = evaluateReportReminders({
        daysSinceVisit: 6,
        reportUploaded: false,
        remindersSent: 1,
      });

      assert.equal(reminder.shouldSend, true);
      assert.equal(reminder.reminderType, "urgent_reminder_day_6");
    });

    it("does not trigger reminder if report is already uploaded", () => {
      const reminder = evaluateReportReminders({
        daysSinceVisit: 3,
        reportUploaded: true,
        remindersSent: 0,
      });

      assert.equal(reminder.shouldSend, false);
    });
  });

  describe("Safeguard: 'Not Educational' Observation Audit Handling", () => {
    it("creates strike record with status 'pending_admin_review' and DOES NOT count strike immediately", () => {
      const outcome = processPostVisitOutcome({
        visitId: "req-cbe-02",
        institutionId: "inst-cit-01",
        hostProfileId: "prof-foundry-mgr",
        attended: true,
        purposeObserved: "not_educational",
        evidenceNotes: "Students took photos for social media and left after 15 minutes; no faculty present.",
      });

      assert.equal(outcome.strikeRecordCreated, true);
      assert.equal(outcome.strikeStatus, "pending_admin_review");
      assert.equal(outcome.immediateTierPenaltyApplied, false, "Must never auto-penalize college before admin review");
    });
  });
});
