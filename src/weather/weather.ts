import * as Location from "expo-location";

export type WalkAdvice = "good" | "short" | "wait";
export type WeatherSummary = "clear" | "mostlyClear" | "cloudy" | "foggy" | "rainy" | "snowy" | "showers" | "snowShowers" | "thunderstorms";

export type WeatherHour = {
  at: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  windSpeed: number;
  icon: string;
  summaryKey: WeatherSummary;
  advice: WalkAdvice;
};

export type TodayWeather = {
  hours: WeatherHour[];
  updatedAt: string;
};

type ForecastPayload = {
  hourly?: {
    time?: number[];
    temperature_2m?: number[];
    weather_code?: number[];
    precipitation_probability?: number[];
    wind_speed_10m?: number[];
  };
};

const weatherDescription = (code: number): { icon: string; summaryKey: WeatherSummary; storm: boolean; snow: boolean } => {
  if (code === 0) return { icon: "☀️", summaryKey: "clear", storm: false, snow: false };
  if (code <= 3) return { icon: code === 1 ? "🌤️" : "☁️", summaryKey: code === 1 ? "mostlyClear" : "cloudy", storm: false, snow: false };
  if (code === 45 || code === 48) return { icon: "🌫️", summaryKey: "foggy", storm: false, snow: false };
  if (code >= 51 && code <= 67) return { icon: "🌧️", summaryKey: "rainy", storm: false, snow: false };
  if (code >= 71 && code <= 77) return { icon: "🌨️", summaryKey: "snowy", storm: false, snow: true };
  if (code >= 80 && code <= 82) return { icon: "🌦️", summaryKey: "showers", storm: false, snow: false };
  if (code === 85 || code === 86) return { icon: "🌨️", summaryKey: "snowShowers", storm: false, snow: true };
  if (code >= 95) return { icon: "⛈️", summaryKey: "thunderstorms", storm: true, snow: false };
  return { icon: "☁️", summaryKey: "cloudy", storm: false, snow: false };
};

const adviceFor = (temperature: number, rain: number, wind: number, code: number): WalkAdvice => {
  const description = weatherDescription(code);
  if (description.storm || temperature < -15 || temperature > 30 || rain >= 75) return "wait";
  if (temperature < -8 || temperature > 26 || rain >= 40 || wind >= 35 || description.snow) return "short";
  return "good";
};

/**
 * Gets only the current day's hourly forecast. Coordinates are used for this
 * request and never persisted. Open-Meteo does not require an API key.
 */
export async function loadTodayWeather(): Promise<TodayWeather | null> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) return null;
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const { latitude, longitude } = position.coords;
  const query = new URLSearchParams({
    // Weather is accurate enough at roughly kilometre precision; avoid
    // sending more location detail than this feature needs.
    latitude: latitude.toFixed(2),
    longitude: longitude.toFixed(2),
    hourly: "temperature_2m,weather_code,precipitation_probability,wind_speed_10m",
    // Two days ensures that a late-evening request still has six hours ahead.
    forecast_days: "2",
    timezone: "auto",
    timeformat: "unixtime",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query.toString()}`);
  if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
  const payload = (await response.json()) as ForecastPayload;
  const hourly = payload.hourly;
  if (!hourly?.time?.length || !hourly.temperature_2m || !hourly.weather_code) return null;
  const now = Date.now() / 1000;
  let start = hourly.time.findIndex((stamp) => stamp >= now - 30 * 60);
  if (start < 0) start = 0;
  const hours: WeatherHour[] = hourly.time.slice(start, start + 7).map((stamp, offset) => {
    const index = start + offset;
    const temperature = Math.round((hourly.temperature_2m?.[index] ?? 0) * 10) / 10;
    const weatherCode = hourly.weather_code?.[index] ?? 0;
    const precipitationProbability = hourly.precipitation_probability?.[index] ?? 0;
    const windSpeed = hourly.wind_speed_10m?.[index] ?? 0;
    const description = weatherDescription(weatherCode);
    return { at: new Date(stamp * 1000).toISOString(), temperature, weatherCode, precipitationProbability, windSpeed, icon: description.icon, summaryKey: description.summaryKey, advice: adviceFor(temperature, precipitationProbability, windSpeed, weatherCode) };
  });
  return { hours, updatedAt: new Date().toISOString() };
}
