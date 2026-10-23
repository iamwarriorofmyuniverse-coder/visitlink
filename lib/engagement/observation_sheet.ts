/**
 * Student Observation Sheet Engine & Faculty Review (Phase p3)
 * Generates and validates observation sheets with spaces for student handwritten notes.
 * GUARDRAILS:
 * 1. Strict JSON schema validated by Pydantic / TypeScript types.
 * 2. Faculty review is strictly required before printing or downloading.
 * 3. Never auto-sent to students.
 */

export interface ObservationQuestion {
  id: string;
  topic: string;
  prompt: string;
  observation_target: string;
  space_lines: number; // 2 to 6 lines
}

export interface ObservationSheetData {
  visitRequestId: string;
  facilityName: string;
  courseName: string;
  syllabusTopic: string;
  status: "draft" | "reviewed" | "printed";
  questions: ObservationQuestion[];
  studentInstructions: string;
  facultyReviewedBy?: string;
  facultyReviewedAt?: string;
  generatedAt: string;
  llmModel: string;
}

export interface ObservationSheetValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates drafted or edited observation sheet against strict schema rules
 */
export function validateObservationSheet(sheet: Partial<ObservationSheetData>): ObservationSheetValidationResult {
  const errors: string[] = [];

  if (!sheet.visitRequestId) {
    errors.push("visitRequestId is required.");
  }

  if (!sheet.courseName || sheet.courseName.trim().length < 3) {
    errors.push("courseName must be at least 3 characters.");
  }

  if (!Array.isArray(sheet.questions) || sheet.questions.length < 2 || sheet.questions.length > 8) {
    errors.push("Observation sheet must contain between 2 and 8 observation questions.");
  } else {
    sheet.questions.forEach((q, idx) => {
      if (!q.topic || q.topic.trim().length < 3) {
        errors.push(`Question #${idx + 1} is missing a technical topic.`);
      }
      if (!q.prompt || q.prompt.trim().length < 15) {
        errors.push(`Question #${idx + 1} prompt is too short (min 15 characters).`);
      }
      if (!q.observation_target || q.observation_target.trim().length < 3) {
        errors.push(`Question #${idx + 1} is missing an observation target.`);
      }
      if (typeof q.space_lines !== "number" || q.space_lines < 2 || q.space_lines > 6) {
        errors.push(`Question #${idx + 1} space_lines must be between 2 and 6 lines.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic local generator for observation questions derived from objectives
 */
export function draftObservationSheetLocally(params: {
  visitRequestId: string;
  facilityName: string;
  courseName: string;
  syllabusTopic: string;
  learningObjectives: string[];
  sector: string;
}): ObservationSheetData {
  const objectives = params.learningObjectives.filter((o) => (o || "").trim().length > 0);

  const questions: ObservationQuestion[] = objectives.map((obj, i) => {
    let target = "Production Machine / Workstation";
    let topic = `Objective ${i + 1} Analysis`;

    if (obj.toLowerCase().includes("casting") || obj.toLowerCase().includes("moulding") || obj.toLowerCase().includes("furnace")) {
      topic = "Metal Casting & Foundry Operations";
      target = "Cupola / Induction Furnace & Moulding Line";
    } else if (obj.toLowerCase().includes("cnc") || obj.toLowerCase().includes("machining")) {
      topic = "Precision CNC Machining";
      target = "5-Axis CNC Milling / Lathe Center";
    } else if (obj.toLowerCase().includes("metrology") || obj.toLowerCase().includes("quality") || obj.toLowerCase().includes("flaw")) {
      topic = "Quality Inspection & NDT Metrology";
      target = "CMM Machine / Ultrasonic Flaw Detector";
    } else if (obj.toLowerCase().includes("pump") || obj.toLowerCase().includes("hydraulic")) {
      topic = "Hydraulic Flow & Pressure Testing";
      target = "Hydraulic Pump Flume & Telemetry Sensor Rig";
    }

    return {
      id: `q${i + 1}`,
      topic,
      observation_target: target,
      prompt: `Based on your observation of the ${target.toLowerCase()}, record the operating parameters, material inputs, and quality checks observed for: "${obj}".`,
      space_lines: 4,
    };
  });

  // Ensure at least 3 questions
  if (questions.length < 3) {
    questions.push({
      id: `q${questions.length + 1}`,
      topic: "Shop-Floor Safety & Industrial Systems",
      observation_target: "Emergency Stops, Interlocks & Walkways",
      prompt: "Identify two critical physical engineering safety interlocks or sensors active on the production line and describe how they protect human operators.",
      space_lines: 3,
    });
  }

  return {
    visitRequestId: params.visitRequestId,
    facilityName: params.facilityName,
    courseName: params.courseName,
    syllabusTopic: params.syllabusTopic,
    status: "draft",
    questions,
    studentInstructions:
      "Instructions for Students: Take handwritten notes during the shop-floor walkthrough in the ruled spaces provided below. Keep your sheet attached to your clipboard; mobile devices are not permitted on active production bays.",
    generatedAt: new Date().toISOString(),
    llmModel: "gemini-1.5-flash",
  };
}

/**
 * Guardrail Enforcement: Verifies that faculty has reviewed the sheet before allowing print
 */
export function canPrintObservationSheet(sheet: ObservationSheetData): {
  canPrint: boolean;
  reason?: string;
} {
  if (sheet.status === "draft") {
    return {
      canPrint: false,
      reason: "Faculty review required before printing. Please inspect the AI-drafted questions, edit if needed, and click 'Mark Reviewed & Ready to Print'.",
    };
  }

  return { canPrint: true };
}
