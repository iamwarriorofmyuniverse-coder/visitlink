import type { ReadinessStatus } from "./validation.ts";

// ====================================================================
// Types & Interfaces
// ====================================================================

export interface WeatherForecastDay {
  date: string; // "YYYY-MM-DD"
  maxTempC: number;
  maxRainProbability: number;
  weatherCode: number;
  weatherDescription: string;
}

export interface WeatherRiskSettings {
  rain_probability_threshold: number; // default 60
  heat_temp_celsius_threshold: number; // default 38.0
  storm_weather_codes: number[]; // default [95, 96, 99]
  forecast_horizon_days: number; // default 16
}

export const DEFAULT_WEATHER_SETTINGS: WeatherRiskSettings = {
  rain_probability_threshold: 60,
  heat_temp_celsius_threshold: 38.0,
  storm_weather_codes: [95, 96, 99],
  forecast_horizon_days: 16,
};

export type WeatherRiskType = "none" | "rain_risk" | "heat_risk" | "storm_risk";

export interface WeatherEvaluationResult {
  status: ReadinessStatus;
  riskType: WeatherRiskType;
  temperatureC: number | null;
  rainProbability: number | null;
  weatherCode: number | null;
  weatherDescription: string;
  details: string;
  flags: string[];
  canProposeReschedule: boolean;
  attribution: string;
}

export interface IWeatherProvider {
  name: string;
  getForecast(
    lat: number,
    lng: number,
    visitDate: string
  ): Promise<{
    success: boolean;
    data?: WeatherForecastDay;
    error?: string;
  }>;
}

// ====================================================================
// WMO Weather Code Mapping (WMO 4677 standard)
// ====================================================================

export function describeWeatherCode(code: number): string {
  switch (code) {
    case 0:
      return "Clear sky";
    case 1:
      return "Mainly clear";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain showers";
    case 71:
    case 73:
    case 75:
      return "Snow showers";
    case 80:
    case 81:
    case 82:
      return "Heavy rain showers";
    case 95:
      return "Thunderstorm";
    case 96:
    case 99:
      return "Severe thunderstorm with hail";
    default:
      return "Scattered clouds";
  }
}

// ====================================================================
// Open-Meteo Provider (Free Tier: 10,000 calls/day, No API Key needed)
// ====================================================================

export class OpenMeteoProvider implements IWeatherProvider {
  name = "Open-Meteo";
  private timeoutMs: number;

  constructor(timeoutMs: number = 5000) {
    this.timeoutMs = timeoutMs;
  }

  async getForecast(
    lat: number,
    lng: number,
    visitDate: string
  ): Promise<{
    success: boolean;
    data?: WeatherForecastDay;
    error?: string;
  }> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=16`;

    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`Open-Meteo HTTP ${response.status}`);
        }

        const data = await response.json();
        const daily = data.daily;

        if (!daily || !daily.time || !Array.isArray(daily.time)) {
          throw new Error("Malformed daily forecast from Open-Meteo");
        }

        const index = daily.time.indexOf(visitDate);
        if (index === -1) {
          return {
            success: false,
            error: "Visit date is beyond the 16-day forecast horizon",
          };
        }

        const weatherCode = daily.weather_code[index] ?? 0;
        const maxTempC = Math.round(daily.temperature_2m_max[index] * 10) / 10;
        const maxRainProbability = Math.round(daily.precipitation_probability_max[index]);

        return {
          success: true,
          data: {
            date: visitDate,
            maxTempC,
            maxRainProbability,
            weatherCode,
            weatherDescription: describeWeatherCode(weatherCode),
          },
        };
      } catch (err: any) {
        clearTimeout(timer);
        if (attempt === 1) {
          return {
            success: false,
            error: err.name === "AbortError" ? "Open-Meteo request timeout (5s)" : err.message,
          };
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    return { success: false, error: "Open-Meteo failed after retries" };
  }
}

// ====================================================================
// Mock Weather Provider for Unit Tests & Offline Dev
// ====================================================================

export class MockWeatherProvider implements IWeatherProvider {
  name = "Mock-Weather";
  private mockDay?: WeatherForecastDay;
  private shouldFail: boolean;

  constructor(mockDay?: WeatherForecastDay, shouldFail: boolean = false) {
    this.mockDay = mockDay;
    this.shouldFail = shouldFail;
  }

  async getForecast(
    lat: number,
    lng: number,
    visitDate: string
  ): Promise<{
    success: boolean;
    data?: WeatherForecastDay;
    error?: string;
  }> {
    if (this.shouldFail) {
      return { success: false, error: "Mock weather provider connection error" };
    }

    if (this.mockDay) {
      return { success: true, data: this.mockDay };
    }

    // Default pleasant Coimbatore weather
    return {
      success: true,
      data: {
        date: visitDate,
        maxTempC: 31.5,
        maxRainProbability: 15,
        weatherCode: 1,
        weatherDescription: "Mainly clear",
      },
    };
  }
}

// ====================================================================
// Risk Evaluation Engine (Non-Cancelling Advisory Only)
// ====================================================================

export function evaluateWeatherRisk(params: {
  forecast?: WeatherForecastDay | null;
  outdoorComponent: boolean;
  heatSensitive: boolean;
  settings?: WeatherRiskSettings;
  daysUntilVisit: number;
}): WeatherEvaluationResult {
  const { forecast, outdoorComponent, heatSensitive, daysUntilVisit } = params;
  const settings = params.settings || DEFAULT_WEATHER_SETTINGS;
  const attribution = "Weather data by Open-Meteo.com";

  // Check 1: Beyond 16-day forecast horizon
  if (daysUntilVisit > settings.forecast_horizon_days) {
    return {
      status: "unavailable",
      riskType: "none",
      temperatureC: null,
      rainProbability: null,
      weatherCode: null,
      weatherDescription: "Unavailable",
      details: `Weather forecast advisory will be available ${settings.forecast_horizon_days} days prior to the visit date.`,
      flags: [],
      canProposeReschedule: false,
      attribution,
    };
  }

  // Check 2: Service failure / unavailable
  if (!forecast) {
    return {
      status: "unavailable",
      riskType: "none",
      temperatureC: null,
      rainProbability: null,
      weatherCode: null,
      weatherDescription: "Unavailable",
      details: "Weather advisory is temporarily unavailable. Normal scheduling continues.",
      flags: [],
      canProposeReschedule: false,
      attribution,
    };
  }

  const flags: string[] = [];
  let riskType: WeatherRiskType = "none";

  // Rule 1: Thunderstorm / Severe Storm Check (WMO 95, 96, 99)
  if (settings.storm_weather_codes.includes(forecast.weatherCode)) {
    riskType = "storm_risk";
    flags.push(
      `Storm Risk: ${forecast.weatherDescription} forecast on visit date. Managers may review outdoor safety or propose rescheduling.`
    );
  }

  // Rule 2: Rain Risk on Outdoor Component
  if (
    forecast.maxRainProbability >= settings.rain_probability_threshold &&
    outdoorComponent
  ) {
    if (riskType === "none") riskType = "rain_risk";
    flags.push(
      `Rain Risk: High rain probability (${forecast.maxRainProbability}%) for outdoor facility operations.`
    );
  }

  // Rule 3: Heat Risk on Heat Sensitive Facility
  if (
    forecast.maxTempC >= settings.heat_temp_celsius_threshold &&
    heatSensitive
  ) {
    if (riskType === "none") riskType = "heat_risk";
    flags.push(
      `Heat Risk: Peak temperature of ${forecast.maxTempC}°C forecast for heat-sensitive plant areas.`
    );
  }

  const hasWarning = flags.length > 0;
  const status: ReadinessStatus = hasWarning ? "warning" : "ok";

  const details = hasWarning
    ? flags.join(" ") + " (Advisory only — visit is not auto-cancelled)."
    : `Forecast: ${forecast.weatherDescription}. Max temp ${forecast.maxTempC}°C, rain probability ${forecast.maxRainProbability}%. Conditions favorable.`;

  return {
    status,
    riskType,
    temperatureC: forecast.maxTempC,
    rainProbability: forecast.maxRainProbability,
    weatherCode: forecast.weatherCode,
    weatherDescription: forecast.weatherDescription,
    details,
    flags,
    canProposeReschedule: hasWarning,
    attribution,
  };
}
