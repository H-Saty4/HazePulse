export type PollutantType = 'pm25' | 'pm10' | 'no2' | 'co' | 'aqi';

export interface LocationInfo {
  name: string;
  region: string;
  lat: number;
  lng: number;
  isGps: boolean;
}

export interface HourlyForecastPoint {
  hourStr: string; // e.g. "13.00"
  timestamp: string; // ISO string
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  aqi: number;
  temp: number;
  windSpeed: number; // km/h
  windDir: string;
}

export interface PotentialContributor {
  id: string;
  name: string;
  percentage: number;
  icon: string;
  description: string;
}

export interface AnomalyDetectionEvent {
  detected: boolean;
  statusLabel: string; // e.g. "Belum ada lonjakan pada model" or "Potensi Event Terdeteksi"
  title: string;
  subtitle: string;
  description: string;
  confidence: number;
  distanceKm?: number;
  direction?: string;
  contributors: PotentialContributor[];
  explainableFactors: {
    factor: string;
    impact: 'up' | 'down';
    description: string;
  }[];
}

export interface UserActivity {
  id: string;
  title: string;
  startTime: string; // e.g. "07.00"
  endTime: string; // e.g. "07.30"
  durationMinutes: number;
  isOutdoor: boolean;
  locationName: string;
  exertionLevel: 'rendah' | 'sedang' | 'berat'; // breathing ventilation rate multiplier
  score: number;
}

export interface PersonalExposureData {
  score: number; // 0 - 100
  level: 'BAIK' | 'SEDANG' | 'TINGGI' | 'BERBAHAYA';
  outdoorMinutes: number;
  peakWindow: string; // "16.00–17.00"
  totalActivitiesCount: number;
  activities: UserActivity[];
  hourlyLoads: { hour: string; exposure: number }[];
  mitigationOpportunity: {
    title: string;
    description: string;
    currentScore: number;
    simulatedScore: number;
    recommendedTime: string;
  };
}

export interface ScenarioSettings {
  hotspotEnabled: boolean;
  hotspotDistanceKm: number; // 1 - 25 km
  scenarioIntensityPct: number; // 10 - 100%
  windDirectionChange: 'tetap' | 'menjauhi' | 'stagnan';
  activityType: 'olahraga' | 'jalan' | 'sepeda' | 'duduk_luar';
  activityTime: string; // e.g. "16.00 – 17.00"
  activityDurationMinutes: number; // e.g. 60
}

export interface SimulationResult {
  peakPm25Baseline: number;
  peakPm25Scenario: number;
  exposureBaseline: number;
  exposureScenario: number;
  plumeContribution: number;
  estimationConfidence: number;
  summaryTitle: string;
}

export interface RouteOption {
  id: string;
  name: string;
  tag: string;
  tagType: 'terendah' | 'seimbang' | 'tercepat';
  exposureScore: number; // out of 100
  timeMinutes: number;
  distanceKm: number;
  description: string;
  cleanlinessLevel: 'green' | 'yellow' | 'orange' | 'red';
  color: string;
}

export interface CommunityInterventionItem {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  reductionPct: number;
  active: boolean;
}

export interface SpatialGridCell {
  id: string;
  row: number;
  col: number;
  label: string;
  pm25: number;
  status: 'aman' | 'waspada' | 'siaga' | 'bahaya';
  anomalyDetected: boolean;
}

export interface ModelBenchmarkData {
  modelName: string;
  type: string;
  mae: number;
  rmse: number;
  mape: number;
  latencyMs: number;
  memoryMb: number;
  highlight?: boolean;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  content: string;
  dateAdded: string;
}

export interface UserMemoryItem {
  id: string;
  text: string;
  category: 'kesehatan' | 'rutinitas' | 'preferensi' | 'lokasi' | 'umum';
  dateAdded: string;
}
