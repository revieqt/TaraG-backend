import axios from 'axios';

export async function getWeather(lat: number, lon: number, start?: string, end?: string) {
  const params: any = {
    latitude: lat,
    longitude: lon,
    daily: [
      'temperature_2m_max',
      'precipitation_sum',
      'relative_humidity_2m_max',
      'windspeed_10m_max',
      'weathercode'
    ].join(','),
    timezone: 'auto',
  };
  if (start && end) {
    params.start_date = start;
    params.end_date = end;
  } else {
    params.current_weather = true;
  }
  const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
  return response.data;
} 