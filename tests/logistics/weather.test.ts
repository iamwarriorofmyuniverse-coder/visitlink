import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateWeatherRisk,
  describeWeatherCode,
  MockWeatherProvider,
} from "../../lib/logistics/weather.ts";
import type { WeatherForecastDay } from "../../lib/logistics/weather.ts";
import { recheckVisitWeatherDelta } from "../../lib/logistics/recheck.ts";

describe("Weather Advisory & Scheduled Delta Re-Check Engine", () => {
  describe("Boundary Value Threshold Tests", () => {
    it("boundary: 59% rain on outdoor component does NOT trigger Rain Risk", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 32.0,
        maxRainProbability: 59, // 1% below threshold
        weatherCode: 2, // partly cloudy
        weatherDescription: "Partly cloudy",
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: true,
        heatSensitive: false,
        daysUntilVisit: 5,
      });

      assert.equal(result.status, "ok");
      assert.equal(result.riskType, "none");
    });

    it("boundary: 60% rain on outdoor component triggers Rain Risk", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 32.0,
        maxRainProbability: 60, // Exactly at 60% threshold
        weatherCode: 61,
        weatherDescription: "Rain showers",
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: true,
        heatSensitive: false,
        daysUntilVisit: 5,
      });

      assert.equal(result.status, "warning");
      assert.equal(result.riskType, "rain_risk");
      assert.match(result.details, /Rain Risk: High rain probability \(60%\)/);
      assert.equal(result.canProposeReschedule, true);
    });

    it("ignores high rain probability if facility has NO outdoor component", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 30.0,
        maxRainProbability: 85, // Heavy rain
        weatherCode: 63,
        weatherDescription: "Rain showers",
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: false, // Fully indoors
        heatSensitive: false,
        daysUntilVisit: 5,
      });

      assert.equal(result.status, "ok");
      assert.equal(result.riskType, "none");
    });

    it("boundary: 37.9°C on heat-sensitive facility does NOT trigger Heat Risk", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 37.9, // 0.1°C below threshold
        maxRainProbability: 10,
        weatherCode: 0,
        weatherDescription: "Clear sky",
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: false,
        heatSensitive: true,
        daysUntilVisit: 4,
      });

      assert.equal(result.status, "ok");
      assert.equal(result.riskType, "none");
    });

    it("boundary: 38.0°C on heat-sensitive facility triggers Heat Risk", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 38.0, // Exactly at 38°C threshold
        maxRainProbability: 10,
        weatherCode: 0,
        weatherDescription: "Clear sky",
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: false,
        heatSensitive: true,
        daysUntilVisit: 4,
      });

      assert.equal(result.status, "warning");
      assert.equal(result.riskType, "heat_risk");
      assert.match(result.details, /Heat Risk: Peak temperature of 38°C/);
    });

    it("triggers Storm Risk when weather code matches thunderstorm (WMO 95)", () => {
      const forecast: WeatherForecastDay = {
        date: "2026-11-10",
        maxTempC: 31.0,
        maxRainProbability: 50,
        weatherCode: 95, // Thunderstorm
        weatherDescription: describeWeatherCode(95),
      };

      const result = evaluateWeatherRisk({
        forecast,
        outdoorComponent: false,
        heatSensitive: false,
        daysUntilVisit: 3,
      });

      assert.equal(result.status, "warning");
      assert.equal(result.riskType, "storm_risk");
      assert.match(result.details, /Storm Risk: Thunderstorm forecast/);
    });
  });

  describe("Horizon & Graceful Degradation Tests", () => {
    it("returns status Unavailable when visit is >16 days in advance", () => {
      const result = evaluateWeatherRisk({
        forecast: null,
        outdoorComponent: true,
        heatSensitive: true,
        daysUntilVisit: 21, // 21 days away
      });

      assert.equal(result.status, "unavailable");
      assert.match(result.details, /available 16 days prior to the visit/);
    });

    it("returns status Unavailable when provider fails without breaking flow", () => {
      const result = evaluateWeatherRisk({
        forecast: null,
        outdoorComponent: true,
        heatSensitive: true,
        daysUntilVisit: 5,
      });

      assert.equal(result.status, "unavailable");
      assert.equal(result.canProposeReschedule, false);
      assert.match(result.details, /temporarily unavailable/);
    });
  });

  describe("Scheduled T-48h / T-24h Re-Check Delta Tests", () => {
    const rainForecast: WeatherForecastDay = {
      date: "2026-11-10",
      maxTempC: 30.0,
      maxRainProbability: 75,
      weatherCode: 61,
      weatherDescription: "Rain showers",
    };

    const clearForecast: WeatherForecastDay = {
      date: "2026-11-10",
      maxTempC: 31.0,
      maxRainProbability: 10,
      weatherCode: 0,
      weatherDescription: "Clear sky",
    };

    it("dispatches exactly ONE notification when risk changes from none to rain_risk", () => {
      const outcome = recheckVisitWeatherDelta({
        visitRequestId: "req-cbe-01",
        facilityName: "Bhavani Bio-Poultry Research [Demo]",
        previousRiskStatus: "none",
        forecast: rainForecast,
        outdoorComponent: true,
        heatSensitive: false,
        daysUntilVisit: 2, // T-48h
      });

      assert.equal(outcome.statusChanged, true);
      assert.equal(outcome.notificationDispatched, true);
      assert.equal(outcome.previousRisk, "none");
      assert.equal(outcome.newRisk, "rain_risk");
      assert.match(outcome.notificationTitle!, /Rain Risk Detected/);
    });

    it("dispatches ZERO notifications when risk status is unchanged", () => {
      const outcome = recheckVisitWeatherDelta({
        visitRequestId: "req-cbe-01",
        facilityName: "Bhavani Bio-Poultry Research [Demo]",
        previousRiskStatus: "rain_risk", // Already in rain_risk state
        forecast: rainForecast,
        outdoorComponent: true,
        heatSensitive: false,
        daysUntilVisit: 1, // T-24h
      });

      assert.equal(outcome.statusChanged, false);
      assert.equal(outcome.notificationDispatched, false);
      assert.equal(outcome.notificationTitle, undefined);
    });

    it("dispatches exactly ONE clearance notification when risk changes from rain_risk back to none", () => {
      const outcome = recheckVisitWeatherDelta({
        visitRequestId: "req-cbe-01",
        facilityName: "Bhavani Bio-Poultry Research [Demo]",
        previousRiskStatus: "rain_risk",
        forecast: clearForecast,
        outdoorComponent: true,
        heatSensitive: false,
        daysUntilVisit: 1, // T-24h
      });

      assert.equal(outcome.statusChanged, true);
      assert.equal(outcome.notificationDispatched, true);
      assert.equal(outcome.previousRisk, "rain_risk");
      assert.equal(outcome.newRisk, "none");
      assert.match(outcome.notificationTitle!, /Weather Advisory Cleared/);
    });
  });
});
