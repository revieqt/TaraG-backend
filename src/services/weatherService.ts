import axios from 'axios';

export async function getWeather(lat: number, lon: number, start?: string, end?: string) {
  const params: any = {
    latitude: lat,
    longitude: lon,
    current_weather: true,
    daily: [
      'temperature_2m_max',
      'precipitation_sum',
      'windspeed_10m_max',
      'weathercode'
    ].join(','),
    hourly: [
      'relative_humidity_2m'
    ].join(','),
    timezone: 'auto'
  };

  if (start && end) {
    params.start_date = start;
    params.end_date = end;
  }

  const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
  return response.data;
}
