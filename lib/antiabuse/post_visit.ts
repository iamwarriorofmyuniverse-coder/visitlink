/**
 * Post-Visit Verification & Expiry Flow (Phase m2)
 * Handles post-visit confirmations, attendance records, engagement scoring,
 * 7-day report submission lifecycle, and safe admin-queued flag generation.
 */

export interface IndustryConfirmationInput {
  attended: boolean;
  actual_headcount: number;
  industry_engagement_rating: number; // 1-5
  purpose_observed: "educational" | "mixed" | "not_educational";
  industry_post_visit_notes?: string;
}

export interface PostVisitValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export type PostVisitStatus =
  | "pending_industry_verification"
  | "completed"
  | "no_show"
  | "unverified";

/**
 * Validates industry manager's post-visit confirmation input
 */
export function validateIndustryConfirmation(
  input: IndustryConfirmationInput
): PostVisitValidationResult {
  const errors: { field: string; message: string }[] = [];

  if (typeof input.attended !== "boolean") {
    errors.push({
      field: "attended",
      message: "Attendance confirmation is required (Yes/No).",
    });
  }

  if (input.attended) {
    if (typeof input.actual_headcount !== "number" || input.actual_headcount < 0) {
      errors.push({
        field: "actual_headcount",
        message: "Actual headcount must be a valid positive number.",
      });
    }

    if (
      typeof input.industry_engagement_rating !== "number" ||
      input.industry_engagement_rating < 1 ||
      input.industry_engagement_rating > 5
    ) {
      errors.push({
        field: "industry_engagement_rating",
        message: "Engagement rating must be an integer between 1 and 5.",
      });
    }

    if (!["educational", "mixed", "not_educational"].includes(input.purpose_observed)) {
      errors.push({
        field: "purpose_observed",
        message: "Purpose observed must be one of: 'educational', 'mixed', or 'not_educational'.",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Determines new visit request lifecycle status according to the 10-day deadline rule
 */
export function determinePostVisitStatus(params: {
  industryConfirmed: boolean;
  daysElapsed: number;
  attended?: boolean;
  purposeObserved?: string;
  reportUploaded?: boolean;
  industryDeadlineDays?: number;
}): PostVisitStatus {
  const deadlineDays = params.industryDeadlineDays ?? 10;

  // Rule: If no confirmation within 10 days -> status becomes "unverified"
  if (!params.industryConfirmed) {
    if (params.daysElapsed >= deadlineDays) {
      return "unverified";
    }
    return "pending_industry_verification";
  }

  // If industry confirmed non-attendance -> "no_show"
  if (params.attended === false) {
    return "no_show";
  }

  // Request status "completed" is only reached AFTER industry confirmation
  return "completed";
}

/**
 * Evaluates whether automated report reminder notifications should be dispatched
 */
export function evaluateReportReminders(params: {
  daysSinceVisit: number;
  reportUploaded: boolean;
  remindersSent: number;
}): {
  shouldSend: boolean;
  reminderType?: "first_reminder_day_3" | "urgent_reminder_day_6";
} {
  if (params.reportUploaded) {
    return { shouldSend: false };
  }

  if (params.daysSinceVisit >= 6 && params.remindersSent < 2) {
    return {
      shouldSend: true,
      reminderType: "urgent_reminder_day_6",
    };
  }

  if (params.daysSinceVisit >= 3 && params.remindersSent < 1) {
    return {
      shouldSend: true,
      reminderType: "first_reminder_day_3",
    };
  }

  return { shouldSend: false };
}

export interface PostVisitOutcome {
  strikeRecordCreated: boolean;
  strikeStatus?: "pending_admin_review";
  strikeType?: "not_educational" | "no_show";
  immediateTierPenaltyApplied: boolean;
}

/**
 * Safely processes post-visit flags, ensuring one-sided complaints do not auto-penalize institutions
 */
export function processPostVisitOutcome(params: {
  visitId: string;
  institutionId: string;
  hostProfileId: string;
  attended: boolean;
  purposeObserved: "educational" | "mixed" | "not_educational";
  evidenceNotes?: string;
}): PostVisitOutcome {
  // If no-show observed
  if (!params.attended) {
    return {
      strikeRecordCreated: true,
      strikeStatus: "pending_admin_review",
      strikeType: "no_show",
      immediateTierPenaltyApplied: false,
    };
  }

  // If industry reported "Not educational"
  if (params.purposeObserved === "not_educational") {
    return {
      strikeRecordCreated: true,
      strikeStatus: "pending_admin_review",
      strikeType: "not_educational",
      immediateTierPenaltyApplied: false,
    };
  }

  return {
    strikeRecordCreated: false,
    immediateTierPenaltyApplied: false,
  };
}
