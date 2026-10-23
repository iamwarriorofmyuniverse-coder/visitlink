/**
 * Verified Ratings & Reviews Engine (Phase r1)
 *
 * Enforces:
 * 1. Coordinator can only rate an industry after visit reaches 'completed' (industry-confirmed attendance).
 * 2. 5 Dimensions: learning_value, hosting_organisation, staff_guide_quality, safety, listing_accuracy (1-5 each).
 * 3. Overall rating is STRICTLY computed server-side as the arithmetic mean of the 5 dimensions.
 *    Client-supplied overall rating is never trusted or accepted.
 * 4. 7-day edit window from visit completion.
 * 5. Cooldown: Minimum 1 hour post-visit completion before submitting rating.
 */

export interface CoordinatorIndustryRatingInput {
  visit_request_id: string;
  visit_status: string; // Must be 'completed'
  visit_completed_at: string;
  learning_value_rating: number; // 1 to 5
  hosting_organisation_rating: number; // 1 to 5
  staff_guide_quality_rating: number; // 1 to 5
  safety_rating: number; // 1 to 5
  listing_accuracy_rating: number; // 1 to 5
  would_visit_again?: boolean;
  review_text?: string; // Max 500 chars
}

export interface StoredIndustryReview {
  id: string;
  visit_request_id: string;
  industry_id: string;
  institution_id: string;
  coordinator_profile_id: string;
  learning_value_rating: number;
  hosting_organisation_rating: number;
  staff_guide_quality_rating: number;
  safety_rating: number;
  listing_accuracy_rating: number;
  overall_rating: number; // Server-computed mean of the 5 dimensions
  would_visit_again: boolean;
  review_text?: string;
  is_contradicted_claim: boolean;
  moderation_status: "published" | "flagged_pii" | "hidden_by_admin";
  moderation_reason?: string;
  is_disputed: boolean;
  editable_until: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateInstitutionRatingInput {
  visit_request_id: string;
  visit_status: string; // Must be 'completed'
  punctuality_rating: number; // 1 to 5
  discipline_rating: number; // 1 to 5
  preparedness_rating: number; // 1 to 5
  headcount_accuracy_rating: number; // 1 to 5
  confidential_feedback?: string;
}

export interface StoredPrivateInstitutionRating {
  id: string;
  visit_request_id: string;
  institution_id: string;
  industry_id: string;
  industry_manager_profile_id: string;
  punctuality_rating: number;
  discipline_rating: number;
  preparedness_rating: number;
  headcount_accuracy_rating: number;
  overall_rating: number; // Server-computed mean of 4 dimensions
  confidential_feedback?: string;
  created_at: string;
}

/**
 * Calculates server-side overall rating from the 5 coordinator dimensions
 */
export function calculateServerOverallRating(dims: {
  learning_value_rating: number;
  hosting_organisation_rating: number;
  staff_guide_quality_rating: number;
  safety_rating: number;
  listing_accuracy_rating: number;
}): number {
  const sum =
    dims.learning_value_rating +
    dims.hosting_organisation_rating +
    dims.staff_guide_quality_rating +
    dims.safety_rating +
    dims.listing_accuracy_rating;
  return Number((sum / 5.0).toFixed(2));
}

/**
 * Calculates server-side overall rating for private institution rating (4 dimensions)
 */
export function calculatePrivateInstitutionOverallRating(dims: {
  punctuality_rating: number;
  discipline_rating: number;
  preparedness_rating: number;
  headcount_accuracy_rating: number;
}): number {
  const sum =
    dims.punctuality_rating +
    dims.discipline_rating +
    dims.preparedness_rating +
    dims.headcount_accuracy_rating;
  return Number((sum / 4.0).toFixed(2));
}

/**
 * Validates coordinator rating input
 */
export function validateCoordinatorRatingInput(
  input: Partial<CoordinatorIndustryRatingInput>,
  currentDate = new Date()
): { isValid: boolean; errors: string[]; serverOverallRating?: number } {
  const errors: string[] = [];

  // Enforce completed verified visit constraint
  if (!input.visit_status || input.visit_status !== "completed") {
    errors.push(
      `Cannot submit review: Visit must be confirmed as 'completed' by industry host. Current status: '${input.visit_status || "none"}'.`
    );
  }

  // 1-hour Cooldown check
  if (input.visit_completed_at) {
    const completedAt = new Date(input.visit_completed_at);
    const diffHours = (currentDate.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
    if (diffHours < 1.0 && diffHours >= 0) {
      errors.push(
        "Cooldown in effect: Ratings can only be submitted 1 hour after visit completion to ensure thoughtful evaluation."
      );
    }
  }

  const dimensions = [
    { name: "learning_value_rating", val: input.learning_value_rating },
    { name: "hosting_organisation_rating", val: input.hosting_organisation_rating },
    { name: "staff_guide_quality_rating", val: input.staff_guide_quality_rating },
    { name: "safety_rating", val: input.safety_rating },
    { name: "listing_accuracy_rating", val: input.listing_accuracy_rating },
  ];

  for (const d of dimensions) {
    if (typeof d.val !== "number" || isNaN(d.val) || d.val < 1 || d.val > 5 || !Number.isInteger(d.val)) {
      errors.push(`Field '${d.name}' must be an integer between 1 and 5.`);
    }
  }

  if (input.review_text && input.review_text.length > 500) {
    errors.push("Review text cannot exceed 500 characters.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const serverOverallRating = calculateServerOverallRating({
    learning_value_rating: input.learning_value_rating!,
    hosting_organisation_rating: input.hosting_organisation_rating!,
    staff_guide_quality_rating: input.staff_guide_quality_rating!,
    safety_rating: input.safety_rating!,
    listing_accuracy_rating: input.listing_accuracy_rating!,
  });

  return {
    isValid: true,
    errors: [],
    serverOverallRating,
  };
}

/**
 * Validates private institution rating input (4 dimensions)
 */
export function validatePrivateInstitutionRatingInput(
  input: Partial<PrivateInstitutionRatingInput>
): { isValid: boolean; errors: string[]; serverOverallRating?: number } {
  const errors: string[] = [];

  if (!input.visit_status || input.visit_status !== "completed") {
    errors.push("Cannot rate institution: Visit must reach 'completed' status.");
  }

  const dimensions = [
    { name: "punctuality_rating", val: input.punctuality_rating },
    { name: "discipline_rating", val: input.discipline_rating },
    { name: "preparedness_rating", val: input.preparedness_rating },
    { name: "headcount_accuracy_rating", val: input.headcount_accuracy_rating },
  ];

  for (const d of dimensions) {
    if (typeof d.val !== "number" || isNaN(d.val) || d.val < 1 || d.val > 5 || !Number.isInteger(d.val)) {
      errors.push(`Field '${d.name}' must be an integer between 1 and 5.`);
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const serverOverallRating = calculatePrivateInstitutionOverallRating({
    punctuality_rating: input.punctuality_rating!,
    discipline_rating: input.discipline_rating!,
    preparedness_rating: input.preparedness_rating!,
    headcount_accuracy_rating: input.headcount_accuracy_rating!,
  });

  return {
    isValid: true,
    errors: [],
    serverOverallRating,
  };
}
