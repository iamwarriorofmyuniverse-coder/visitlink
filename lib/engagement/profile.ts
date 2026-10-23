/**
 * Student Engagement Profile Validation & Filtering (Phase p1)
 * Enforces declarative engagement elements, bounded interactive timing,
 * and strict scope guards against 'fun' or 'leisure' score drift.
 */

export const ALLOWED_INTERACTIVE_ELEMENTS = [
  "live_demo",
  "hands_on_activity",
  "q_and_a_engineers",
  "product_showcase",
] as const;

export type InteractiveElement = (typeof ALLOWED_INTERACTIVE_ELEMENTS)[number];

export interface IndustryEngagementProfile {
  interactive_elements: InteractiveElement[];
  q_and_a_available: boolean;
  estimated_interactive_minutes: number; // 0 to 240
  engagement_notes?: string;
}

export const PROHIBITED_LEISURE_FIELDS = [
  "fun_score",
  "fun_rating",
  "enjoyment_score",
  "enjoyment_rating",
  "entertainment_level",
  "tourism_rating",
  "sightseeing_score",
  "leisure_score",
];

export interface EngagementValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates industry engagement declarations with strict boundaries and anti-leisure safeguards
 */
export function validateEngagementProfile(
  profile: Partial<IndustryEngagementProfile> & Record<string, any>
): EngagementValidationResult {
  const errors: string[] = [];

  // Guardrail: Assert zero prohibited leisure / fun fields
  for (const forbidden of PROHIBITED_LEISURE_FIELDS) {
    if (forbidden in profile) {
      errors.push(`Prohibited field '${forbidden}' detected. VisitLink strictly forbids leisure or fun rating metrics.`);
    }
  }

  // 1. Interactive Elements Validation
  if (!Array.isArray(profile.interactive_elements)) {
    errors.push("interactive_elements must be an array of declared engagement types.");
  } else {
    for (const elem of profile.interactive_elements) {
      if (!ALLOWED_INTERACTIVE_ELEMENTS.includes(elem as InteractiveElement)) {
        errors.push(
          `Invalid interactive element '${elem}'. Allowed values are: ${ALLOWED_INTERACTIVE_ELEMENTS.join(", ")}`
        );
      }
    }
  }

  // 2. Q&A Available
  if (typeof profile.q_and_a_available !== "boolean") {
    errors.push("q_and_a_available must be a boolean flag.");
  }

  // 3. Estimated Interactive Minutes (0 to 240)
  if (
    typeof profile.estimated_interactive_minutes !== "number" ||
    !Number.isInteger(profile.estimated_interactive_minutes) ||
    profile.estimated_interactive_minutes < 0 ||
    profile.estimated_interactive_minutes > 240
  ) {
    errors.push("estimated_interactive_minutes must be an integer between 0 and 240 minutes.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats user-facing badge labels and descriptors for engagement elements
 */
export function formatEngagementBadge(element: InteractiveElement): {
  id: InteractiveElement;
  label: string;
  shortLabel: string;
  description: string;
} {
  switch (element) {
    case "hands_on_activity":
      return {
        id: "hands_on_activity",
        label: "Hands-on Activity",
        shortLabel: "Hands-on",
        description: "Students actively participate in guided laboratory, assembly, or tooling tasks.",
      };
    case "live_demo":
      return {
        id: "live_demo",
        label: "Live Demonstration",
        shortLabel: "Live Demo",
        description: "Engineers run live production line, casting, or testing machinery during the visit.",
      };
    case "q_and_a_engineers":
      return {
        id: "q_and_a_engineers",
        label: "Q&A with Engineers",
        shortLabel: "Engineer Q&A",
        description: "Dedicated question-and-answer period with plant engineers and technical staff.",
      };
    case "product_showcase":
      return {
        id: "product_showcase",
        label: "Product Showcase",
        shortLabel: "Showcase",
        description: "Guided inspection of finished engineering assemblies and quality metrology.",
      };
  }
}

/**
 * Evaluates whether a facility satisfies a selected engagement filter
 */
export function matchesEngagementFilter(
  facilityElements: InteractiveElement[] = [],
  filterKey: string = "all"
): boolean {
  if (!filterKey || filterKey === "all") return true;
  return facilityElements.includes(filterKey as InteractiveElement);
}
