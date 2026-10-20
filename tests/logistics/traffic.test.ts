import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateTrafficLogistics,
  calculateHaversineDistanceKm,
  MockRoutingProvider,
} from "../../lib/logistics/routing.ts";
import type {
  RouteResult,
  TrafficSettings,
} from "../../lib/logistics/routing.ts";

describe("Traffic Logistics & Peak-Hour Advisory Engine", () => {
  const mockRouteOk: RouteResult = {
    distanceKm: 18.5,
    durationMinutes: 37,
    provider: "Mock-SpeedProfile",
    status: "ok",
  };

  const mockRouteUnavailable: RouteResult = {
    distanceKm: 0,
    durationMinutes: 0,
    provider: "OpenRouteService",
    status: "unavailable",
    error: "Request timeout (5s)",
  };

  it("calculates accurate Haversine distance between PSG Tech and Kovai Foundry", () => {
    // PSG Tech: 11.0245, 77.0030; Kovai Foundry: 10.9125, 76.9942 (~12.5 km)
    const distance = calculateHaversineDistanceKm(11.0245, 77.003, 10.9125, 76.9942);
    assert.ok(distance >= 12.0 && distance <= 13.0, `Expected ~12.5km, got ${distance}`);
  });

  it("identifies Morning Peak traffic risk on weekday morning visit", () => {
    // Tuesday visit at 09:30 AM
    const result = evaluateTrafficLogistics({
      route: mockRouteOk,
      visitStartTime: "09:30",
      visitDate: "2026-11-10", // Tuesday (day 2)
    });

    assert.equal(result.status, "warning");
    assert.equal(result.peakHourRisk, true);
    assert.equal(result.peakWindowName, "Morning Peak");
    // Departure: 09:30 - 37 min - 15 min buffer = 08:38
    assert.equal(result.suggestedDepartureTime, "08:38");
    assert.match(result.details, /Morning Peak traffic expected/);
    assert.match(result.details, /Estimated travel time/);
  });

  it("passes with OK status when visit transit falls outside peak hours", () => {
    // Tuesday visit at 13:00 (1 PM)
    const result = evaluateTrafficLogistics({
      route: mockRouteOk,
      visitStartTime: "13:00",
      visitDate: "2026-11-10", // Tuesday
    });

    assert.equal(result.status, "ok");
    assert.equal(result.peakHourRisk, false);
    // Departure: 13:00 - 37m - 15m buffer = 12:08
    assert.equal(result.suggestedDepartureTime, "12:08");
    assert.match(result.details, /Outside peak traffic windows/);
  });

  it("identifies Evening Peak traffic risk when departure or transit touches 17:00", () => {
    // Friday visit at 17:30
    const result = evaluateTrafficLogistics({
      route: mockRouteOk,
      visitStartTime: "17:30",
      visitDate: "2026-11-13", // Friday
    });

    assert.equal(result.status, "warning");
    assert.equal(result.peakHourRisk, true);
    assert.equal(result.peakWindowName, "Evening Peak");
  });

  it("does not flag peak-hour risk on inactive days (Sunday)", () => {
    // Sunday visit at 09:30 (Day 0)
    const result = evaluateTrafficLogistics({
      route: mockRouteOk,
      visitStartTime: "09:30",
      visitDate: "2026-11-15", // Sunday (day 0)
    });

    assert.equal(result.status, "ok");
    assert.equal(result.peakHourRisk, false);
  });

  it("gracefully handles routing service failure by returning Unavailable without throwing", () => {
    const result = evaluateTrafficLogistics({
      route: mockRouteUnavailable,
      visitStartTime: "09:30",
      visitDate: "2026-11-10",
    });

    assert.equal(result.status, "unavailable");
    assert.equal(result.distanceKm, null);
    assert.equal(result.durationMinutes, null);
    assert.match(result.details, /travel time is currently unavailable/);
  });

  it("supports dynamic custom settings from settings table", () => {
    const customSettings: TrafficSettings = {
      windows: [{ name: "Afternoon Congestion", start: "14:00", end: "16:00" }],
      active_days: [1, 2, 3, 4, 5, 6],
      buffer_minutes_before_peak: 10,
    };

    const result = evaluateTrafficLogistics({
      route: mockRouteOk,
      visitStartTime: "15:00",
      visitDate: "2026-11-10",
      settings: customSettings,
    });

    assert.equal(result.status, "warning");
    assert.equal(result.peakWindowName, "Afternoon Congestion");
  });
});
