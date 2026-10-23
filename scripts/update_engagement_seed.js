const fs = require("fs");
const path = require("path");

const catalogPath = path.join(__dirname, "../supabase/seed_catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));

const engagementPresets = {
  foundry: {
    interactive_elements: ["live_demo", "q_and_a_engineers", "product_showcase"],
    q_and_a_available: true,
    estimated_interactive_minutes: 60,
    engagement_notes: "Live cupola furnace molten tapping demo and chief metallurgist Q&A.",
  },
  pumps: {
    interactive_elements: ["live_demo", "hands_on_activity", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 90,
    engagement_notes: "Hands-on impeller assembly and hydraulic flume testing.",
  },
  textiles: {
    interactive_elements: ["live_demo", "product_showcase"],
    q_and_a_available: true,
    estimated_interactive_minutes: 45,
    engagement_notes: "High-speed airjet loom live demo and yarn tensile strength tests.",
  },
  automotive: {
    interactive_elements: ["live_demo", "hands_on_activity", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 75,
    engagement_notes: "Hands-on torque wrench calibration and robotic welding cell demo.",
  },
  compressors: {
    interactive_elements: ["live_demo", "q_and_a_engineers", "product_showcase"],
    q_and_a_available: true,
    estimated_interactive_minutes: 60,
    engagement_notes: "Rotary screw compressor tear-down and pneumatic pressure test.",
  },
  precision: {
    interactive_elements: ["live_demo", "hands_on_activity", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 60,
    engagement_notes: "Hands-on CMM metrology inspection and 5-axis CNC machining demo.",
  },
  electrical: {
    interactive_elements: ["live_demo", "hands_on_activity", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 90,
    engagement_notes: "Hands-on control panel relay wiring and HV spark flash testing.",
  },
  manufacturing: {
    interactive_elements: ["live_demo", "q_and_a_engineers", "product_showcase"],
    q_and_a_available: true,
    estimated_interactive_minutes: 60,
    engagement_notes: "400Hz solid-state power converter live test and aviation hydraulic demo.",
  },
  information_technology: {
    interactive_elements: ["live_demo", "q_and_a_engineers", "product_showcase"],
    q_and_a_available: true,
    estimated_interactive_minutes: 45,
    engagement_notes: "Tier-3 cold-aisle server walkthrough and NOC cybersecurity telemetry demo.",
  },
  default: {
    interactive_elements: ["live_demo", "q_and_a_engineers"],
    q_and_a_available: true,
    estimated_interactive_minutes: 45,
    engagement_notes: "Engineering walk-through with lead facility technician.",
  },
};

catalog.industries.forEach((ind) => {
  const preset = engagementPresets[ind.sector] || engagementPresets.default;
  ind.interactive_elements = preset.interactive_elements;
  ind.q_and_a_available = preset.q_and_a_available;
  ind.estimated_interactive_minutes = preset.estimated_interactive_minutes;
  ind.engagement_notes = preset.engagement_notes;
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`Updated ${catalog.industries.length} industries with engagement profile metadata.`);
