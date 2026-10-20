import type { ReadinessStatus } from "./validation.ts";

// ====================================================================
// Interfaces & Types
// ====================================================================

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  provider: string;
  cached?: boolean;
  status: "ok" | "unavailable";
  error?: string;
}

export interface IRoutingProvider {
  name: string;
  calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult>;
}

export interface PeakWindow {
  name: string;
  start: string; // "HH:MM" e.g. "08:00"
  end: string;   // "HH:MM" e.g. "10:30"
}

export interface TrafficSettings {
  windows: PeakWindow[];
  active_days: number[]; // 1=Mon, 2=Tue, ..., 6=Sat, 0=Sun
  buffer_minutes_before_peak: number;
}

export const DEFAULT_TRAFFIC_SETTINGS: TrafficSettings = {
  windows: [
    { name: "Morning Peak", start: "08:00", end: "10:30" },
    { name: "Evening Peak", start: "17:00", end: "20:00" },
  ],
  active_days: [1, 2, 3, 4, 5, 6], // Monday to Saturday
  buffer_minutes_before_peak: 15,
};

export interface TrafficEvaluationResult {
  status: ReadinessStatus;
  distanceKm: number | null;
  durationMinutes: number | null;
  peakHourRisk: boolean;
  peakWindowName?: string;
  suggestedDepartureTime?: string;
  details: string;
  provider: string;
}

// ====================================================================
// Haversine Baseline Formula
// ====================================================================

export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ====================================================================
// Routing Providers
// ====================================================================

/**
 * OpenRouteService (ORS) Provider - Primary Production Choice
 * Free tier: 2,000 directions requests / day, 40 requests / min.
 */
export class OpenRouteServiceProvider implements IRoutingProvider {
  name = "OpenRouteService";
  private apiKey: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs: number = 5000) {
    this.apiKey = apiKey || process.env.ORS_API_KEY || "";
    this.timeoutMs = timeoutMs;
  }

  async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult> {
    if (!this.apiKey) {
      return {
        distanceKm: 0,
        durationMinutes: 0,
        provider: this.name,
        status: "unavailable",
        error: "ORS_API_KEY not configured",
      };
    }

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${originLng},${originLat}&end=${destLng},${destLat}`;

    // Retry with exponential backoff (max 2 retries)
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: this.apiKey,
            Accept: "application/json, application/geo+json",
          },
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`ORS responded with HTTP status ${response.status}`);
        }

        const data = await response.json();
        const feature = data.features?.[0];
        const summary = feature?.properties?.summary;

        if (!summary) {
          throw new Error("Malformed response from OpenRouteService");
        }

        const distanceKm = Math.round((summary.distance / 1000) * 10) / 10;
        const durationMinutes = Math.max(1, Math.round(summary.duration / 60));

        return {
          distanceKm,
          durationMinutes,
          provider: this.name,
          status: "ok",
        };
      } catch (err: any) {
        clearTimeout(timer);
        if (attempt === 1) {
          return {
            distanceKm: 0,
            durationMinutes: 0,
            provider: this.name,
            status: "unavailable",
            error: err.name === "AbortError" ? "Request timeout (5s)" : err.message,
          };
        }
        // Wait 500ms before retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return {
      distanceKm: 0,
      durationMinutes: 0,
      provider: this.name,
      status: "unavailable",
      error: "Service request failed after retries",
    };
  }
}

/**
 * OSRM Public Demo Server Provider - Strictly for Dev/Testing
 * Project-OSRM terms: Not for production use.
 */
export class OSRMDevProvider implements IRoutingProvider {
  name = "OSRM-Demo";
  private timeoutMs: number;

  constructor(timeoutMs: number = 5000) {
    this.timeoutMs = timeoutMs;
  }

  async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult> {
    const url = `http://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`OSRM demo server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      const route = data.routes?.[0];

      if (!route) {
        throw new Error("No route found in OSRM demo response");
      }

      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(1, Math.round(route.duration / 60));

      return {
        distanceKm,
        durationMinutes,
        provider: this.name,
        status: "ok",
      };
    } catch (err: any) {
      clearTimeout(timer);
      return {
        distanceKm: 0,
        durationMinutes: 0,
        provider: this.name,
        status: "unavailable",
        error: err.name === "AbortError" ? "Request timeout (5s)" : err.message,
      };
    }
  }
}

/**
 * Mock Routing Provider - Deterministic Speed-Profile Formula
 * Safe for unit tests, offline environments, and zero-key local development.
 * Emulates Coimbatore urban road network (1.3 tortuosity factor @ 30 km/h average speed).
 */
export class MockRoutingProvider implements IRoutingProvider {
  name = "Mock-SpeedProfile";

  async calculateRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResult> {
    const straightLine = calculateHaversineDistanceKm(
      originLat,
      originLng,
      destLat,
      destLng
    );
    const roadDistance = Math.round(straightLine * 1.3 * 10) / 10;
    // 30 km/h average speed: duration = (distance / 30) * 60 = distance * 2 minutes
    const durationMinutes = Math.max(5, Math.round(roadDistance * 2));

    return {
      distanceKm: roadDistance,
      durationMinutes,
      provider: this.name,
      status: "ok",
    };
  }
}

/**
 * Factory to retrieve configured routing provider
 */
export function getRoutingProvider(): IRoutingProvider {
  if (process.env.ROUTING_PROVIDER === "mock" || process.env.NODE_ENV === "test") {
    return new MockRoutingProvider();
  }
  if (process.env.ORS_API_KEY) {
    return new OpenRouteServiceProvider(process.env.ORS_API_KEY);
  }
  // Safe default: speed profile fallback
  return new MockRoutingProvider();
}

// ====================================================================
// Peak-Hour Risk Calculation & Departure Advisory
// ====================================================================

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = (totalMinutes + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const padH = hours.toString().padStart(2, "0");
  const padM = minutes.toString().padStart(2, "0");
  return `${padH}:${padM}`;
}

export function evaluateTrafficLogistics(params: {
  route: RouteResult;
  visitStartTime: string; // e.g. "09:30:00" or "09:30"
  visitDate: string;      // "YYYY-MM-DD" e.g. "2026-11-10"
  settings?: TrafficSettings;
}): TrafficEvaluationResult {
  const { route, visitStartTime, visitDate } = params;
  const settings = params.settings || DEFAULT_TRAFFIC_SETTINGS;

  if (route.status === "unavailable") {
    return {
      status: "unavailable",
      distanceKm: null,
      durationMinutes: null,
      peakHourRisk: false,
      details: "Estimated travel time is currently unavailable (routing service unreachable).",
      provider: route.provider,
    };
  }

  // Determine day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dateObj = new Date(`${visitDate}T00:00:00`);
  const dayOfWeek = isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();
  const isPeakDay = settings.active_days.includes(dayOfWeek);

  const startMinutes = parseTimeToMinutes(visitStartTime);
  // Buffer 15 minutes before arrival for student assembly & security check-in
  const buffer = settings.buffer_minutes_before_peak;
  const departureMinutes = startMinutes - route.durationMinutes - buffer;
  const suggestedDepartureTime = formatMinutesToTime(departureMinutes);

  let peakHourRisk = false;
  let triggeredPeakName: string | undefined = undefined;

  if (isPeakDay) {
    // Check if transit interval [departureMinutes, startMinutes] overlaps any peak window
    for (const w of settings.windows) {
      const windowStart = parseTimeToMinutes(w.start);
      const windowEnd = parseTimeToMinutes(w.end);

      // Overlap condition: max(departureMinutes, windowStart) < min(startMinutes, windowEnd)
      const overlapStart = Math.max(departureMinutes, windowStart);
      const overlapEnd = Math.min(startMinutes, windowEnd);

      if (overlapStart < overlapEnd) {
        peakHourRisk = true;
        triggeredPeakName = w.name;
        break;
      }
    }
  }

  const status: ReadinessStatus = peakHourRisk ? "warning" : "ok";
  const details = peakHourRisk
    ? `Estimated travel time: ${route.durationMinutes} mins (${route.distanceKm} km). Peak-hour risk: ${triggeredPeakName} traffic expected along route. Suggested departure: ${suggestedDepartureTime}.`
    : `Estimated travel time: ${route.durationMinutes} mins (${route.distanceKm} km). Outside peak traffic windows. Suggested departure: ${suggestedDepartureTime}.`;

  return {
    status,
    distanceKm: route.distanceKm,
    durationMinutes: route.durationMinutes,
    peakHourRisk,
    peakWindowName: triggeredPeakName,
    suggestedDepartureTime,
    details,
    provider: route.provider,
  };
}
