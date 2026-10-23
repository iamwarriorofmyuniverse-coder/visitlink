/**
 * Industry Capabilities & Resourceful Site Validation (Phase q1)
 *
 * STRICT ANTI-BIAS INVARIANTS:
 * 1. Facility age, company turnover/size, and photo aesthetics are strictly FORBIDDEN inputs.
 *    Small and mid-size units and long-established plants are treated with equal objective merit.
 * 2. Unverified claims count at a reduced weight (default 50%) until admin-verified.
 * 3. Minimum 4 real photos required (no stock photography).
 */

export const ALLOWED_PROCESS_STAGES = [
  "raw_material_prep",
  "primary_forming",
  "precision_machining",
  "surface_treatment",
  "assembly_integration",
  "quality_ndt_testing",
  "packaging_dispatch",
] as const;

export type ProcessStage = (typeof ALLOWED_PROCESS_STAGES)[number];

export const ALLOWED_TECHNOLOGY_LEVELS = [
  "manual",
  "semi_automated",
  "cnc",
  "robotics",
  "iot_industry_4_0",
  "other",
] as const;

export type TechnologyLevel = (typeof ALLOWED_TECHNOLOGY_LEVELS)[number];

export const ALLOWED_CERT_TYPES = [
  "ISO 9001",
  "ISO 14001",
  "ISO 45001",
  "IATF 16949",
  "NABL",
  "AS9100",
  "Other",
] as const;

export type CertificationType = (typeof ALLOWED_CERT_TYPES)[number];

export interface IndustryCertification {
  id?: string;
  cert_type: CertificationType;
  custom_cert_name?: string;
  cert_file_path: string;
  expiry_date: string; // YYYY-MM-DD
  admin_verification_status: "pending" | "verified" | "rejected";
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

export interface IndustryCapabilities {
  // Learning capabilities
  process_stages_visible: ProcessStage[];
  technology_levels: TechnologyLevel[];
  live_demo_available: boolean;
  hands_on_available: boolean;
  engineer_qa_available: boolean;
  guide_available: boolean;
  estimated_interactive_minutes: number; // 0 to 240
  student_observation_description: string;

  // Hosting readiness
  briefing_room: boolean;
  av_equipment: boolean;
  safe_visitor_walkway: boolean;
  restrooms_available: boolean;
  ppe_supplied: boolean;
  max_group_size: number;
  visitor_staff_count: number;

  // Photos & Listing
  photos: string[];

  // Certifications
  certifications: IndustryCertification[];

  // Admin Verified Claims Map (e.g. { 'safe_visitor_walkway': true, 'hands_on_available': true })
  admin_verified_claims?: Record<string, boolean>;

  // Listing Corrected status (from contradicted reports)
  listing_corrected_flag?: boolean;
  listing_corrected_reason?: string;
}

/**
 * STRICT FORBIDDEN INPUTS INVARIANT:
 * Fields that must NEVER be used in scoring, ranking, or capability evaluation.
 */
export const FORBIDDEN_SCORING_FIELDS = [
  "facility_age",
  "establishment_year",
  "company_size",
  "annual_turnover",
  "employee_count",
  "revenue",
  "photo_aesthetics",
  "image_beauty_score",
  "sponsored_boost",
  "paid_placement",
] as const;

/**
 * Asserts that an input payload or schema does not contain forbidden bias fields.
 * Throws an error if any forbidden input is detected.
 */
export function assertNoForbiddenInputs(data: Record<string, any>): void {
  for (const forbidden of FORBIDDEN_SCORING_FIELDS) {
    if (forbidden in data && data[forbidden] !== undefined) {
      throw new Error(
        `[ANTI-BIAS VIOLATION]: Field '${forbidden}' is strictly forbidden in Resourceful Sites scoring and ranking. Facility age, company size, and photo aesthetics cannot be evaluated.`
      );
    }
  }
}

/**
 * Validates industry capability declarations
 */
export function validateCapabilities(
  caps: Partial<IndustryCapabilities>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check forbidden inputs first
  try {
    assertNoForbiddenInputs(caps as Record<string, any>);
  } catch (err: any) {
    errors.push(err.message);
  }

  // Validate Process Stages
  if (caps.process_stages_visible) {
    for (const stage of caps.process_stages_visible) {
      if (!ALLOWED_PROCESS_STAGES.includes(stage)) {
        errors.push(`Invalid process stage '${stage}'.`);
      }
    }
  }

  // Validate Technology Levels
  if (caps.technology_levels) {
    for (const tech of caps.technology_levels) {
      if (!ALLOWED_TECHNOLOGY_LEVELS.includes(tech)) {
        errors.push(`Invalid technology level '${tech}'.`);
      }
    }
  }

  // Validate Interactive Minutes
  if (
    caps.estimated_interactive_minutes !== undefined &&
    (caps.estimated_interactive_minutes < 0 || caps.estimated_interactive_minutes > 240)
  ) {
    errors.push("estimated_interactive_minutes must be between 0 and 240 minutes.");
  }

  // Validate Group Size and Visitor Staff
  if (caps.max_group_size !== undefined && caps.max_group_size <= 0) {
    errors.push("max_group_size must be greater than 0.");
  }

  if (caps.visitor_staff_count !== undefined && caps.visitor_staff_count < 0) {
    errors.push("visitor_staff_count cannot be negative.");
  }

  // Validate Photos: Minimum 4 real photos required
  if (caps.photos) {
    if (!Array.isArray(caps.photos) || caps.photos.length < 4) {
      errors.push("At least 4 real facility photos must be provided (no stock imagery).");
    }
  }

  // Validate Certifications
  if (caps.certifications) {
    for (let i = 0; i < caps.certifications.length; i++) {
      const cert = caps.certifications[i];
      if (!ALLOWED_CERT_TYPES.includes(cert.cert_type)) {
        errors.push(`Certification #${i + 1} has invalid cert_type '${cert.cert_type}'.`);
      }
      if (!cert.cert_file_path || cert.cert_file_path.trim().length === 0) {
        errors.push(`Certification #${i + 1} is missing a certificate file path.`);
      }
      if (!cert.expiry_date || isNaN(Date.parse(cert.expiry_date))) {
        errors.push(`Certification #${i + 1} has an invalid expiry date.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Human-readable formatters
 */
export function getProcessStageLabel(stage: ProcessStage): string {
  switch (stage) {
    case "raw_material_prep":
      return "Raw Material Preparation";
    case "primary_forming":
      return "Primary Forming & Casting";
    case "precision_machining":
      return "Precision Machining (CNC/VMC)";
    case "surface_treatment":
      return "Surface Treatment & Heat Treatment";
    case "assembly_integration":
      return "Sub-Assembly & Integration";
    case "quality_ndt_testing":
      return "Quality Metrology & NDT Flaw Testing";
    case "packaging_dispatch":
      return "Industrial Packaging & Dispatch";
    default:
      return stage;
  }
}

export function getTechnologyLevelLabel(level: TechnologyLevel): string {
  switch (level) {
    case "manual":
      return "Manual Craftsmanship";
    case "semi_automated":
      return "Semi-Automated Lines";
    case "cnc":
      return "CNC Precision Machining";
    case "robotics":
      return "Robotic Automation Cells";
    case "iot_industry_4_0":
      return "IoT & Industry 4.0 Telemetry";
    case "other":
      return "Specialized Industrial Tooling";
    default:
      return level;
  }
}
