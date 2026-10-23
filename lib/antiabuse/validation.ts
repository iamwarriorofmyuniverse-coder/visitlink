/**
 * Educational Intent & Anti-Abuse Form Validation (Phase m1)
 * Enforces concrete academic learning goals, legitimate faculty credentials,
 * institutional email verification, and placeholder rejection.
 */

import { z } from "zod";
import crypto from "crypto";

// Common consumer free-mail domains
export const CONSUMER_FREEMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "rediffmail.com",
  "zoho.com",
  "yandex.com",
  "protonmail.com",
  "mail.com",
  "gmx.com",
]);

// Typical evasive or placeholder words used in low-intent / leisure applications
export const PLACEHOLDER_KEYWORDS = [
  "visit",
  "exposure",
  "general exposure",
  "industrial exposure",
  "fun",
  "tour",
  "picnic",
  "trip",
  "outing",
  "leisure",
  "sightseeing",
  "outstation",
  "hangout",
  "n/a",
  "na",
  "none",
  "etc",
  "just visit",
  "chill",
  "enjoy",
];

export interface EducationalIntentInput {
  learning_objectives: string[];
  course_name: string;
  semester_class: string;
  syllabus_topic: string;
  pre_visit_agenda: string;
  expected_deliverable: "report" | "quiz" | "project" | "case_study";
  faculty_name: string;
  faculty_email: string;
  faculty_phone: string;
  allow_freemail?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface IntentValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Checks if an email address belongs to a consumer free-mail provider
 */
export function isFreemailDomain(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase().trim();
  return CONSUMER_FREEMAIL_DOMAINS.has(domain);
}

/**
 * Validates faculty-in-charge email address
 */
export function validateFacultyEmail(
  email: string,
  allowFreemail: boolean = false
): { valid: boolean; error?: string } {
  if (!email || !email.includes("@")) {
    return { valid: false, error: "Valid faculty email address required" };
  }

  if (isFreemailDomain(email) && !allowFreemail) {
    return {
      valid: false,
      error:
        "Faculty must use an official institutional email address (e.g., @psgtech.edu, @cit.edu.in). Consumer email domains (@gmail.com, @yahoo.com) are rejected to prevent abuse unless approved by an admin override.",
    };
  }

  return { valid: true };
}

/**
 * Checks if a string contains superficial placeholder language without technical substance
 */
export function containsPlaceholderText(text: string): boolean {
  if (!text) return true;
  const cleaned = text.trim().toLowerCase();

  // If text is extremely short or exact match with placeholder
  if (PLACEHOLDER_KEYWORDS.includes(cleaned)) return true;

  // Check multi-word phrases
  for (const phrase of PLACEHOLDER_KEYWORDS) {
    if (phrase.includes(" ") && cleaned.includes(phrase)) {
      return true;
    }
  }

  // If text has multiple placeholder words
  const words = cleaned.replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const placeholderHits = words.filter((w) => PLACEHOLDER_KEYWORDS.includes(w)).length;
  if (placeholderHits >= 2) return true;
  if (placeholderHits >= 1 && words.length <= 5) return true;

  return false;
}

/**
 * Validates the full educational intent payload against anti-abuse quality rules
 */
export function validateEducationalIntent(
  payload: EducationalIntentInput
): IntentValidationResult {
  const errors: ValidationError[] = [];

  // 1. Learning Objectives (min 2, each min 30 chars, no placeholders)
  if (!Array.isArray(payload.learning_objectives) || payload.learning_objectives.length < 2) {
    errors.push({
      field: "learning_objectives",
      message: "At least 2 concrete learning objectives required.",
    });
  } else {
    payload.learning_objectives.forEach((obj, idx) => {
      const trimmed = (obj || "").trim();
      if (trimmed.length < 30) {
        errors.push({
          field: "learning_objectives",
          message: `Objective #${idx + 1} must be at least 30 characters explaining what students will study.`,
        });
      } else if (containsPlaceholderText(trimmed)) {
        errors.push({
          field: "learning_objectives",
          message: `Objective #${idx + 1} contains generic placeholder phrasing ('${trimmed}'). Please detail specific engineering/scientific concepts.`,
        });
      }
    });
  }

  // 2. Course Name & Semester
  if (!payload.course_name || payload.course_name.trim().length < 3) {
    errors.push({
      field: "course_name",
      message: "Course or subject title is required (minimum 3 characters).",
    });
  } else if (containsPlaceholderText(payload.course_name)) {
    errors.push({
      field: "course_name",
      message: "Course title cannot be placeholder text.",
    });
  }

  if (!payload.semester_class || payload.semester_class.trim().length < 2) {
    errors.push({
      field: "semester_class",
      message: "Target class / semester is required.",
    });
  }

  // 3. Syllabus Topic
  if (!payload.syllabus_topic || payload.syllabus_topic.trim().length < 10) {
    errors.push({
      field: "syllabus_topic",
      message: "Specific syllabus topic linked to this visit must be at least 10 characters.",
    });
  } else if (containsPlaceholderText(payload.syllabus_topic)) {
    errors.push({
      field: "syllabus_topic",
      message: "Syllabus topic cannot be placeholder text.",
    });
  }

  // 4. Pre-Visit Agenda
  if (!payload.pre_visit_agenda || payload.pre_visit_agenda.trim().length < 40) {
    errors.push({
      field: "pre_visit_agenda",
      message:
        "Pre-visit agenda must be at least 40 characters detailing the step-by-step plant observations and schedule.",
    });
  } else if (containsPlaceholderText(payload.pre_visit_agenda)) {
    errors.push({
      field: "pre_visit_agenda",
      message: "Pre-visit agenda cannot contain leisure or sightseeing references.",
    });
  }

  // 5. Faculty in Charge
  if (!payload.faculty_name || payload.faculty_name.trim().length < 3) {
    errors.push({
      field: "faculty_name",
      message: "Faculty-in-charge full name is required.",
    });
  }

  const emailCheck = validateFacultyEmail(payload.faculty_email, payload.allow_freemail);
  if (!emailCheck.valid) {
    errors.push({
      field: "faculty_email",
      message: emailCheck.error!,
    });
  }

  const phoneRegex = /^\+?[0-9]{10,14}$/;
  if (!payload.faculty_phone || !phoneRegex.test(payload.faculty_phone.replace(/[\s-]/g, ""))) {
    errors.push({
      field: "faculty_phone",
      message: "Valid faculty contact mobile number required (10-14 digits).",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generates an HMAC-signed faculty email confirmation token
 */
export function generateFacultyVerificationToken(
  requestId: string,
  facultyEmail: string,
  secret: string = "visitlink-faculty-secret-key-2026"
): string {
  const timestamp = Date.now();
  const raw = `${requestId}:${facultyEmail.toLowerCase().trim()}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return Buffer.from(`${raw}:${hmac}`).toString("base64url");
}

/**
 * Validates a faculty email confirmation token
 */
export function verifyFacultyVerificationToken(
  token: string,
  expectedRequestId: string,
  secret: string = "visitlink-faculty-secret-key-2026",
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): { valid: boolean; email?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { valid: false };

    const [reqId, email, timeStr, receivedHmac] = parts;
    if (reqId !== expectedRequestId) return { valid: false };

    const timestamp = parseInt(timeStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return { valid: false };
    }

    const raw = `${reqId}:${email}:${timeStr}`;
    const expectedHmac = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
      return { valid: true, email };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}
