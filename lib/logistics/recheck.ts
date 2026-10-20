import { evaluateWeatherRisk } from "./weather.ts";
import type {
  WeatherForecastDay,
  WeatherRiskType,
  WeatherRiskSettings,
} from "./weather.ts";

export interface RecheckParams {
  visitRequestId: string;
  facilityName: string;
  previousRiskStatus: WeatherRiskType;
  forecast: WeatherForecastDay | null;
  outdoorComponent: boolean;
  heatSensitive: boolean;
  daysUntilVisit: number; // 2 for ~48h, 1 for ~24h
  settings?: WeatherRiskSettings;
}

export interface RecheckOutcome {
  visitRequestId: string;
  statusChanged: boolean;
  previousRisk: WeatherRiskType;
  newRisk: WeatherRiskType;
  notificationDispatched: boolean;
  notificationTitle?: string;
  notificationMessage?: string;
}

/**
 * Executes the scheduled T-48h and T-24h weather re-check delta logic.
 * Strictly enforces that notifications are sent ONLY when the risk classification has changed.
 */
export function recheckVisitWeatherDelta(params: RecheckParams): RecheckOutcome {
  const evaluation = evaluateWeatherRisk({
    forecast: params.forecast,
    outdoorComponent: params.outdoorComponent,
    heatSensitive: params.heatSensitive,
    daysUntilVisit: params.daysUntilVisit,
    settings: params.settings,
  });

  const newRisk: WeatherRiskType = evaluation.riskType;
  const previousRisk = params.previousRiskStatus;

  // Exact delta comparison
  const statusChanged = newRisk !== previousRisk;

  if (!statusChanged) {
    // Risk status unchanged: ZERO notifications dispatched
    return {
      visitRequestId: params.visitRequestId,
      statusChanged: false,
      previousRisk,
      newRisk,
      notificationDispatched: false,
    };
  }

  // Risk status changed: exactly ONE notification dispatched
  let notificationTitle = "Weather Advisory Update for Scheduled Visit";
  let notificationMessage = "";

  if (newRisk === "none" && previousRisk !== "none") {
    notificationTitle = "Weather Advisory Cleared";
    notificationMessage = `Weather conditions for your visit to ${params.facilityName} have improved. Risk status updated to Favorable.`;
  } else if (newRisk === "rain_risk") {
    notificationTitle = "Weather Advisory: Rain Risk Detected";
    notificationMessage = `Updated weather forecast indicates rain probability (${evaluation.rainProbability}%) for ${params.facilityName}. Normal schedule holds; host manager may propose rescheduling if needed.`;
  } else if (newRisk === "heat_risk") {
    notificationTitle = "Weather Advisory: High Temperature Alert";
    notificationMessage = `Updated weather forecast indicates high temperature (${evaluation.temperatureC}°C) for ${params.facilityName}. Hydration and indoor rotation advised.`;
  } else if (newRisk === "storm_risk") {
    notificationTitle = "Weather Advisory: Thunderstorm Warning";
    notificationMessage = `Updated weather forecast predicts thunderstorms (${evaluation.weatherDescription}) for ${params.facilityName}. Please review visit logistics and safety procedures.`;
  }

  return {
    visitRequestId: params.visitRequestId,
    statusChanged: true,
    previousRisk,
    newRisk,
    notificationDispatched: true,
    notificationTitle,
    notificationMessage,
  };
}
