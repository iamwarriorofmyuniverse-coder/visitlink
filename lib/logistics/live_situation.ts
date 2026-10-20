/**
 * Live Situation Engine: Real-Time Environmental & Operational Logistics Telemetry
 * Provides instant live traffic, live weather, and facility operational readiness
 * built right into the coordinator's exploration and facility inspection views.
 */

export interface LiveTrafficInfo {
  distanceKm: number;
  estimatedMinutes: number;
  trafficState: "normal" | "morning_peak" | "evening_peak";
  trafficLabel: string;
  trafficColor: "emerald" | "amber" | "red";
  suggestedDepartureText: string;
}

export interface LiveWeatherInput {
  tempC: number;
  apparentTempC?: number;
  weatherCode: number;
  precipitationMm: number;
  humidityPercent: number;
  windSpeedKmh: number;
}

export interface LiveWeatherInfo {
  temperatureC: number;
  apparentTempC?: number;
  weatherCode: number;
  conditionLabel: string;
  iconType: "sun" | "rain" | "cloud" | "storm";
  outdoorRisk: "low" | "moderate" | "high";
  riskReason?: string;
  badgeColor: string;
}

export interface FacilityLogisticsProps {
  canteen_available?: boolean;
  meal_options?: string[];
  max_meal_capacity?: number;
  outside_food_allowed?: boolean;
  bus_parking_slots?: number;
  car_parking_slots?: number;
  max_vehicle_height_m?: number;
  outdoor_component?: boolean;
  heat_sensitive?: boolean;
  distance_km: number;
  liveWeather?: LiveWeatherInput;
}

export interface FormattedLiveStatus {
  canteenBadge: string;
  parkingBadge: string;
  transitBadge: string;
  weatherBadge: string;
  transitInfo: LiveTrafficInfo;
  weatherInfo?: LiveWeatherInfo;
}

/**
 * Maps WMO code to human-readable weather condition label and icon
 */
export function getWMOConditionLabel(code: number): { label: string; icon: "sun" | "rain" | "cloud" | "storm" } {
  if (code === 0) return { label: "Clear sky", icon: "sun" };
  if (code === 1 || code === 2) return { label: "Mainly clear", icon: "sun" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if (code >= 45 && code <= 48) return { label: "Fog / Mist", icon: "cloud" };
  if (code >= 51 && code <= 55) return { label: "Light Drizzle", icon: "rain" };
  if (code >= 61 && code <= 65) return { label: "Rain Showers", icon: "rain" };
  if (code >= 80 && code <= 82) return { label: "Heavy Rain", icon: "rain" };
  if (code >= 95) return { label: "Thunderstorm", icon: "storm" };
  return { label: "Fair", icon: "sun" };
}

/**
 * Evaluates live traffic situation based on road distance and local time of day.
 * Default peak hours in Coimbatore:
 * Morning: 08:00 - 10:30 (Monday - Saturday)
 * Evening: 17:00 - 20:00 (Monday - Saturday)
 */
export function getLiveTrafficSituation(distanceKm: number, customDate?: Date): LiveTrafficInfo {
  const now = customDate ?? new Date();

  // Convert to IST (UTC + 5:30) if parsing
  // Get local hour and minute in IST
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  });

  const parts = formatter.formatToParts(now);
  const partMap = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const hour = parseInt(partMap.hour, 10);
  const minute = parseInt(partMap.minute, 10);
  const isSunday = partMap.weekday === "Sun";

  // Time in minutes from midnight
  const timeInMinutes = hour * 60 + minute;

  const isMorningPeak = !isSunday && timeInMinutes >= 8 * 60 && timeInMinutes <= 10 * 60 + 30;
  const isEveningPeak = !isSunday && timeInMinutes >= 17 * 60 && timeInMinutes <= 20 * 60;

  // Base urban transit time in Coimbatore: ~30-35 km/h + 8 min dispatch
  const baseMinutes = Math.max(12, Math.round((distanceKm / 32) * 60) + 6);

  if (isMorningPeak) {
    const congestionMinutes = Math.round(baseMinutes * 1.35);
    return {
      distanceKm,
      estimatedMinutes: congestionMinutes,
      trafficState: "morning_peak",
      trafficLabel: "⚠️ Morning Peak Congestion",
      trafficColor: "amber",
      suggestedDepartureText: `Add 15m buffer. Estimated travel time ~${congestionMinutes} mins across arterial corridors.`,
    };
  }

  if (isEveningPeak) {
    const congestionMinutes = Math.round(baseMinutes * 1.3);
    return {
      distanceKm,
      estimatedMinutes: congestionMinutes,
      trafficState: "evening_peak",
      trafficLabel: "⚠️ Evening Peak Congestion",
      trafficColor: "amber",
      suggestedDepartureText: `Heavy commute traffic active. Estimated travel time ~${congestionMinutes} mins.`,
    };
  }

  return {
    distanceKm,
    estimatedMinutes: baseMinutes,
    trafficState: "normal",
    trafficLabel: "🟢 Smooth Traffic Flow",
    trafficColor: "emerald",
    suggestedDepartureText: `Normal transit flow. Estimated driving time ~${baseMinutes} mins (${distanceKm} km).`,
  };
}

/**
 * Evaluates live weather status against specific facility vulnerability (outdoor / heat sensitive)
 */
export function getLiveWeatherSituation(
  weather: LiveWeatherInput,
  facility: { outdoor_component: boolean; heat_sensitive: boolean }
): LiveWeatherInfo {
  const { label, icon } = getWMOConditionLabel(weather.weatherCode);

  const isRain =
    weather.precipitationMm > 0.05 ||
    (weather.weatherCode >= 51 && weather.weatherCode <= 67) ||
    (weather.weatherCode >= 80 && weather.weatherCode <= 82);
  const isStorm = weather.weatherCode >= 95;
  const isHighHeat = weather.tempC >= 38.0;

  if (isStorm) {
    return {
      temperatureC: weather.tempC,
      apparentTempC: weather.apparentTempC,
      weatherCode: weather.weatherCode,
      conditionLabel: label,
      iconType: "storm",
      outdoorRisk: "high",
      riskReason: "Thunderstorm active in area. All outdoor activities restricted.",
      badgeColor: "red",
    };
  }

  if (isRain && facility.outdoor_component) {
    return {
      temperatureC: weather.tempC,
      apparentTempC: weather.apparentTempC,
      weatherCode: weather.weatherCode,
      conditionLabel: label,
      iconType: "rain",
      outdoorRisk: "high",
      riskReason: `Outdoor operations affected by precipitation (${weather.precipitationMm} mm/h). Wet ground advisory.`,
      badgeColor: "amber",
    };
  }

  if (isHighHeat && facility.heat_sensitive) {
    return {
      temperatureC: weather.tempC,
      apparentTempC: weather.apparentTempC,
      weatherCode: weather.weatherCode,
      conditionLabel: label,
      iconType: "sun",
      outdoorRisk: "high",
      riskReason: `High temperature risk (${weather.tempC}°C) in manufacturing & foundry areas. Ensure hydration.`,
      badgeColor: "amber",
    };
  }

  return {
    temperatureC: weather.tempC,
    apparentTempC: weather.apparentTempC,
    weatherCode: weather.weatherCode,
    conditionLabel: label,
    iconType: icon,
    outdoorRisk: "low",
    badgeColor: "emerald",
  };
}

/**
 * Formats full operational badges for immediate inline viewing on cards & map popups
 */
export function formatLiveFacilityStatus(props: FacilityLogisticsProps): FormattedLiveStatus {
  const traffic = getLiveTrafficSituation(props.distance_km);

  let weatherInfo: LiveWeatherInfo | undefined;
  if (props.liveWeather) {
    weatherInfo = getLiveWeatherSituation(props.liveWeather, {
      outdoor_component: !!props.outdoor_component,
      heat_sensitive: !!props.heat_sensitive,
    });
  }

  const canteenText = props.canteen_available
    ? `Canteen (${props.max_meal_capacity ?? 50} meals)`
    : props.outside_food_allowed
    ? "No Canteen (Outside food allowed)"
    : "No Canteen";

  const parkingText = `${props.bus_parking_slots ?? 1} Buses • ${props.car_parking_slots ?? 4} Cars`;
  const transitText = `~${traffic.estimatedMinutes}m drive (${props.distance_km} km)`;
  const weatherText = weatherInfo
    ? `${Math.round(weatherInfo.temperatureC)}°C ${weatherInfo.conditionLabel}`
    : "Weather Live";

  return {
    canteenBadge: canteenText,
    parkingBadge: parkingText,
    transitBadge: transitText,
    weatherBadge: weatherText,
    transitInfo: traffic,
    weatherInfo,
  };
}
