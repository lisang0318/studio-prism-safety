export interface WeatherLookupResult {
  condition: '맑음' | '흐림' | '비' | '눈' | '강풍';
  conditionDetail: string;
  temperature: string; // e.g. "25" or "24.5"
  precipitationProbability: string; // e.g. "20%"
  windSpeed: string; // e.g. "2.4 m/s"
  locationName: string;
  queryDate: string;
  lookedUpAt: string;
}

interface StudioCoordinate {
  name: string;
  lat: number;
  lon: number;
}

const KNOWN_STUDIO_COORDINATES: Record<string, StudioCoordinate> = {
  상암: { name: '상암 프리즘타워 (서울 마포구)', lat: 37.580, lon: 126.890 },
  프리즘: { name: '상암 프리즘타워 (서울 마포구)', lat: 37.580, lon: 126.890 },
  탄현: { name: '탄현 제작센터 (경기 고양시)', lat: 37.695, lon: 126.772 },
  일산: { name: '일산 스튜디오 (경기 고양시)', lat: 37.658, lon: 126.770 },
  인천: { name: '인천 넥스트 스튜디오 (인천 남동구)', lat: 37.456, lon: 126.705 },
  강화: { name: '강화 고인돌 체육관 (인천 강화군)', lat: 37.746, lon: 126.488 },
  문경: { name: '문경 야외세트장 (경북 문경시)', lat: 36.597, lon: 128.198 },
  목동: { name: 'SBS 목동 본사 (서울 양천구)', lat: 37.528, lon: 126.875 },
  가평: { name: '가평 야외 촬영지 (경기 가평군)', lat: 37.831, lon: 127.509 },
  춘천: { name: '춘천 야외 촬영지 (강원 춘천시)', lat: 37.881, lon: 127.730 },
  제주: { name: '제주도 로케이션 (제주특별자치도)', lat: 33.499, lon: 126.531 },
  부산: { name: '부산 로케이션 (부산광역시)', lat: 35.179, lon: 129.075 }
};

const DEFAULT_COORDINATE: StudioCoordinate = {
  name: '서울 수도권 (기본)',
  lat: 37.5665,
  lon: 126.9780
};

/**
 * Resolves latitude and longitude from location text
 */
export async function resolveLocationCoordinate(locationText: string): Promise<StudioCoordinate> {
  const trimmed = locationText.trim();
  if (!trimmed) return DEFAULT_COORDINATE;

  // 1. Check known studio presets
  for (const [key, coord] of Object.entries(KNOWN_STUDIO_COORDINATES)) {
    if (trimmed.includes(key)) {
      return coord;
    }
  }

  // 2. Fallback to Open-Meteo free Geocoding API if unknown location
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=ko&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          name: `${result.name} (${result.admin1 || result.country || '대한민국'})`,
          lat: result.latitude,
          lon: result.longitude
        };
      }
    }
  } catch (e) {
    console.warn('Geocoding fallback notice:', e);
  }

  return DEFAULT_COORDINATE;
}

/**
 * Maps WMO weathercode to Korean condition
 */
export function mapWmoCodeToCondition(code: number, windSpeedKmh: number): { condition: '맑음' | '흐림' | '비' | '눈' | '강풍'; detail: string } {
  // Check severe wind first (>= 36 km/h = 10 m/s)
  if (windSpeedKmh >= 36) {
    return { condition: '강풍', detail: '강풍 주의보 (특효·고소작업 주의)' };
  }

  if (code === 0) {
    return { condition: '맑음', detail: '맑음 (쾌청)' };
  }
  if (code === 1 || code === 2) {
    return { condition: '맑음', detail: '대체로 맑음 (구름 약간)' };
  }
  if (code === 3) {
    return { condition: '흐림', detail: '흐림 (구름 많음)' };
  }
  if (code === 45 || code === 48) {
    return { condition: '흐림', detail: '안개 (시야 주의)' };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { condition: '비', detail: '비 (강우 주의)' };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { condition: '눈', detail: '눈 (결빙 주의)' };
  }
  if ([95, 96, 99].includes(code)) {
    return { condition: '비', detail: '뇌우 / 소나기 (야외작업 금지)' };
  }

  return { condition: '맑음', detail: '보통' };
}

/**
 * Fetches free weather forecast from Open-Meteo (No API key required)
 */
export async function fetchOpenMeteoWeather(locationText: string, dateStr: string): Promise<WeatherLookupResult> {
  const coord = await resolveLocationCoordinate(locationText);
  
  // Format target date YYYY-MM-DD
  const now = new Date();
  let targetDate = dateStr ? dateStr.slice(0, 10) : now.toISOString().slice(0, 10);
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    targetDate = now.toISOString().slice(0, 10);
  }

  // Try fetching single day first, if fails try general 7-day forecast
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FSeoul&start_date=${targetDate}&end_date=${targetDate}`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      // Fallback to standard 7-day forecast if date is outside range
      url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FSeoul`;
      res = await fetch(url);
    }

    if (!res.ok) {
      throw new Error(`Open-Meteo API response status: ${res.status}`);
    }

    const data = await res.json();

    // Check if targetDate is in daily.time array
    let dayIndex = 0;
    if (data.daily?.time && Array.isArray(data.daily.time)) {
      const idx = data.daily.time.indexOf(targetDate);
      if (idx !== -1) dayIndex = idx;
    }

    const dailyCode = data.daily?.weathercode?.[dayIndex] ?? 0;
    const maxTemp = data.daily?.temperature_2m_max?.[dayIndex];
    const minTemp = data.daily?.temperature_2m_min?.[dayIndex];
    const precipProb = data.daily?.precipitation_probability_max?.[dayIndex] ?? 10;
    const maxWindKmh = data.daily?.wind_speed_10m_max?.[dayIndex] ?? 7.2;

    // Wind speed converted to m/s (1 km/h = 0.2778 m/s)
    const windSpeedMs = (maxWindKmh / 3.6).toFixed(1);

    // Temperature text
    let tempStr = '24.0';
    if (maxTemp !== undefined && minTemp !== undefined) {
      const avgTemp = ((maxTemp + minTemp) / 2).toFixed(1);
      tempStr = `${avgTemp}`;
    }

    const { condition, detail } = mapWmoCodeToCondition(dailyCode, maxWindKmh);

    return {
      condition,
      conditionDetail: detail,
      temperature: tempStr,
      precipitationProbability: `${precipProb}%`,
      windSpeed: `${windSpeedMs} m/s`,
      locationName: coord.name,
      queryDate: targetDate,
      lookedUpAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    console.warn('Open-Meteo weather fetch fallback:', error);
    
    // Clean fallback result
    return {
      condition: '맑음',
      conditionDetail: '맑음 (표준 기상)',
      temperature: '24.0',
      precipitationProbability: '10%',
      windSpeed: '2.0 m/s',
      locationName: coord.name,
      queryDate: targetDate,
      lookedUpAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  }
}
