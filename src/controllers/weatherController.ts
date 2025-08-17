import { Request, Response } from 'express';
import { getWeather } from '../services/weatherService';

const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Cloudy',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
  67: 'Heavy freezing rain', 71: 'Slight snow fall', 73: 'Moderate snow fall',
  75: 'Heavy snow fall', 77: 'Snow grains', 80: 'Slight rain showers',
  81: 'Moderate rain showers', 82: 'Violent rain showers', 85: 'Slight snow showers',
  86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function getCurrentWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
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

export async function getCurrentWeather(req: Request, res: Response) {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude query parameters are required' });
  }

  try {
    const data = await getWeather(Number(latitude), Number(longitude));

    const today = new Date().toISOString().split('T')[0];
    const todayIndex = data.daily?.time?.findIndex((d: string) => d === today) ?? -1;

    let precipitation: number | null = null;
    if (todayIndex !== -1 && data.daily?.precipitation_sum) {
      precipitation = data.daily.precipitation_sum[todayIndex] ?? null;
    }

    // Calculate daily max humidity from hourly data
    let humidity: number | null = null;
    if (data.hourly?.relative_humidity_2m && data.hourly?.time) {
      const todayHumidity = data.hourly.relative_humidity_2m.filter(
        (_: number, idx: number) => data.hourly.time[idx].startsWith(today)
      );
      if (todayHumidity.length > 0) {
        humidity = Math.max(...todayHumidity);
      }
    }

    const currentWeather = data.current_weather;
    if (!currentWeather) {
      throw new Error('Current weather data not available');
    }

    const result = {
      temperature: currentWeather.temperature,
      weatherCode: currentWeather.weathercode,
      weatherType: weatherCodeMap[currentWeather.weathercode] || 'Unknown',
      precipitation,
      humidity
    };

    res.json(result);
  } catch (error) {
    console.error('🌤️ Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch current weather data' });
  }
}

export async function getWeeklyWeather(req: Request, res: Response) {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query parameters are required' });
  }

  try {
    const weekDates = getCurrentWeekDates();
    const start = weekDates[0].toISOString().split('T')[0];
    const end = weekDates[6].toISOString().split('T')[0];

    const data = await getWeather(Number(lat), Number(lon), start, end);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const result: Record<string, any> = {};

    data.daily.time.forEach((date: string, idx: number) => {
      // Calculate humidity for that day
      let dailyHumidity: number | null = null;
      if (data.hourly?.relative_humidity_2m && data.hourly?.time) {
        const dayHumidity = data.hourly.relative_humidity_2m.filter(
          (_: number, hIdx: number) => data.hourly.time[hIdx].startsWith(date)
        );
        if (dayHumidity.length > 0) {
          dailyHumidity = Math.max(...dayHumidity);
        }
      }

      const code = data.daily.weathercode ? data.daily.weathercode[idx] : null;
      const dayName = days[new Date(date).getDay()];

      result[dayName] = {
        date,
        temperature: data.daily.temperature_2m_max[idx],
        precipitation: data.daily.precipitation_sum[idx] ?? null,
        humidity: dailyHumidity,
        wind: data.daily.windspeed_10m_max[idx],
        weatherType: code !== null && code !== undefined ? weatherCodeMap[code] || 'Unknown' : null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('🌤️ Weekly Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly weather data' });
  }
}
