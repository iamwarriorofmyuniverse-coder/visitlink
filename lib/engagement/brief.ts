/**
 * Pre-Visit Student Brief Data Model & Sanitization (Phase p2)
 * Generates an educational, shareable, one-page brief for students & parents.
 * GUARANTEE: Zero student personal data, zero student names, zero consent documents.
 */

export interface PreVisitBriefData {
  visitId: string;
  facilityName: string;
  sector: string;
  location: string;
  visitDateFormatted: string;
  slotTime: string;
  industryOverview: string;
  whatStudentsWillObserve: string[];
  learningObjectives: string[];
  safetyRules: string[];
  mandatoryPpe: string[];
  dressCode: string;
  reflectionPrompts: string[];
  expiresAt: string;
  generatedAt: string;
}

/**
 * Derives 3 to 5 technical reflection prompts for students to observe
 */
export function generateReflectionPrompts(
  sector: string,
  objectives: string[] = []
): string[] {
  const genericPrompts = [
    "How does the shop-floor production sequence align with the flowcharts and theoretical principles in your textbook?",
    "Observe the quality inspection and tolerance verification stage: what instruments or sensors are used to catch defective parts?",
    "Notice the worker safety protocols and yellow walkway boundaries: what engineering safeguards protect operators from high temperatures or moving parts?",
    "What waste minimization, metal recycling, or environmental management practices can you identify across the plant?",
  ];

  if (sector === "foundry" || sector === "diecasting") {
    return [
      "Observe the molten metal pouring temperature and ladle transfer: how do engineers prevent thermal oxidation and air entrapment?",
      "Examine the sand mould cores: how does core venting allow gases to escape during solidification to prevent blowholes?",
      "During non-destructive testing (NDT), what criteria determine whether a casting meets automotive aerospace tolerances?",
      genericPrompts[2],
    ];
  }

  if (sector === "pumps" || sector === "compressors") {
    return [
      "Observe the dynamic balancing of rotating shafts and impellers: why is balance critical for hydraulic longevity?",
      "During the pump flume or compressor flow test, how do telemetry sensors measure head pressure vs flow rate in real time?",
      "Notice the automated stator winding and insulation: what prevents electrical breakdown during heavy duty operation?",
      genericPrompts[1],
    ];
  }

  return genericPrompts;
}

/**
 * Builds the sanitized, shareable Pre-Visit Student Brief
 * STRICT PRIVACY AUDIT: Strips out any student names, mobile contacts, or consent URLs
 */
export function buildPreVisitBrief(
  facility: {
    name: string;
    sector: string;
    city?: string;
    address?: string;
    highlights?: string;
    ppe_list?: string[];
    dress_code?: string;
    engagement_notes?: string;
  },
  request: {
    id: string;
    visit_date: string;
    slot_window?: string;
    learning_objectives?: string[];
    course_name?: string;
    syllabus_topic?: string;
    pre_visit_agenda?: string;
  },
  tokenExpiryIso: string
): PreVisitBriefData {
  // Format visit date
  const dateObj = new Date(request.visit_date);
  const formattedDate = dateObj.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Extract what students will observe
  const observations = [
    ...(facility.highlights ? facility.highlights.split(",").map((s) => s.trim()) : []),
    ...(facility.engagement_notes ? [facility.engagement_notes] : []),
  ];

  // Standard safety guidelines
  const safetyRules = [
    "Stay strictly within designated yellow visitor walkways at all times.",
    "Do not touch any moving machinery, electrical control panels, or hot surfaces.",
    "Wear mandatory PPE throughout the plant walkthrough.",
    "Strictly follow all instructions and hand signals given by the plant safety officer.",
    "Mobile photography and video recording are restricted on active production lines.",
  ];

  const mandatoryPpe = facility.ppe_list && facility.ppe_list.length > 0
    ? facility.ppe_list
    : ["Steel-toe safety shoes", "Safety goggles", "Hard hat / Helmet"];

  const dressCode = facility.dress_code ||
    "Strict long trousers and thick cotton shirts. No synthetic garments, loose ties, or open-toed footwear permitted.";

  const reflectionPrompts = generateReflectionPrompts(
    facility.sector,
    request.learning_objectives || []
  );

  return {
    visitId: request.id,
    facilityName: facility.name,
    sector: facility.sector,
    location: facility.address ? `${facility.address}, ${facility.city || "Coimbatore"}` : `${facility.city || "Coimbatore"} Industrial Hub`,
    visitDateFormatted: formattedDate,
    slotTime: request.slot_window || "10:00 AM - 1:00 PM",
    industryOverview: facility.highlights || "Advanced manufacturing and industrial operations center.",
    whatStudentsWillObserve: observations,
    learningObjectives: request.learning_objectives || [
      "Understand modern industrial engineering processes and quality metrology.",
      "Observe shop-floor machinery safety and lean manufacturing operations.",
    ],
    safetyRules,
    mandatoryPpe,
    dressCode,
    reflectionPrompts,
    expiresAt: tokenExpiryIso,
    generatedAt: new Date().toISOString(),
  };
}
