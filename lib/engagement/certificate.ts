/**
 * Client-Side Participation Certificate Generator (Phase p5)
 * Allows faculty coordinators to generate official participation certificates.
 * STRICT PRIVACY REQUIREMENT:
 * Student names are entered locally by faculty at print time and NEVER stored by the platform.
 */

export interface CertificateData {
  institutionName: string;
  facilityName: string;
  visitDate: string;
  departmentCourse: string;
  learningObjectives: string[];
}

/**
 * Validates planned social break minutes (0 to 30 minutes, capped)
 */
export function validateSocialBreakMinutes(minutes: number): {
  isValid: boolean;
  sanitizedMinutes: number;
  error?: string;
} {
  if (typeof minutes !== "number" || isNaN(minutes)) {
    return { isValid: false, sanitizedMinutes: 0, error: "Minutes must be a valid number" };
  }

  const bounded = Math.max(0, Math.min(30, Math.round(minutes)));

  if (minutes < 0 || minutes > 30) {
    return {
      isValid: false,
      sanitizedMinutes: bounded,
      error: "Planned social break must be between 0 and 30 minutes.",
    };
  }

  return { isValid: true, sanitizedMinutes: bounded };
}

/**
 * Formats printable certificate details
 */
export function buildCertificateTemplate(params: {
  institutionName: string;
  facilityName: string;
  visitDate: string;
  departmentCourse: string;
  learningObjectives: string[];
}): CertificateData {
  return {
    institutionName: params.institutionName || "Educational Institution",
    facilityName: params.facilityName || "Host Industrial Facility",
    visitDate: params.visitDate || new Date().toISOString().split("T")[0],
    departmentCourse: params.departmentCourse || "Department of Engineering",
    learningObjectives: params.learningObjectives || [],
  };
}
