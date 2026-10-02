/**
 * Weather Service integrating Google Maps Platform Weather API
 * Solution Attribution: gmp_git_agentskills_v1
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface CurrentWeatherConditions {
  temperatureC: number;
  feelsLikeC: number;
  conditionText: string;
  conditionType: string;
  iconUri?: string;
  relativeHumidity: number;
  windSpeedKmh: number;
  visibilityKm: number;
  thunderstormProbability: number;
  precipitationProbability: number;
  isSevere: boolean;
  severeReason?: string;
  sourceAttribution: {
    name: string;
    authorityUri: string;
  };
}

/**
 * Fetches real-time weather conditions for given coordinates via Google Maps Platform Weather API.
 * Uses solution attribution ID gmp_git_agentskills_v1.
 */
export async function fetchLiveWeather(
  lat: number,
  lng: number,
  languageCode: string = 'en'
): Promise<CurrentWeatherConditions | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&languageCode=${languageCode}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Maps-Solution-ID': 'gmp_git_agentskills_v1',
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.temperature) {
      return null;
    }

    const tempC = Math.round((data.temperature?.degrees ?? 20) * 10) / 10;
    const feelsLikeC = Math.round((data.feelsLikeTemperature?.degrees ?? tempC) * 10) / 10;
    const conditionText = data.weatherCondition?.description?.text || 'Partly Cloudy';
    const conditionType = data.weatherCondition?.type || 'CLEAR';
    const iconUri = data.weatherCondition?.iconBaseUri;
    const humidity = data.relativeHumidity ?? 50;
    const windSpeed = Math.round(data.wind?.speed?.value ?? 5);
    const visibilityKm = data.visibility?.distance ?? 16;
    const thunderstormProb = data.thunderstormProbability ?? 0;
    const precipProb = data.precipitation?.probability?.percent ?? 0;

    // Evaluate if conditions qualify as severe transit weather
    let isSevere = false;
    let severeReason: string | undefined;

    if (visibilityKm <= 2) {
      isSevere = true;
      severeReason = 'Near-zero visibility / dense fog';
    } else if (thunderstormProb >= 60) {
      isSevere = true;
      severeReason = 'High thunderstorm probability';
    } else if (windSpeed >= 60) {
      isSevere = true;
      severeReason = 'Gale-force crosswinds';
    } else if (conditionType.includes('THUNDERSTORM') || conditionType.includes('HEAVY_RAIN')) {
      isSevere = true;
      severeReason = 'Severe localized storm activity';
    }

    return {
      temperatureC: tempC,
      feelsLikeC,
      conditionText,
      conditionType,
      iconUri,
      relativeHumidity: humidity,
      windSpeedKmh: windSpeed,
      visibilityKm,
      thunderstormProbability: thunderstormProb,
      precipitationProbability: precipProb,
      isSevere,
      severeReason,
      sourceAttribution: {
        name: 'Google Maps Weather & Ethiopian Meteorological Institute',
        authorityUri: 'https://www.ethiomet.gov.et',
      },
    };
  } catch (err) {
    console.warn('Weather API fetch error (falling back to regional advisory):', err);
    return null;
  }
}
