import fs from "fs";
import path from "path";
import { computeLearningValueScore, computeHostingReadinessScore } from "../lib/resourceful/scoring";
import { calculateBayesianRating } from "../lib/ratings/bayesian";

const catalogPath = path.resolve(__dirname, "../supabase/seed_catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const enhancedIndustries = catalog.industries.map((ind: any, index: number) => {
  // Determine realistic visits count: some new (<3), some established (>=5)
  const isNew = index % 4 === 0; // index 0, 4, 8, 12, 16 are new (<3 visits)
  const visitsCount = isNew ? (index % 3 === 0 ? 1 : 2) : 5 + (index % 10);

  // Sector-tailored process stages and tech levels
  let stages = ["raw_material_prep", "precision_machining", "quality_ndt_testing", "packaging_dispatch"];
  let techLevels = ["cnc", "semi_automated"];

  if (ind.sector === "foundry") {
    stages = ["raw_material_prep", "primary_forming", "surface_treatment", "quality_ndt_testing"];
    techLevels = ["semi_automated", "manual"];
  } else if (ind.sector === "robotics" || ind.sector === "research_lab") {
    stages = ["assembly_integration", "quality_ndt_testing", "packaging_dispatch"];
    techLevels = ["robotics", "iot_industry_4_0"];
  } else if (ind.sector === "automotive") {
    stages = ["assembly_integration", "quality_ndt_testing", "packaging_dispatch"];
    techLevels = ["cnc", "iot_industry_4_0", "semi_automated"];
  }

  const liveDemo = ind.interactive_elements?.includes("live_demo") ?? true;
  const handsOn = ind.interactive_elements?.includes("hands_on_activity") ?? (index % 2 === 1);
  const qaAvailable = ind.q_and_a_available ?? true;
  const guideAvailable = true;
  const interactiveMinutes = ind.estimated_interactive_minutes || 60;

  // Realistic hosting readiness
  const safeWalkway = true;
  const restrooms = true;
  const ppe = ind.sector === "foundry" || ind.sector === "manufacturing" ? true : index % 3 !== 0;
  const briefingRoom = true;
  const avEquip = index % 5 !== 0;
  const staffCount = 2 + (index % 3);
  const maxGroup = ind.max_group_size || 40;

  const certType = index % 3 === 0 ? "ISO 9001" : index % 3 === 1 ? "IATF 16949" : "ISO 14001";
  const certifications = [
    {
      cert_type: certType,
      cert_file_path: `/storage/certs/${ind.readable_id}.pdf`,
      expiry_date: "2027-12-31",
      admin_verification_status: "verified",
      verified_at: "2026-01-15T10:00:00Z",
    },
  ];

  const adminVerifiedClaims: Record<string, boolean> = {
    safe_visitor_walkway: true,
    restrooms_available: true,
    ppe_supplied: ppe,
    briefing_room: briefingRoom,
    live_demo_available: liveDemo,
    hands_on_available: handsOn,
  };

  const photos = [
    `/images/facilities/${ind.readable_id}-1.jpg`,
    `/images/facilities/${ind.readable_id}-2.jpg`,
    `/images/facilities/${ind.readable_id}-3.jpg`,
    `/images/facilities/${ind.readable_id}-4.jpg`,
  ];

  const capabilityInput = {
    process_stages_visible: stages as any,
    technology_levels: techLevels as any,
    live_demo_available: liveDemo,
    hands_on_available: handsOn,
    engineer_qa_available: qaAvailable,
    guide_available: guideAvailable,
    estimated_interactive_minutes: interactiveMinutes,
    student_observation_description: ind.highlights || "Detailed walkthrough of manufacturing and testing floor.",
    briefing_room: briefingRoom,
    av_equipment: avEquip,
    safe_visitor_walkway: safeWalkway,
    restrooms_available: restrooms,
    ppe_supplied: ppe,
    max_group_size: maxGroup,
    visitor_staff_count: staffCount,
    photos,
    certifications: certifications as any,
    admin_verified_claims: adminVerifiedClaims,
    listing_corrected_flag: index === 7, // 1 facility with corrected listing for realistic anti-gaming UI testing
    listing_corrected_reason: index === 7 ? "Post-visit report indicated CNC milling cell was undergoing maintenance during visit." : undefined,
  };

  const learningScore = computeLearningValueScore(capabilityInput);
  const hostingScore = computeHostingReadinessScore(capabilityInput);

  // Generate historical ratings
  const sampleRatings = [];
  for (let r = 0; r < visitsCount; r++) {
    const baseScore = 4.0 + ((r * 7 + index) % 11) / 10.0; // 4.0 to 5.0
    const clampedScore = Math.min(5.0, Math.max(3.5, Math.round(baseScore * 10) / 10));
    sampleRatings.push({
      id: `rev-${ind.readable_id}-${r}`,
      overall_rating: clampedScore,
      learning_value_rating: clampedScore >= 4.5 ? 5 : 4,
      hosting_organisation_rating: clampedScore >= 4.0 ? 5 : 4,
      staff_guide_quality_rating: 5,
      safety_rating: ppe ? 5 : 4,
      listing_accuracy_rating: clampedScore >= 4.2 ? 5 : 4,
      created_at: `2026-0${Math.max(1, (r % 9) + 1)}-15T10:00:00Z`,
    });
  }

  const bayesian = calculateBayesianRating(sampleRatings);

  return {
    ...ind,
    process_stages_visible: stages,
    technology_levels: techLevels,
    live_demo_available: liveDemo,
    hands_on_available: handsOn,
    engineer_qa_available: qaAvailable,
    guide_available: guideAvailable,
    safe_visitor_walkway: safeWalkway,
    restrooms_available: restrooms,
    ppe_supplied: ppe,
    briefing_room: briefingRoom,
    av_equipment: avEquip,
    visitor_staff_count: staffCount,
    photos,
    certifications,
    admin_verified_claims: adminVerifiedClaims,
    listing_corrected_flag: capabilityInput.listing_corrected_flag,
    listing_corrected_reason: capabilityInput.listing_corrected_reason,
    verified_visits_count: visitsCount,
    learning_value_score: learningScore.score,
    hosting_readiness_score: hostingScore.score,
    verified_experience_rating: bayesian.bayesianAverage || 4.5,
    ratings: sampleRatings,
  };
});

catalog.industries = enhancedIndustries;
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`Successfully enriched ${enhancedIndustries.length} seed catalog industries with resourceful capabilities & ratings!`);
