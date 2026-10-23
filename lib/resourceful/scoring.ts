/**
 * Resourceful Sites Scoring Engine & Explain Views (Phase q2)
 *
 * Mathematically transparent, deterministic scoring based on declared and verified capabilities.
 * ZERO AI judgment, ZERO bias by facility age, company size, or photo appearance.
 *
 * Scores:
 * 1. Learning Value Score (0 to 100): Weighted sum of learning stages, tech levels, demo, hands-on, Q&A, guide.
 * 2. Hosting Readiness Score (0 to 100): Physical safety, walkways, restrooms, PPE, briefing room, staff, verified certs.
 *
 * UNVERIFIED CLAIM DISCOUNT:
 * Unverified claims count at a reduced weight (default 50% discount / 0.5 factor) until an admin verifies them.
 */

import {
  IndustryCapabilities,
  IndustryCertification,
  assertNoForbiddenInputs,
} from "./capabilities";

export interface ScoreBreakdownItem {
  id: string;
  label: string;
  pointsEarned: number;
  maxPoints: number;
  isVerified: boolean;
  notes: string;
}

export interface ScoreResult {
  score: number; // Final bounded score (0 to 100)
  rawScore: number;
  unverifiedDiscountApplied: boolean;
  breakdown: ScoreBreakdownItem[];
  penaltyPoints: number;
  penaltyReason?: string;
}

export interface LearningScoreWeights {
  max_stages_points: number; // 25
  points_per_stage: number; // 6.25
  max_technology_points: number; // 20
  technology_points: Record<string, number>;
  live_demo_points: number; // 15
  hands_on_points: number; // 15
  engineer_qa_points: number; // 10
  guide_available_points: number; // 10
  interactive_time_min_minutes: number; // 45
  interactive_time_points: number; // 5
  unverified_claim_discount: number; // 0.50
  contradicted_claim_penalty: number; // 15.0
}

export const DEFAULT_LEARNING_WEIGHTS: LearningScoreWeights = {
  max_stages_points: 25.0,
  points_per_stage: 6.25,
  max_technology_points: 20.0,
  technology_points: {
    manual: 5.0,
    semi_automated: 10.0,
    cnc: 15.0,
    robotics: 20.0,
    iot_industry_4_0: 20.0,
    other: 5.0,
  },
  live_demo_points: 15.0,
  hands_on_points: 15.0,
  engineer_qa_points: 10.0,
  guide_available_points: 10.0,
  interactive_time_min_minutes: 45,
  interactive_time_points: 5.0,
  unverified_claim_discount: 0.50,
  contradicted_claim_penalty: 15.0,
};

export interface HostingScoreWeights {
  safe_visitor_walkway_points: number; // 25
  restrooms_points: number; // 15
  ppe_supplied_points: number; // 15
  briefing_room_av_points: number; // 15
  briefing_room_only_points: number; // 8
  min_visitor_staff_count: number; // 2
  visitor_staff_points: number; // 10
  min_group_size_threshold: number; // 30
  group_capacity_points: number; // 10
  verified_certification_points: number; // 10
  unverified_claim_discount: number; // 0.50
}

export const DEFAULT_HOSTING_WEIGHTS: HostingScoreWeights = {
  safe_visitor_walkway_points: 25.0,
  restrooms_points: 15.0,
  ppe_supplied_points: 15.0,
  briefing_room_av_points: 15.0,
  briefing_room_only_points: 8.0,
  min_visitor_staff_count: 2,
  visitor_staff_points: 10.0,
  min_group_size_threshold: 30,
  group_capacity_points: 10.0,
  verified_certification_points: 10.0,
  unverified_claim_discount: 0.50,
};

/**
 * Checks if a specific claim key has been admin-verified
 */
function isClaimVerified(caps: IndustryCapabilities, claimKey: string): boolean {
  return caps.admin_verified_claims?.[claimKey] === true;
}

/**
 * Calculates Learning Value Score (0 to 100)
 */
export function calculateLearningValueScore(
  caps: IndustryCapabilities,
  customWeights: Partial<LearningScoreWeights> = {}
): ScoreResult {
  assertNoForbiddenInputs(caps as Record<string, any>);
  const weights: LearningScoreWeights = { ...DEFAULT_LEARNING_WEIGHTS, ...customWeights };
  const breakdown: ScoreBreakdownItem[] = [];
  const discountFactor = weights.unverified_claim_discount; // default 0.50

  // 1. Process Stages Visible (max 25 pts)
  const stageCount = caps.process_stages_visible?.length || 0;
  const stageMax = weights.max_stages_points;
  const stageEarnedRaw = Math.min(stageMax, stageCount * weights.points_per_stage);
  const stagesVerified = isClaimVerified(caps, "process_stages_visible");
  const stagePoints = stagesVerified ? stageEarnedRaw : stageEarnedRaw * discountFactor;

  breakdown.push({
    id: "process_stages",
    label: "Process Stages Visible",
    pointsEarned: Number(stagePoints.toFixed(2)),
    maxPoints: stageMax,
    isVerified: stagesVerified,
    notes: `${stageCount} visible manufacturing stages declared${stagesVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`,
  });

  // 2. Technology Level Tags (max 20 pts)
  const techLevels = caps.technology_levels || [];
  let techRawMax = 0;
  for (const t of techLevels) {
    const pts = weights.technology_points[t] || 0;
    if (pts > techRawMax) techRawMax = pts;
  }
  const techMax = weights.max_technology_points;
  const techVerified = isClaimVerified(caps, "technology_levels");
  const techPoints = techVerified ? techRawMax : techRawMax * discountFactor;

  breakdown.push({
    id: "technology_level",
    label: "Technology & Automation Level",
    pointsEarned: Number(techPoints.toFixed(2)),
    maxPoints: techMax,
    isVerified: techVerified,
    notes: techLevels.length > 0
      ? `Highest tech tier: ${techLevels.join(", ")}${techVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "No specialized technology tags declared.",
  });

  // 3. Live Demonstration (15 pts)
  const demoMax = weights.live_demo_points;
  const demoVerified = isClaimVerified(caps, "live_demo_available");
  let demoPoints = 0;
  if (caps.live_demo_available) {
    demoPoints = demoVerified ? demoMax : demoMax * discountFactor;
  }
  breakdown.push({
    id: "live_demo",
    label: "Live Demonstration Working Cell",
    pointsEarned: Number(demoPoints.toFixed(2)),
    maxPoints: demoMax,
    isVerified: demoVerified,
    notes: caps.live_demo_available
      ? `Active production demonstration provided${demoVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "No live demonstration declared.",
  });

  // 4. Hands-on Student Activity (15 pts)
  const handsOnMax = weights.hands_on_points;
  const handsOnVerified = isClaimVerified(caps, "hands_on_available");
  let handsOnPoints = 0;
  if (caps.hands_on_available) {
    handsOnPoints = handsOnVerified ? handsOnMax : handsOnMax * discountFactor;
  }
  breakdown.push({
    id: "hands_on",
    label: "Hands-on Student Activity",
    pointsEarned: Number(handsOnPoints.toFixed(2)),
    maxPoints: handsOnMax,
    isVerified: handsOnVerified,
    notes: caps.hands_on_available
      ? `Interactive student workshop or inspection activity${handsOnVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "Observation only (no hands-on activity).",
  });

  // 5. Direct Engineer Q&A Session (10 pts)
  const qaMax = weights.engineer_qa_points;
  const qaVerified = isClaimVerified(caps, "engineer_qa_available");
  let qaPoints = 0;
  if (caps.engineer_qa_available) {
    qaPoints = qaVerified ? qaMax : qaMax * discountFactor;
  }
  breakdown.push({
    id: "engineer_qa",
    label: "Direct Engineer Technical Q&A",
    pointsEarned: Number(qaPoints.toFixed(2)),
    maxPoints: qaMax,
    isVerified: qaVerified,
    notes: caps.engineer_qa_available
      ? `Session with plant engineers scheduled${qaVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "No dedicated engineer Q&A declared.",
  });

  // 6. Dedicated Technical Tour Guide (10 pts)
  const guideMax = weights.guide_available_points;
  const guideVerified = isClaimVerified(caps, "guide_available");
  let guidePoints = 0;
  if (caps.guide_available) {
    guidePoints = guideVerified ? guideMax : guideMax * discountFactor;
  }
  breakdown.push({
    id: "guide_available",
    label: "Dedicated Technical Tour Guide",
    pointsEarned: Number(guidePoints.toFixed(2)),
    maxPoints: guideMax,
    isVerified: guideVerified,
    notes: caps.guide_available
      ? `Dedicated guide assigned throughout the visit${guideVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "Self-guided / ad-hoc staff accompaniment.",
  });

  // 7. Interactive Time Allocation (5 pts for >= 45m)
  const timeMax = weights.interactive_time_points;
  const timeVerified = isClaimVerified(caps, "estimated_interactive_minutes");
  let timePoints = 0;
  const minutes = caps.estimated_interactive_minutes || 0;
  if (minutes >= weights.interactive_time_min_minutes) {
    timePoints = timeVerified ? timeMax : timeMax * discountFactor;
  }
  breakdown.push({
    id: "interactive_time",
    label: "Substantial Interactive Time (>= 45m)",
    pointsEarned: Number(timePoints.toFixed(2)),
    maxPoints: timeMax,
    isVerified: timeVerified,
    notes: minutes >= weights.interactive_time_min_minutes
      ? `${minutes} minutes interactive time allocated${timeVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : `${minutes} minutes declared (less than 45 min threshold).`,
  });

  // Calculate Subtotal
  let rawScore = breakdown.reduce((acc, item) => acc + item.pointsEarned, 0);

  // Contradicted claim penalty if applicable
  let penaltyPoints = 0;
  let penaltyReason: string | undefined;
  if (caps.listing_corrected_flag) {
    penaltyPoints = weights.contradicted_claim_penalty;
    penaltyReason = caps.listing_corrected_reason || "Confirmed listing inaccuracy reported by visiting coordinator.";
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore - penaltyPoints)));

  return {
    score: finalScore,
    rawScore: Number(rawScore.toFixed(2)),
    unverifiedDiscountApplied: breakdown.some((b) => !b.isVerified && b.pointsEarned > 0),
    breakdown,
    penaltyPoints,
    penaltyReason,
  };
}

/**
 * Validates whether an industry certification is active and verified
 */
export function isCertificationActiveAndVerified(cert: IndustryCertification, referenceDate = new Date()): boolean {
  if (cert.admin_verification_status !== "verified") return false;
  if (!cert.expiry_date) return false;
  const expiry = new Date(cert.expiry_date);
  return expiry >= referenceDate;
}

/**
 * Calculates Hosting Readiness Score (0 to 100)
 */
export function calculateHostingReadinessScore(
  caps: IndustryCapabilities,
  customWeights: Partial<HostingScoreWeights> = {}
): ScoreResult {
  assertNoForbiddenInputs(caps as Record<string, any>);
  const weights: HostingScoreWeights = { ...DEFAULT_HOSTING_WEIGHTS, ...customWeights };
  const breakdown: ScoreBreakdownItem[] = [];
  const discountFactor = weights.unverified_claim_discount; // default 0.50

  // 1. Safe Visitor Walkway (25 pts) - Critical Physical Safety Invariant
  const walkwayMax = weights.safe_visitor_walkway_points;
  const walkwayVerified = isClaimVerified(caps, "safe_visitor_walkway");
  let walkwayPoints = 0;
  if (caps.safe_visitor_walkway) {
    walkwayPoints = walkwayVerified ? walkwayMax : walkwayMax * discountFactor;
  }
  breakdown.push({
    id: "visitor_walkway",
    label: "Safe Visitor Walkway (Marked & Separated)",
    pointsEarned: Number(walkwayPoints.toFixed(2)),
    maxPoints: walkwayMax,
    isVerified: walkwayVerified,
    notes: caps.safe_visitor_walkway
      ? `Dedicated physical visitor safety gangway installed${walkwayVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "No designated visitor walkway declared.",
  });

  // 2. Student Restroom Facilities (15 pts)
  const restroomsMax = weights.restrooms_points;
  const restroomsVerified = isClaimVerified(caps, "restrooms_available");
  let restroomsPoints = 0;
  if (caps.restrooms_available) {
    restroomsPoints = restroomsVerified ? restroomsMax : restroomsMax * discountFactor;
  }
  breakdown.push({
    id: "restrooms",
    label: "Restrooms & Sanitation Facilities",
    pointsEarned: Number(restroomsPoints.toFixed(2)),
    maxPoints: restroomsMax,
    isVerified: restroomsVerified,
    notes: caps.restrooms_available
      ? `Clean on-site sanitation facilities available for student groups${restroomsVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "Restrooms not declared.",
  });

  // 3. PPE Supplied On-Site (15 pts)
  const ppeMax = weights.ppe_supplied_points;
  const ppeVerified = isClaimVerified(caps, "ppe_supplied");
  let ppePoints = 0;
  if (caps.ppe_supplied) {
    ppePoints = ppeVerified ? ppeMax : ppeMax * discountFactor;
  }
  breakdown.push({
    id: "ppe_supplied",
    label: "PPE Supplied by Host Facility",
    pointsEarned: Number(ppePoints.toFixed(2)),
    maxPoints: ppeMax,
    isVerified: ppeVerified,
    notes: caps.ppe_supplied
      ? `Host facility provides safety helmets, vests, and protective eyewear to students${ppeVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "Visiting institutions must bring all required PPE.",
  });

  // 4. Briefing Room & AV Equipment (15 pts max)
  const avMax = weights.briefing_room_av_points;
  const roomVerified = isClaimVerified(caps, "briefing_room");
  let roomPoints = 0;
  if (caps.briefing_room && caps.av_equipment) {
    roomPoints = roomVerified ? avMax : avMax * discountFactor;
  } else if (caps.briefing_room) {
    roomPoints = roomVerified ? weights.briefing_room_only_points : weights.briefing_room_only_points * discountFactor;
  }
  breakdown.push({
    id: "briefing_room",
    label: "Briefing Room with AV Projection",
    pointsEarned: Number(roomPoints.toFixed(2)),
    maxPoints: avMax,
    isVerified: roomVerified,
    notes: caps.briefing_room && caps.av_equipment
      ? `Dedicated orientation hall with projector/display${roomVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : caps.briefing_room
      ? `Briefing room available without AV equipment${roomVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : "No separate visitor orientation hall.",
  });

  // 5. Host Visitor Staff Count (10 pts for >= 2 staff)
  const staffMax = weights.visitor_staff_points;
  const staffVerified = isClaimVerified(caps, "visitor_staff_count");
  let staffPoints = 0;
  const staffCount = caps.visitor_staff_count || 0;
  if (staffCount >= weights.min_visitor_staff_count) {
    staffPoints = staffVerified ? staffMax : staffMax * discountFactor;
  }
  breakdown.push({
    id: "visitor_staff",
    label: "Dedicated Visitor Staff (>= 2 Personnel)",
    pointsEarned: Number(staffPoints.toFixed(2)),
    maxPoints: staffMax,
    isVerified: staffVerified,
    notes: staffCount >= weights.min_visitor_staff_count
      ? `${staffCount} plant personnel assigned to group supervision${staffVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : `${staffCount} visitor staff declared (minimum 2 recommended).`,
  });

  // 6. Group Capacity (10 pts for >= 30 students)
  const groupMax = weights.group_capacity_points;
  const groupVerified = isClaimVerified(caps, "max_group_size");
  let groupPoints = 0;
  const maxGroup = caps.max_group_size || 0;
  if (maxGroup >= weights.min_group_size_threshold) {
    groupPoints = groupVerified ? groupMax : groupMax * discountFactor;
  }
  breakdown.push({
    id: "group_capacity",
    label: "Group Capacity (>= 30 Students)",
    pointsEarned: Number(groupPoints.toFixed(2)),
    maxPoints: groupMax,
    isVerified: groupVerified,
    notes: maxGroup >= weights.min_group_size_threshold
      ? `Can accommodate groups of up to ${maxGroup} students${groupVerified ? " (admin verified)" : " (unverified claim: 50% weight)"}.`
      : `Max group size ${maxGroup} is under the standard 30-student batch threshold.`,
  });

  // 7. Verified Industry Quality / Safety Certifications (10 pts)
  const certs = caps.certifications || [];
  const activeVerifiedCerts = certs.filter((c) => isCertificationActiveAndVerified(c));
  const certsMax = weights.verified_certification_points;
  const certPoints = activeVerifiedCerts.length > 0 ? certsMax : 0;

  breakdown.push({
    id: "verified_certifications",
    label: "Verified Industry Certifications (ISO/IATF/NABL)",
    pointsEarned: Number(certPoints.toFixed(2)),
    maxPoints: certsMax,
    isVerified: activeVerifiedCerts.length > 0,
    notes: activeVerifiedCerts.length > 0
      ? `Verified active certifications: ${activeVerifiedCerts.map((c) => c.cert_type).join(", ")}.`
      : certs.length > 0
      ? "Certifications uploaded but pending admin verification or expired."
      : "No quality or safety certifications uploaded.",
  });

  const rawScore = breakdown.reduce((acc, item) => acc + item.pointsEarned, 0);
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    score: finalScore,
    rawScore: Number(rawScore.toFixed(2)),
    unverifiedDiscountApplied: breakdown.some((b) => !b.isVerified && b.pointsEarned > 0),
    breakdown,
    penaltyPoints: 0,
  };
}

export const computeLearningValueScore = calculateLearningValueScore;
export const computeHostingReadinessScore = calculateHostingReadinessScore;

