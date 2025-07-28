import { Request, Response } from 'express';
import { getWeather } from '../services/weatherService';

// Open-Meteo weather code to description mapping
const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Clouds',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

// Helper to get dates for the current week (Sunday to Monday)
function getCurrentWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - dayOfWeek);
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

export async function getWeeklyWeather(req: Request, res: Response) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query parameters are required' });
  }
  try {
    // Fetch daily weather data for the week
    const weekDates = getCurrentWeekDates();
    const start = weekDates[0].toISOString().split('T')[0];
    const end = weekDates[6].toISOString().split('T')[0];
    const data = await getWeather(Number(lat), Number(lon), start, end);
    // Assume data.daily contains arrays for each parameter, and data.daily.time is the date array
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result: any = {};
    data.daily.time.forEach((date: string, idx: number) => {
      const dayName = days[new Date(date).getDay()];
      const code = data.daily.weathercode ? data.daily.weathercode[idx] : null;
      result[dayName] = {
        date: date,
        temperature: data.daily.temperature_2m_max[idx],
        precipitation: data.daily.precipitation_sum[idx],
        humidity: data.daily.relative_humidity_2m_max ? data.daily.relative_humidity_2m_max[idx] : null,
        wind: data.daily.windspeed_10m_max[idx],
        weatherType: code !== null && code !== undefined ? weatherCodeMap[code] || 'Unknown' : null
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly weather data' });
  }
} 