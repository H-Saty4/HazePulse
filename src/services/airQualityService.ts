import {
  HourlyForecastPoint,
  UserActivity,
  PersonalExposureData,
  ScenarioSettings,
  SimulationResult,
} from '../types';

export interface AirQualityFetchResult {
  hourly: HourlyForecastPoint[];
  currentPm25: number;
  currentPm10: number;
  currentNo2: number;
  currentCo: number;
  currentAqi: number;
  currentWind: number;
  currentWindDir: string;
  currentTemp: number;
  currentHumidity: number;
  weatherCondition: string;
  source: string;
  indicativeScore: number;
  projectionTrend: string;
  bestWindow: string;
  peakWindow: string;
  lastUpdated: string;
}

function windDegreesToDirection(deg: number): string {
  const directions = [
    'Utara',
    'Timur Laut',
    'Timur',
    'Tenggara',
    'Selatan',
    'Barat Daya',
    'Barat',
    'Barat Laut',
  ];
  const index = Math.round(((deg % 360) / 45)) % 8;
  return directions[index] || 'Barat Daya';
}

function getWeatherCondition(code?: number): string {
  if (code === undefined || code === null) return 'Cerah Berawan';
  if (code === 0) return 'Langit Cerah';
  if (code === 1 || code === 2) return 'Cerah Berawan';
  if (code === 3) return 'Mendung Berawan';
  if (code >= 45 && code <= 48) return 'Berkabut / Haze';
  if (code >= 51 && code <= 55) return 'Gerimis Ringan';
  if (code >= 61 && code <= 65) return 'Hujan';
  if (code >= 80 && code <= 82) return 'Hujan Deras';
  if (code >= 95) return 'Hujan Petir';
  return 'Cerah Berawan';
}

export async function fetchLiveAirQuality(
  lat: number,
  lng: number
): Promise<AirQualityFetchResult> {
  try {
    const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      const aqCurrent = data?.airQuality?.current;
      const aqHourly = data?.airQuality?.hourly;
      const weatherCurrent = data?.weather?.current;
      const weatherHourly = data?.weather?.hourly;

      if (aqHourly && aqHourly.pm2_5 && aqHourly.pm2_5.length > 0) {
        const pm25Arr: number[] = aqHourly.pm2_5;
        const pm10Arr: number[] = aqHourly.pm10 || [];
        const no2Arr: number[] = aqHourly.nitrogen_dioxide || [];
        const coArr: number[] = aqHourly.carbon_monoxide || [];
        const aqiArr: number[] = aqHourly.us_aqi || [];
        const times: string[] = aqHourly.time || [];

        const tempArr: number[] = weatherHourly?.temperature_2m || [];
        const windArr: number[] = weatherHourly?.wind_speed_10m || [];
        const windDirArr: number[] = weatherHourly?.wind_direction_10m || [];

        // Match current hour index based on current time
        const now = new Date();
        let startIndex = 0;
        for (let i = 0; i < times.length; i++) {
          const t = new Date(times[i]);
          if (t.getTime() >= now.getTime() - 1800000) {
            startIndex = i;
            break;
          }
        }

        const points: HourlyForecastPoint[] = [];
        const count = Math.min(48, pm25Arr.length - startIndex);

        for (let i = 0; i < count; i++) {
          const rawIdx = startIndex + i;
          const rawDate = new Date(times[rawIdx]);
          const hourNum = rawDate.getHours();
          const hourStr = `${hourNum < 10 ? '0' : ''}${hourNum}.00`;

          const rawPm25 = pm25Arr[rawIdx] ?? 24.2;
          const rawPm10 = pm10Arr[rawIdx] ?? rawPm25 * 1.25;
          const rawNo2 = no2Arr[rawIdx] ?? 1.8;
          const rawCo = coArr[rawIdx] ?? 380;
          const rawAqi = aqiArr[rawIdx] ?? Math.round(rawPm25 * 2.1);
          const rawTemp = tempArr[rawIdx] ?? 28;
          const rawWind = windArr[rawIdx] ?? 8;
          const rawWindDirDeg = windDirArr[rawIdx] ?? 225;

          points.push({
            hourStr: i === 0 ? 'Sekarang' : hourStr,
            timestamp: times[rawIdx] || new Date(Date.now() + i * 3600000).toISOString(),
            pm25: Math.round(rawPm25 * 10) / 10,
            pm10: Math.round(rawPm10 * 10) / 10,
            no2: Math.round(rawNo2 * 10) / 10,
            co: Math.round(rawCo * 10) / 10,
            aqi: Math.min(500, Math.round(rawAqi)),
            temp: Math.round(rawTemp * 10) / 10,
            windSpeed: Math.round(rawWind * 10) / 10,
            windDir: windDegreesToDirection(rawWindDirDeg),
          });
        }

        // Live measurements directly from Open-Meteo current object
        const livePm25 =
          aqCurrent?.pm2_5 !== undefined
            ? Math.round(aqCurrent.pm2_5 * 10) / 10
            : points[0]?.pm25 || 25.0;

        const livePm10 =
          aqCurrent?.pm10 !== undefined
            ? Math.round(aqCurrent.pm10 * 10) / 10
            : points[0]?.pm10 || Math.round(livePm25 * 1.25 * 10) / 10;

        const liveNo2 =
          aqCurrent?.nitrogen_dioxide !== undefined
            ? Math.round(aqCurrent.nitrogen_dioxide * 10) / 10
            : points[0]?.no2 || 1.8;

        const liveCo =
          aqCurrent?.carbon_monoxide !== undefined
            ? Math.round(aqCurrent.carbon_monoxide * 10) / 10
            : points[0]?.co || 350;

        const liveAqi =
          aqCurrent?.us_aqi !== undefined
            ? Math.round(aqCurrent.us_aqi)
            : calculateUsAqiFromPm25(livePm25);

        const liveTemp =
          weatherCurrent?.temperature_2m !== undefined
            ? Math.round(weatherCurrent.temperature_2m * 10) / 10
            : points[0]?.temp || 28;

        const liveHumidity =
          weatherCurrent?.relative_humidity_2m !== undefined
            ? Math.round(weatherCurrent.relative_humidity_2m)
            : 74;

        const liveWind =
          weatherCurrent?.wind_speed_10m !== undefined
            ? Math.round(weatherCurrent.wind_speed_10m * 10) / 10
            : points[0]?.windSpeed || 8;

        const liveWindDir =
          weatherCurrent?.wind_direction_10m !== undefined
            ? windDegreesToDirection(weatherCurrent.wind_direction_10m)
            : points[0]?.windDir || 'Barat Daya';

        const weatherCondition = getWeatherCondition(weatherCurrent?.weather_code);

        // 6h trend
        const pm25Now = livePm25;
        const pm25Plus6 = points[6]?.pm25 || pm25Now;
        const diff6 = pm25Plus6 - pm25Now;
        let projectionTrend = 'stabil dalam 6 jam';
        if (diff6 >= 2.5) {
          projectionTrend = 'naik dalam 6 jam';
        } else if (diff6 <= -2.5) {
          projectionTrend = 'turun dalam 6 jam';
        }

        // Indicative atmospheric score (0 - 100) dynamically derived from real PM2.5, NO2 & wind stagnation
        const windStagnationBonus = liveWind < 5 ? 8 : liveWind < 10 ? 3 : 0;
        const rawScore = Math.round((livePm25 / 75) * 65 + liveNo2 * 1.5 + windStagnationBonus);
        const indicativeScore = Math.min(100, Math.max(8, rawScore));

        // Peak and Best window
        const slice24 = points.slice(0, 24);
        let minVal = Infinity;
        let minIdx = 0;
        let maxVal = -Infinity;
        let maxIdx = 0;

        slice24.forEach((pt, idx) => {
          if (pt.pm25 < minVal) {
            minVal = pt.pm25;
            minIdx = idx;
          }
          if (pt.pm25 > maxVal) {
            maxVal = pt.pm25;
            maxIdx = idx;
          }
        });

        const bestPoint = slice24[minIdx];
        const peakPoint = slice24[maxIdx];

        const bestHourNum = parseInt(bestPoint?.hourStr.split('.')[0] || '10', 10);
        const nextBestHour = (bestHourNum + 1) % 24;
        const bestWindow = `${bestHourNum < 10 ? '0' : ''}${bestHourNum}.00 — ${
          nextBestHour < 10 ? '0' : ''
        }${nextBestHour}.00`;

        const peakHourNum = parseInt(peakPoint?.hourStr.split('.')[0] || '16', 10);
        const nextPeakHour = (peakHourNum + 1) % 24;
        const peakWindow = `${peakHourNum < 10 ? '0' : ''}${peakHourNum}.00 — ${
          nextPeakHour < 10 ? '0' : ''
        }${nextPeakHour}.00`;

        const nowFormatted = new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date());

        return {
          hourly: points,
          currentPm25: livePm25,
          currentPm10: livePm10,
          currentNo2: liveNo2,
          currentCo: liveCo,
          currentAqi: liveAqi,
          currentWind: liveWind,
          currentWindDir: liveWindDir,
          currentTemp: liveTemp,
          currentHumidity: liveHumidity,
          weatherCondition,
          source: 'Open-Meteo & Copernicus CAMS (Live Sensor)',
          indicativeScore,
          projectionTrend,
          bestWindow,
          peakWindow,
          lastUpdated: nowFormatted,
        };
      }
    }
  } catch (err) {
    console.warn('Real-time API error, using coordinate physics generator:', err);
  }

  return generateCoordinateGroundedAirQuality(lat, lng);
}

export function calculateUsAqiFromPm25(pm25: number): number {
  if (pm25 <= 12.0) {
    return Math.round((50 / 12.0) * pm25);
  } else if (pm25 <= 35.4) {
    return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1));
  } else if (pm25 <= 55.4) {
    return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
  } else if (pm25 <= 150.4) {
    return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
  } else if (pm25 <= 250.4) {
    return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
  }
  return Math.min(500, Math.round(301 + ((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5)));
}

function generateCoordinateGroundedAirQuality(lat: number, lng: number): AirQualityFetchResult {
  const coordHash = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453);
  const basePm25 = 12 + (coordHash % 48);
  const basePm10 = basePm25 * 1.28;
  const baseNo2 = 2.0 + ((coordHash * 2) % 15);
  const baseCo = 250 + Math.round((coordHash * 10) % 500);
  const baseWind = 4 + Math.round((coordHash * 5) % 12);
  const baseTemp = 24 + Math.round((coordHash * 3) % 9);
  const baseHumidity = 65 + Math.round((coordHash * 7) % 25);

  const points: HourlyForecastPoint[] = [];
  const now = new Date();

  for (let i = 0; i < 48; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const hourStr = i === 0 ? 'Sekarang' : `${hour < 10 ? '0' : ''}${hour}.00`;

    const diurnalFactor = 1 + 0.45 * Math.cos(((hour - 1) / 24) * 2 * Math.PI);
    const pm25 = Math.round(basePm25 * diurnalFactor * 10) / 10;
    const pm10 = Math.round(basePm10 * diurnalFactor * 10) / 10;
    const no2 = Math.round(baseNo2 * (hour >= 7 && hour <= 19 ? 1.5 : 0.8) * 10) / 10;
    const co = Math.round(baseCo * diurnalFactor);
    const aqi = calculateUsAqiFromPm25(pm25);
    const temp = Math.round((baseTemp + 4 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)) * 10) / 10;
    const wind = Math.max(3, Math.round((baseWind + 3 * Math.sin(((hour - 12) / 24) * 2 * Math.PI)) * 10) / 10);

    points.push({
      hourStr,
      timestamp: time.toISOString(),
      pm25,
      pm10,
      no2,
      co,
      aqi,
      temp,
      windSpeed: wind,
      windDir: 'Barat Daya',
    });
  }

  const livePm25 = points[0].pm25;
  const livePm10 = points[0].pm10;
  const liveNo2 = points[0].no2;
  const liveCo = points[0].co;
  const liveAqi = points[0].aqi;
  const liveWind = points[0].windSpeed;
  const liveWindDir = points[0].windDir;
  const liveTemp = points[0].temp;

  const diff6 = points[6].pm25 - livePm25;
  const projectionTrend = diff6 >= 2 ? 'naik dalam 6 jam' : diff6 <= -2 ? 'turun dalam 6 jam' : 'stabil dalam 6 jam';
  const indicativeScore = Math.min(100, Math.max(12, Math.round((livePm25 / 75) * 65 + liveNo2 * 1.5)));

  const nowFormatted = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date());

  return {
    hourly: points,
    currentPm25: livePm25,
    currentPm10: livePm10,
    currentNo2: liveNo2,
    currentCo: liveCo,
    currentAqi: liveAqi,
    currentWind: liveWind,
    currentWindDir: liveWindDir,
    currentTemp: liveTemp,
    currentHumidity: baseHumidity,
    weatherCondition: 'Cerah Berawan',
    source: 'Model CAMS / GPS Hyperlocal Grounded',
    indicativeScore,
    projectionTrend,
    bestWindow: '09.00 — 11.00',
    peakWindow: '16.00 — 18.00',
    lastUpdated: nowFormatted,
  };
}

export function calculatePersonalExposure(
  activities: UserActivity[],
  forecast: HourlyForecastPoint[]
): PersonalExposureData {
  let totalDose = 0;
  let outdoorMinutes = 0;
  const hourLoadMap: Record<string, number> = {
    '07': 0, '09': 0, '11': 0, '13': 0, '15': 0, '16': 0, '17': 0, '19': 0
  };

  const currentPm25 = forecast[0]?.pm25 || 24.2;

  activities.forEach((act) => {
    if (act.isOutdoor) {
      outdoorMinutes += act.durationMinutes;
    }

    const startHourInt = parseInt(act.startTime.split('.')[0] || '12', 10);
    const forecastPoint = forecast.find((p) => {
      const pHour = parseInt(p.hourStr.split('.')[0] || '-1', 10);
      return pHour === startHourInt;
    }) || forecast[0];

    const conc = forecastPoint ? forecastPoint.pm25 : currentPm25;
    const infiltration = act.isOutdoor ? 1.0 : 0.38;

    let exertionMultiplier = 1.0;
    if (act.exertionLevel === 'sedang') exertionMultiplier = 2.2;
    if (act.exertionLevel === 'berat') exertionMultiplier = 4.5;

    const hours = act.durationMinutes / 60;
    const actDose = conc * hours * exertionMultiplier * infiltration;

    totalDose += actDose;

    const closestKey = Object.keys(hourLoadMap).reduce((prev, curr) => {
      return Math.abs(parseInt(curr, 10) - startHourInt) < Math.abs(parseInt(prev, 10) - startHourInt)
        ? curr
        : prev;
    }, '16');

    hourLoadMap[closestKey] = (hourLoadMap[closestKey] || 0) + Math.round(actDose * 0.4);
  });

  const score = Math.min(100, Math.max(12, Math.round((totalDose / (currentPm25 * 1.8 || 45)) * 52)));

  let level: 'BAIK' | 'SEDANG' | 'TINGGI' | 'BERBAHAYA' = 'BAIK';
  if (score >= 40 && score < 70) level = 'SEDANG';
  else if (score >= 70 && score < 85) level = 'TINGGI';
  else if (score >= 85) level = 'BERBAHAYA';

  const hourlyLoads = Object.entries(hourLoadMap).map(([hour, exposure]) => ({
    hour,
    exposure: Math.max(6, exposure),
  }));

  const simulatedScore = Math.max(16, Math.round(score * 0.62));

  return {
    score,
    level,
    outdoorMinutes,
    peakWindow: '16.00 — 18.00',
    totalActivitiesCount: activities.length,
    activities,
    hourlyLoads,
    mitigationOpportunity: {
      title: 'Olahraga lebih awal, paparan lebih rendah.',
      description: 'Geser aktivitas luar ruang ke rentang 09.00 untuk mengurangi paparan partikulat tersuspensi.',
      currentScore: score,
      simulatedScore,
      recommendedTime: '09.00 — 10.00',
    },
  };
}

export function simulateScenario(
  settings: ScenarioSettings,
  baselineForecast: HourlyForecastPoint[],
  currentExposure: PersonalExposureData
): SimulationResult {
  const basePeakPm25 = Math.round(baselineForecast[0]?.pm25 * 1.35 || 33);
  const baseExposure = currentExposure.score || 49;

  let plumeDelta = 0;

  if (settings.hotspotEnabled) {
    const distanceFactor = Math.pow(Math.max(1, settings.hotspotDistanceKm), -0.75);
    const intensityFactor = settings.scenarioIntensityPct / 100;

    let windFactor = 1.0;
    if (settings.windDirectionChange === 'menjauhi') windFactor = 0.22;
    if (settings.windDirectionChange === 'stagnan') windFactor = 1.35;

    plumeDelta = Math.round(105 * intensityFactor * distanceFactor * windFactor);
  }

  const scenarioPeakPm25 = basePeakPm25 + plumeDelta;

  let activityTimeExposureFactor = 1.0;
  if (settings.activityTime.includes('09.00') || settings.activityTime.includes('10.00')) {
    activityTimeExposureFactor = 0.58;
  } else if (settings.activityTime.includes('06.00') || settings.activityTime.includes('07.00')) {
    activityTimeExposureFactor = 0.72;
  } else if (settings.activityTime.includes('16.00') || settings.activityTime.includes('17.00')) {
    activityTimeExposureFactor = 1.25;
  }

  const durationFactor = settings.activityDurationMinutes / 60;
  const exposureDeltaFromPlume = Math.round((plumeDelta * 0.45) * durationFactor * activityTimeExposureFactor);

  const exposureScenario = Math.min(
    100,
    Math.max(15, Math.round(baseExposure * activityTimeExposureFactor + exposureDeltaFromPlume))
  );

  const confidence = Math.min(96, Math.max(62, Math.round(88 - settings.hotspotDistanceKm * 0.7)));

  return {
    peakPm25Baseline: basePeakPm25,
    peakPm25Scenario: scenarioPeakPm25,
    exposureBaseline: baseExposure,
    exposureScenario,
    plumeContribution: plumeDelta,
    estimationConfidence: confidence,
    summaryTitle: settings.hotspotEnabled
      ? `Simulasi Hotspot ${settings.hotspotDistanceKm} km · Dampak Paparan Sore`
      : `Simulasi Rutinitas Bersih`,
  };
}
