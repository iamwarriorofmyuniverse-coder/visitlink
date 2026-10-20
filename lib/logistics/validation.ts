import { z } from "zod";

// ====================================================================
// Zod Schemas for Input Validation with Strict Numeric Bounds
// ====================================================================

export const MealOptionEnum = z.enum(["veg", "non_veg", "jain", "mixed"]);
export type MealOption = z.infer<typeof MealOptionEnum>;

export const IndustryFoodDeclarationSchema = z.object({
  canteen_available: z.boolean().default(false),
  meal_options: z.array(z.string()).default(["veg"]),
  max_meal_capacity: z.number().int().min(0, "Meal capacity must be non-negative").default(0),
  outside_food_allowed: z.boolean().default(true),
  refreshments_provided: z.boolean().default(false),
  food_notes: z.string().optional().nullable(),
});
export type IndustryFoodDeclaration = z.infer<typeof IndustryFoodDeclarationSchema>;

export const RequestFoodNeedSchema = z.object({
  meals_needed: z.boolean().default(false),
  meal_headcount: z.number().int().min(0, "Meal headcount must be non-negative").default(0),
  dietary_notes: z.string().optional().nullable(),
});
export type RequestFoodNeed = z.infer<typeof RequestFoodNeedSchema>;

export const IndustryParkingDeclarationSchema = z.object({
  bus_parking_slots: z.number().int().min(0, "Bus parking slots must be non-negative").default(0),
  car_parking_slots: z.number().int().min(0, "Car parking slots must be non-negative").default(0),
  max_vehicle_height_m: z.number().positive("Vehicle clearance height must be greater than 0").default(4.5),
  entry_gate_instructions: z.string().optional().nullable(),
  parking_notes: z.string().optional().nullable(),
});
export type IndustryParkingDeclaration = z.infer<typeof IndustryParkingDeclarationSchema>;

export const RequestParkingNeedSchema = z.object({
  buses_count: z.number().int().min(0, "Bus count must be non-negative").default(0),
  cars_count: z.number().int().min(0, "Car count must be non-negative").default(0),
});
export type RequestParkingNeed = z.infer<typeof RequestParkingNeedSchema>;

export const IndustryWeatherFlagsSchema = z.object({
  outdoor_component: z.boolean().default(false),
  heat_sensitive: z.boolean().default(false),
});
export type IndustryWeatherFlags = z.infer<typeof IndustryWeatherFlagsSchema>;

export type ReadinessStatus = "ok" | "warning" | "unavailable";

export interface FoodEvaluationResult {
  status: ReadinessStatus;
  flags: string[];
  details: string;
}

export interface ParkingEvaluationResult {
  status: ReadinessStatus;
  flags: string[];
  details: string;
  entryGateInstructions?: string;
  maxVehicleHeightM?: number;
}

// ====================================================================
// Evaluation Engines
// ====================================================================

/**
 * Validates requested meals and dietary requirements against industry canteen declarations.
 */
export function evaluateFoodLogistics(
  industry: IndustryFoodDeclaration,
  request: RequestFoodNeed
): FoodEvaluationResult {
  // Validate with Zod
  const ind = IndustryFoodDeclarationSchema.parse(industry);
  const req = RequestFoodNeedSchema.parse(request);

  const flags: string[] = [];

  if (req.meals_needed) {
    // 1. Capacity Check
    if (req.meal_headcount > ind.max_meal_capacity) {
      flags.push(
        `Meal headcount (${req.meal_headcount}) exceeds facility canteen capacity (${ind.max_meal_capacity}).`
      );
    }

    // 2. Canteen Availability Check
    if (!ind.canteen_available && !ind.outside_food_allowed) {
      flags.push("Facility has no canteen and outside food is strictly prohibited.");
    } else if (!ind.canteen_available && ind.outside_food_allowed) {
      flags.push("No on-site canteen; students must bring outside food or packed lunches.");
    }

    // 3. Dietary Conflicts Check
    const notesLower = (req.dietary_notes || "").toLowerCase();
    const declaredOptionsLower = ind.meal_options.map((m) => m.toLowerCase());

    const isJainRequested = notesLower.includes("jain");
    const isNonVegRequested =
      notesLower.includes("non-veg") ||
      notesLower.includes("non veg") ||
      notesLower.includes("chicken") ||
      notesLower.includes("halal") ||
      notesLower.includes("meat");

    if (
      isJainRequested &&
      !declaredOptionsLower.includes("jain") &&
      !declaredOptionsLower.includes("mixed")
    ) {
      flags.push(
        `Jain dietary requirement requested, but facility only offers: ${
          ind.meal_options.join(", ") || "standard veg"
        }.`
      );
    }

    if (
      isNonVegRequested &&
      !declaredOptionsLower.includes("non_veg") &&
      !declaredOptionsLower.includes("mixed")
    ) {
      flags.push(
        `Non-vegetarian meal requested, but facility is strictly vegetarian (${ind.meal_options.join(
          ", "
        )}).`
      );
    }
  } else {
    // Meals not requested: check if outside food is allowed for student snacks
    if (!ind.outside_food_allowed) {
      flags.push(
        "Outside food/snacks are prohibited on facility premises due to cleanroom/industrial contamination rules."
      );
    }
  }

  const status: ReadinessStatus = flags.length > 0 ? "warning" : "ok";
  const details =
    flags.length > 0
      ? flags.join(" ")
      : req.meals_needed
      ? `Canteen available (${ind.meal_options.join(", ")}). Capacity sufficient for ${req.meal_headcount} students.`
      : "No meals requested. General facility food rules accepted.";

  return { status, flags, details };
}

/**
 * Validates requested vehicle arrival against industry parking declarations.
 */
export function evaluateParkingLogistics(
  industry: IndustryParkingDeclaration,
  request: RequestParkingNeed
): ParkingEvaluationResult {
  // Validate with Zod
  const ind = IndustryParkingDeclarationSchema.parse(industry);
  const req = RequestParkingNeedSchema.parse(request);

  const flags: string[] = [];

  // 1. Bus capacity check
  if (req.buses_count > ind.bus_parking_slots) {
    flags.push(
      `Requested buses (${req.buses_count}) exceed facility bus parking bays (${ind.bus_parking_slots}).`
    );
  }

  // 2. Car capacity check
  if (req.cars_count > ind.car_parking_slots) {
    flags.push(
      `Requested cars (${req.cars_count}) exceed facility car parking slots (${ind.car_parking_slots}).`
    );
  }

  const status: ReadinessStatus = flags.length > 0 ? "warning" : "ok";
  const details =
    flags.length > 0
      ? flags.join(" ")
      : `Parking allocated: ${req.buses_count} bus bays (out of ${ind.bus_parking_slots}) and ${req.cars_count} car bays (out of ${ind.car_parking_slots}). Max vehicle height: ${ind.max_vehicle_height_m}m.`;

  return {
    status,
    flags,
    details,
    entryGateInstructions: ind.entry_gate_instructions || undefined,
    maxVehicleHeightM: ind.max_vehicle_height_m,
  };
}
