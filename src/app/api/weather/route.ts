import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Preset coordinates for major Korean broadcast production hubs & regions
const KNOWN_COORDINATES: Record<string, { name: string; lat: number; lon: number }> = {
  '강화': { name: '인천 강화군', lat: 37.7472, lon: 126.4856 },
  '상암': { name: '서울 마포구 상암동', lat: 37.5794, lon: 126.8899 },
  '마포': { name: '서울 마포구', lat: 37.5663, lon: 126.9016 },
  '프리즘': { name: '상암 SBS 프리즘타워', lat: 37.5794, lon: 126.8899 },
  '목동': { name: '서울 양천구 목동 SBS', lat: 37.5283, lon: 126.8752 },
  '탄현': { name: '경기 고양시 일산서구 탄현', lat: 37.6934, lon: 126.7712 },
  '일산': { name: '경기 고양시 일산동구', lat: 37.6584, lon: 126.7744 },
  '고양': { name: '경기 고양시', lat: 37.6584, lon: 126.8320 },
  '여의도': { name: '서울 영등포구 여의도', lat: 37.5215, lon: 126.9242 },
  '영등포': { name: '서울 영등포구', lat: 37.5264, lon: 126.8962 },
  '강남': { name: '서울 강남구', lat: 37.5172, lon: 127.0473 },
  '서초': { name: '서울 서초구', lat: 37.4837, lon: 127.0324 },
  '송파': { name: '서울 송파구', lat: 37.5145, lon: 127.1060 },
  '종로': { name: '서울 종로구', lat: 37.5730, lon: 126.9794 },
  '가평': { name: '경기 가평군', lat: 37.8315, lon: 127.5097 },
  '춘천': { name: '강원 춘천시', lat: 37.8813, lon: 127.7298 },
  '양평': { name: '경기 양평군', lat: 37.4917, lon: 127.4876 },
  '파주': { name: '경기 파주시', lat: 37.7599, lon: 126.7801 },
  '김포': { name: '경기 김포시', lat: 37.6152, lon: 126.7157 },
  '인천': { name: '인천광역시', lat: 37.4563, lon: 126.7052 },
  '수원': { name: '경기 수원시', lat: 37.2636, lon: 127.0286 },
  '성남': { name: '경기 성남시', lat: 37.4201, lon: 127.1265 },
  '용인': { name: '경기 용인시', lat: 37.2411, lon: 127.1776 },
  '부산': { name: '부산광역시', lat: 35.1796, lon: 129.0756 },
  '해운대': { name: '부산 해운대구', lat: 35.1631, lon: 129.1636 },
  '대구': { name: '대구광역시', lat: 35.8714, lon: 128.6014 },
  '대전': { name: '대전광역시', lat: 36.3504, lon: 127.3845 },
  '광주': { name: '광주광역시', lat: 35.1595, lon: 126.8526 },
  '울산': { name: '울산광역시', lat: 35.5384, lon: 129.3114 },
  '세종': { name: '세종특별자치시', lat: 36.4801, lon: 127.2890 },
  '제주': { name: '제주특별자치도', lat: 33.4996, lon: 126.5312 },
  '서귀포': { name: '제주 서귀포시', lat: 33.2541, lon: 126.5601 },
  '강릉': { name: '강원 강릉시', lat: 37.7519, lon: 128.8761 },
  '속초': { name: '강원 속초시', lat: 38.2070, lon: 128.5918 },
  '원주': { name: '강원 원주시', lat: 37.3422, lon: 127.9202 },
  '전주': { name: '전북 전주시', lat: 35.8242, lon: 127.1480 },
  '여수': { name: '전남 여수시', lat: 34.7604, lon: 127.6622 },
  '포항': { name: '경북 포항시', lat: 36.0190, lon: 129.3435 },
  '창원': { name: '경남 창원시', lat: 35.2270, lon: 128.6811 }
};

// Convert WMO code to Korean Safety Category
function mapWmoToSafetyWeather(wmoCode: number, windSpeedKmH: number): '맑음' | '흐림' | '비' | '눈' | '강풍' {
  if (windSpeedKmH >= 35) {
    return '강풍';
  }
  if (wmoCode === 0 || wmoCode === 1 || wmoCode === 2) {
    return '맑음';
  }
  if (wmoCode === 3 || wmoCode === 45 || wmoCode === 48) {
    return '흐림';
  }
  if (
    (wmoCode >= 51 && wmoCode <= 67) ||
    (wmoCode >= 80 && wmoCode <= 82) ||
    (wmoCode >= 95 && wmoCode <= 99)
  ) {
    return '비';
  }
  if ((wmoCode >= 71 && wmoCode <= 77) || wmoCode === 85 || wmoCode === 86) {
    return '눈';
  }
  return '맑음';
}

function getWeatherKoreanDescription(wmoCode: number): string {
  switch (wmoCode) {
    case 0: return '맑음';
    case 1: return '대체로 맑음';
    case 2: return '구름 조금';
    case 3: return '흐림';
    case 45: case 48: return '안개';
    case 51: case 53: case 55: return '이슬비';
    case 61: case 63: case 65: return '비';
    case 66: case 67: return '어는 비';
    case 71: case 73: case 75: return '눈';
    case 77: return '싸락눈';
    case 80: case 81: case 82: return '소나기';
    case 85: case 86: return '눈 소나기';
    case 95: return '뇌우';
    case 96: case 99: return '우박 동반 뇌우';
    default: return '맑음';
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationQuery = searchParams.get('location') || '';

    const cleanLoc = locationQuery.trim();
    if (!cleanLoc) {
      return NextResponse.json({
        success: false,
        message: '장소를 입력해 주세요.'
      }, { status: 400 });
    }

    // 1. Find lat/lon from known presets
    let matchedLat = 37.5665;
    let matchedLon = 126.9780;
    let matchedName = '서울';

    let foundKey = false;
    for (const key of Object.keys(KNOWN_COORDINATES)) {
      if (cleanLoc.includes(key)) {
        matchedLat = KNOWN_COORDINATES[key].lat;
        matchedLon = KNOWN_COORDINATES[key].lon;
        matchedName = KNOWN_COORDINATES[key].name;
        foundKey = true;
        break;
      }
    }

    // 2. If not in preset dictionary, attempt Open-Meteo Geocoding
    if (!foundKey) {
      try {
        const geoRes = await fetch(
          'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(cleanLoc) + '&count=1&language=ko&format=json'
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            const first = geoData.results[0];
            matchedLat = first.latitude;
            matchedLon = first.longitude;
            matchedName = (first.admin1 ? first.admin1 + ' ' : '') + (first.name || cleanLoc);
          }
        }
      } catch (geoErr) {
        console.warn('Geocoding fallback failed, using default coords:', geoErr);
      }
    }

    // 3. Fetch real-time weather from Open-Meteo
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + matchedLat + '&longitude=' + matchedLon + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FSeoul';
    
    const weatherRes = await fetch(weatherUrl, { cache: 'no-store' });
    if (!weatherRes.ok) {
      throw new Error('Open-Meteo responded with status ' + weatherRes.status);
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error('No current weather data available in Open-Meteo response');
    }

    const tempVal = current.temperature_2m;
    const humidityVal = current.relative_humidity_2m;
    const wmoCode = current.weather_code ?? 0;
    const windSpeedKmH = current.wind_speed_10m ?? 0;
    const windSpeedMS = (windSpeedKmH / 3.6).toFixed(1);

    const safetyCategory = mapWmoToSafetyWeather(wmoCode, windSpeedKmH);
    const weatherDesc = getWeatherKoreanDescription(wmoCode);
    const tempStr = Math.round(tempVal * 10) / 10 + '℃';

    const summary = matchedName + ' 실시간 기상 (' + tempStr + ' ' + weatherDesc + '·습도 ' + humidityVal + '%·풍속 ' + windSpeedMS + 'm/s)';

    return NextResponse.json({
      success: true,
      locationQuery: cleanLoc,
      resolvedLocation: matchedName,
      weather: safetyCategory,
      temperature: tempStr,
      humidity: humidityVal + '%',
      windSpeed: windSpeedMS + 'm/s',
      weatherCode: wmoCode,
      weatherDesc,
      summary,
      fetchedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Real-time weather API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch real-time weather'
    }, { status: 500 });
  }
}
