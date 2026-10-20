import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateFoodLogistics,
  evaluateParkingLogistics,
} from "../../lib/logistics/validation.ts";
import type {
  IndustryFoodDeclaration,
  RequestFoodNeed,
  IndustryParkingDeclaration,
  RequestParkingNeed,
} from "../../lib/logistics/validation.ts";

describe("Logistics Validation Engine - Unit Tests", () => {
  describe("Food Logistics Validation", () => {
    const baseIndustry: IndustryFoodDeclaration = {
      canteen_available: true,
      meal_options: ["veg", "non_veg"],
      max_meal_capacity: 50,
      outside_food_allowed: true,
      refreshments_provided: true,
      food_notes: "Standard cafeteria",
    };

    it("passes when meal headcount is exactly at capacity boundary", () => {
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 50,
        dietary_notes: "Standard vegetarian meals",
      };
      const result = evaluateFoodLogistics(baseIndustry, request);
      assert.equal(result.status, "ok");
      assert.equal(result.flags.length, 0);
    });

    it("flags warning when meal headcount exceeds capacity by 1", () => {
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 51,
        dietary_notes: "Veg meals",
      };
      const result = evaluateFoodLogistics(baseIndustry, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /exceeds facility canteen capacity/);
    });

    it("flags warning for Jain dietary requirement when facility does not support Jain", () => {
      const vegOnlyIndustry: IndustryFoodDeclaration = {
        ...baseIndustry,
        meal_options: ["veg"],
      };
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 30,
        dietary_notes: "5 students require strict Jain food (no onion/garlic)",
      };
      const result = evaluateFoodLogistics(vegOnlyIndustry, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /Jain dietary requirement requested/);
    });

    it("passes when Jain is requested and facility declares Jain option", () => {
      const jainSupportedIndustry: IndustryFoodDeclaration = {
        ...baseIndustry,
        meal_options: ["veg", "jain"],
      };
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 30,
        dietary_notes: "5 students require Jain food",
      };
      const result = evaluateFoodLogistics(jainSupportedIndustry, request);
      assert.equal(result.status, "ok");
    });

    it("flags warning when non-veg is requested at strictly vegetarian facility", () => {
      const vegOnlyIndustry: IndustryFoodDeclaration = {
        ...baseIndustry,
        meal_options: ["veg"],
      };
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 25,
        dietary_notes: "Non-veg chicken meals preferred",
      };
      const result = evaluateFoodLogistics(vegOnlyIndustry, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /strictly vegetarian/);
    });

    it("flags warning when canteen is unavailable and outside food is prohibited", () => {
      const strictFacility: IndustryFoodDeclaration = {
        ...baseIndustry,
        canteen_available: false,
        outside_food_allowed: false,
        max_meal_capacity: 0,
      };
      const request: RequestFoodNeed = {
        meals_needed: true,
        meal_headcount: 20,
      };
      const result = evaluateFoodLogistics(strictFacility, request);
      assert.equal(result.status, "warning");
      assert.ok(
        result.flags.some((f) => /outside food is strictly prohibited/.test(f))
      );
    });

    it("flags warning when outside food is prohibited even if meals are not requested", () => {
      const cleanroomFacility: IndustryFoodDeclaration = {
        ...baseIndustry,
        outside_food_allowed: false,
      };
      const request: RequestFoodNeed = {
        meals_needed: false,
        meal_headcount: 0,
      };
      const result = evaluateFoodLogistics(cleanroomFacility, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /cleanroom\/industrial contamination/);
    });
  });

  describe("Parking Logistics Validation", () => {
    const baseIndustry: IndustryParkingDeclaration = {
      bus_parking_slots: 2,
      car_parking_slots: 6,
      max_vehicle_height_m: 4.2,
      entry_gate_instructions: "Gate 2 Avinashi Road; driver badge at security post.",
      parking_notes: "Yellow marked bays.",
    };

    it("passes when buses and cars are within declared slot capacity", () => {
      const request: RequestParkingNeed = {
        buses_count: 2,
        cars_count: 3,
      };
      const result = evaluateParkingLogistics(baseIndustry, request);
      assert.equal(result.status, "ok");
      assert.equal(result.flags.length, 0);
      assert.equal(result.entryGateInstructions, baseIndustry.entry_gate_instructions);
      assert.equal(result.maxVehicleHeightM, 4.2);
    });

    it("flags warning when requested buses exceed bus parking bays", () => {
      const request: RequestParkingNeed = {
        buses_count: 3,
        cars_count: 2,
      };
      const result = evaluateParkingLogistics(baseIndustry, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /Requested buses \(3\) exceed facility bus parking bays \(2\)/);
    });

    it("flags warning when requested cars exceed car parking bays", () => {
      const request: RequestParkingNeed = {
        buses_count: 1,
        cars_count: 8,
      };
      const result = evaluateParkingLogistics(baseIndustry, request);
      assert.equal(result.status, "warning");
      assert.match(result.flags[0], /Requested cars \(8\) exceed facility car parking slots \(6\)/);
    });

    it("rejects negative counts via Zod schema bounds", () => {
      assert.throws(() => {
        evaluateParkingLogistics(baseIndustry, {
          buses_count: -1,
          cars_count: 0,
        });
      }, /Bus count must be non-negative/);
    });
  });
});
