import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getLiveTrafficSituation,
  getLiveWeatherSituation,
  formatLiveFacilityStatus,
} from "../../lib/logistics/live_situation.ts";

describe("Live Situation & Real-Time Logistics Viewing Engine", () => {
  describe("Live Traffic & Route Estimation During Viewing", () => {
    it("identifies morning peak congestion during 08:00 - 10:30 IST", () => {
      // 09:15 AM on a Monday
      const mondayMorning = new Date("2026-10-19T09:15:00+05:30");
      const result = getLiveTrafficSituation(15, mondayMorning);

      assert.equal(result.trafficState, "morning_peak");
      assert.match(result.trafficLabel, /Morning Peak/i);
      assert.equal(result.trafficColor, "amber");
      assert.ok(result.estimatedMinutes > 15 * 1.5, "Adds congestion buffer to transit time");
    });

    it("identifies evening peak congestion during 17:00 - 20:00 IST", () => {
      // 18:30 PM on a Wednesday
      const wednesdayEvening = new Date("2026-10-21T18:30:00+05:30");
      const result = getLiveTrafficSituation(22, wednesdayEvening);

      assert.equal(result.trafficState, "evening_peak");
      assert.match(result.trafficLabel, /Evening Peak/i);
      assert.equal(result.trafficColor, "amber");
    });

    it("evaluates smooth transit when viewing outside peak hours", () => {
      // 14:00 PM on a Tuesday
      const tuesdayAfternoon = new Date("2026-10-20T14:00:00+05:30");
      const result = getLiveTrafficSituation(12, tuesdayAfternoon);

      assert.equal(result.trafficState, "normal");
      assert.match(result.trafficLabel, /Smooth|Normal/i);
      assert.equal(result.trafficColor, "emerald");
    });
  });

  describe("Live Weather Situation & Plant Safety During Viewing", () => {
    it("flags outdoor operational risk when precipitation is active on outdoor plants", () => {
      const liveWeather = {
        tempC: 24.5,
        weatherCode: 51, // light drizzle
        precipitationMm: 0.8,
        humidityPercent: 92,
        windSpeedKmh: 4.5,
      };

      const result = getLiveWeatherSituation(liveWeather, {
        outdoor_component: true,
        heat_sensitive: false,
      });

      assert.equal(result.outdoorRisk, "high");
      assert.match(result.conditionLabel, /Drizzle|Rain/i);
      assert.match(result.riskReason!, /Outdoor operations affected by precipitation/i);
    });

    it("passes as low risk when precipitation occurs on strictly indoor plants", () => {
      const liveWeather = {
        tempC: 24.5,
        weatherCode: 51,
        precipitationMm: 0.8,
        humidityPercent: 92,
        windSpeedKmh: 4.5,
      };

      const result = getLiveWeatherSituation(liveWeather, {
        outdoor_component: false,
        heat_sensitive: false,
      });

      assert.equal(result.outdoorRisk, "low");
      assert.match(result.conditionLabel, /Drizzle|Rain/i);
    });

    it("flags high heat risk when current temperature >= 38C on heat-sensitive facility", () => {
      const liveWeather = {
        tempC: 38.5,
        weatherCode: 0, // Clear
        precipitationMm: 0.0,
        humidityPercent: 40,
        windSpeedKmh: 6.0,
      };

      const result = getLiveWeatherSituation(liveWeather, {
        outdoor_component: false,
        heat_sensitive: true,
      });

      assert.equal(result.outdoorRisk, "high");
      assert.match(result.riskReason!, /High temperature risk/i);
    });
  });

  describe("Live Facility Operating & Logistics Status Formatting", () => {
    it("formats comprehensive live badges with parking, canteen, weather and drive time", () => {
      const status = formatLiveFacilityStatus({
        canteen_available: true,
        meal_options: ["veg", "non_veg"],
        max_meal_capacity: 50,
        outside_food_allowed: true,
        bus_parking_slots: 2,
        car_parking_slots: 6,
        max_vehicle_height_m: 4.5,
        outdoor_component: true,
        heat_sensitive: false,
        distance_km: 14.2,
        liveWeather: {
          tempC: 28,
          weatherCode: 1,
          precipitationMm: 0,
          humidityPercent: 65,
          windSpeedKmh: 8,
        },
      });

      assert.ok(status.canteenBadge.includes("50 meals"));
      assert.ok(status.parkingBadge.includes("2 Buses"));
      assert.ok(status.transitBadge.includes("km"));
      assert.ok(status.weatherBadge.includes("28°C"));
    });
  });
});
