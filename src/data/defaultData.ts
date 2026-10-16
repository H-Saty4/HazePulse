import {
  LocationInfo,
  HourlyForecastPoint,
  AnomalyDetectionEvent,
  UserActivity,
  PersonalExposureData,
  RouteOption,
  CommunityInterventionItem,
  SpatialGridCell,
  ModelBenchmarkData,
} from '../types';

export const PRESET_LOCATIONS: LocationInfo[] = [
  {
    name: 'Jakarta Pusat',
    region: 'DKI Jakarta, Indonesia',
    lat: -6.1754,
    lng: 106.8272,
    isGps: false,
  },
  {
    name: 'Bandung',
    region: 'Jawa Barat, Indonesia',
    lat: -6.9175,
    lng: 107.6191,
    isGps: false,
  },
  {
    name: 'Surabaya',
    region: 'Jawa Timur, Indonesia',
    lat: -7.2575,
    lng: 112.7521,
    isGps: false,
  },
  {
    name: 'Denpasar / Kuta',
    region: 'Bali, Indonesia',
    lat: -8.6705,
    lng: 115.2126,
    isGps: false,
  },
  {
    name: 'Yogyakarta',
    region: 'DI Yogyakarta, Indonesia',
    lat: -7.7956,
    lng: 110.3695,
    isGps: false,
  },
  {
    name: 'Medan',
    region: 'Sumatera Utara, Indonesia',
    lat: 3.5952,
    lng: 98.6722,
    isGps: false,
  },
  {
    name: 'Semarang',
    region: 'Jawa Tengah, Indonesia',
    lat: -6.9667,
    lng: 110.4167,
    isGps: false,
  },
  {
    name: 'Makassar',
    region: 'Sulawesi Selatan, Indonesia',
    lat: -5.1477,
    lng: 119.4327,
    isGps: false,
  },
  {
    name: 'Pontianak (Gambut)',
    region: 'Kalimantan Barat, Indonesia',
    lat: -0.0263,
    lng: 109.3425,
    isGps: false,
  },
  {
    name: 'Palangka Raya',
    region: 'Kalimantan Tengah, Indonesia',
    lat: -2.2096,
    lng: 113.9165,
    isGps: false,
  },
  {
    name: 'IKN Nusantara',
    region: 'Kalimantan Timur, Indonesia',
    lat: -0.9632,
    lng: 116.7024,
    isGps: false,
  },
  {
    name: 'Jember',
    region: 'Jawa Timur, Indonesia',
    lat: -8.1652,
    lng: 113.7104,
    isGps: false,
  },
];

export function generate48HourForecast(basePm25: number = 28.5): HourlyForecastPoint[] {
  const points: HourlyForecastPoint[] = [];
  const now = new Date();

  for (let i = 0; i < 48; i++) {
    const time = new Date(now.getTime() + i * 3600000);
    const hour = time.getHours();
    const hourStr = i === 0 ? 'Sekarang' : `${hour < 10 ? '0' : ''}${hour}.00`;

    // Nocturnal temperature inversion curve
    const diurnalFactor = 1 + 0.45 * Math.cos(((hour - 1) / 24) * 2 * Math.PI);
    const pm25 = Math.round(basePm25 * diurnalFactor * 10) / 10;
    const pm10 = Math.round(pm25 * 1.25 * 10) / 10;
    const no2 = Math.max(1, Math.round((pm25 / 15) * (hour >= 7 && hour <= 19 ? 2.5 : 1.0) * 10) / 10);
    const co = Math.round(pm25 * 18);
    const aqi = Math.min(500, Math.round(pm25 * 2.1));
    const temp = Math.round((27 + 5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)) * 10) / 10;
    const wind = Math.max(3, Math.round((8 + 4 * Math.sin(((hour - 12) / 24) * 2 * Math.PI)) * 10) / 10);

    const dirs = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    const windDir = dirs[(hour + 3) % dirs.length];

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
      windDir,
    });
  }

  return points;
}

export const INITIAL_ANOMALY_EVENT: AnomalyDetectionEvent = {
  detected: false,
  statusLabel: 'TANPA SINYAL EKSTREM',
  title: 'Variasi Normal Siklus Harian',
  subtitle: 'Pemindaian Terpadu CAMS & Satelit MODIS/VIIRS',
  description:
    'Sistem terus memindai parameter atmosfer dan data anomali termal dalam radius 25 km secara real-time. Tidak ada anomali pembakaran tak terkendali di sekitar koordinat saat ini.',
  confidence: 88,
  distanceKm: 8.2,
  direction: 'Barat Daya (SW)',
  contributors: [
    {
      id: 'traffic',
      name: 'Emisi Transportasi Arteri',
      percentage: 42,
      icon: '🚗',
      description: 'Lalu lintas kendaraan jam puncak di jalur utama',
    },
    {
      id: 'inversion',
      name: 'Inversi Termal Atmosfer',
      percentage: 28,
      icon: '🌫️',
      description: 'Kompresi lapisan batas malam hari menahan partikulat',
    },
    {
      id: 'regional',
      name: 'Adveksi Massa Udara Regional',
      percentage: 18,
      icon: '🌬️',
      description: 'Transpor aerosol tersuspensi antar-wilayah dataran',
    },
    {
      id: 'industry',
      name: 'Aktivitas Domestik & Pembakaran',
      percentage: 12,
      icon: '🏭',
      description: 'Residu pembakaran biomassa dan generator listrik',
    },
  ],
  explainableFactors: [
    {
      factor: 'Inversi Suhu Permukaan (Nocturnal Inversion)',
      impact: 'up',
      description: 'Pendinginan radiatif malam menahan emisi dekat tanah',
    },
    {
      factor: 'Kecepatan Angin Rendah (< 6 km/j)',
      impact: 'down',
      description: 'Dispersi polutan berkurang memicu akumulasi lokal',
    },
    {
      factor: 'Lalu Lintas Koridor Sekitar',
      impact: 'up',
      description: 'Lonjakan partikulat halus knalpot pada sore hari',
    },
    {
      factor: 'Ventilasi Turbulen Siang Hari',
      impact: 'down',
      description: 'Radiasi matahari membantu pengenceran polusi di jam 10-14',
    },
  ],
};

export const INITIAL_ACTIVITIES: UserActivity[] = [
  {
    id: 'act-1',
    title: 'Perjalanan Pagi (Komuter)',
    startTime: '07.00',
    endTime: '07.45',
    durationMinutes: 45,
    isOutdoor: true,
    locationName: 'Jalan Raya Protokol',
    exertionLevel: 'sedang',
    score: 22,
  },
  {
    id: 'act-2',
    title: 'Aktivitas Kantor / Kampus',
    startTime: '09.00',
    endTime: '15.00',
    durationMinutes: 60,
    isOutdoor: false,
    locationName: 'Gedung Ber-AC & Filter',
    exertionLevel: 'rendah',
    score: 12,
  },
  {
    id: 'act-3',
    title: 'Olahraga Sore',
    startTime: '16.30',
    endTime: '17.30',
    durationMinutes: 45,
    isOutdoor: true,
    locationName: 'Taman / Lapangan Luar Ruang',
    exertionLevel: 'berat',
    score: 32,
  },
];

export const INITIAL_EXPOSURE_DATA: PersonalExposureData = {
  score: 48,
  level: 'SEDANG',
  outdoorMinutes: 90,
  peakWindow: '16.00 — 18.00',
  totalActivitiesCount: 3,
  activities: INITIAL_ACTIVITIES,
  hourlyLoads: [
    { hour: '07', exposure: 18 },
    { hour: '09', exposure: 8 },
    { hour: '11', exposure: 7 },
    { hour: '13', exposure: 9 },
    { hour: '15', exposure: 14 },
    { hour: '16', exposure: 24 },
    { hour: '17', exposure: 21 },
    { hour: '19', exposure: 11 },
  ],
  mitigationOpportunity: {
    title: 'Olahraga lebih awal, paparan lebih rendah.',
    description: 'Geser sesi olahraga luar ruang ke rentang 09.00 saat dispersi polutan sedang optimal.',
    currentScore: 48,
    simulatedScore: 28,
    recommendedTime: '09.00 — 10.00',
  },
};

export function generateDynamicRoutes(currentPm25: number = 35): RouteOption[] {
  const baseClean = Math.round(currentPm25 * 0.72);
  const baseModerate = Math.round(currentPm25 * 0.95);
  const baseArtery = Math.round(currentPm25 * 1.45);

  return [
    {
      id: 'rute-tenang',
      name: 'Koridor Hijau & Pemukiman',
      tag: 'PAPARAN TERENDAH',
      tagType: 'terendah',
      exposureScore: Math.min(100, Math.max(12, Math.round(baseClean * 1.2))),
      timeMinutes: 24,
      distanceKm: 5.2,
      description: 'Melewati kawasan perumahan rindang dan jalur hijau. Jauh dari gas buang truk dan bus kota.',
      cleanlinessLevel: 'green',
      color: '#10b981',
    },
    {
      id: 'rute-lingkungan',
      name: 'Jalur Arteri Sekunder',
      tag: 'SEIMBANG',
      tagType: 'seimbang',
      exposureScore: Math.min(100, Math.max(18, Math.round(baseModerate * 1.2))),
      timeMinutes: 21,
      distanceKm: 4.5,
      description: 'Kombinasi jalan arteri sekunder dan jalan lokal dengan lalu lintas lancar.',
      cleanlinessLevel: 'yellow',
      color: '#f59e0b',
    },
    {
      id: 'rute-utama',
      name: 'Jalan Protokol Utama',
      tag: 'TERCEPAT',
      tagType: 'tercepat',
      exposureScore: Math.min(100, Math.max(25, Math.round(baseArtery * 1.2))),
      timeMinutes: 17,
      distanceKm: 3.8,
      description: 'Jalan raya protokol dengan kepadatan kendaraan bermotor tinggi dan emisi knalpot pekat.',
      cleanlinessLevel: 'orange',
      color: '#f97316',
    },
  ];
}

export const DEFAULT_COMMUNITY_INTERVENTIONS: CommunityInterventionItem[] = [
  {
    id: 'intervensi-1',
    code: '01 / JADWAL',
    category: 'Jadwal Aktivitas',
    title: 'Geser olahraga luar ruang ke pagi',
    description: 'Kurangi paparan saat puncak sore dengan memindahkan jadwal sesi luar ruang ke pukul 08.00 - 10.00.',
    reductionPct: 24,
    active: false,
  },
  {
    id: 'intervensi-2',
    code: '02 / ZONA',
    category: 'Zona Proteksi Lingkungan',
    title: 'Pembatasan idling kendaraan di drop-off',
    description: 'Jauhkan antrean kendaraan menyala dari area tunggu pejalan kaki dan gerbang utama.',
    reductionPct: 15,
    active: false,
  },
  {
    id: 'intervensi-3',
    code: '03 / FILTER',
    category: 'Pengendalian Indoor',
    title: 'Pengoptimalan HEPA filter ventilasi',
    description: 'Tingkatkan laju sirkulasi udara bersih di ruang publik dan kelas saat jam puncak inversi.',
    reductionPct: 18,
    active: false,
  },
];

export function generateDynamicSpatialGrid(basePm25: number = 32): SpatialGridCell[] {
  const multipliers = [
    [0.72, 0.85, 1.15, 0.90],
    [0.80, 1.10, 1.65, 1.35],
    [0.75, 1.20, 1.40, 0.95],
    [0.68, 0.92, 1.25, 1.55],
  ];

  const labels = [
    ['Kawasan Hutan Kota & Danau', 'Pemukiman Perbukitan', 'Koridor Lingkar Luar', 'Lembah Hijau'],
    ['Zona Residensial Barat', 'Pusat Fasilitas Publik', 'Persimpangan Arteri Protokol', 'Kawasan Terminal & Pasar'],
    ['Kawasan Taman Kota', 'Pusat Olahraga & Stadion', 'Zona Pergudangan & Logistik', 'Perbatasan Selatan'],
    ['Kebun Konservasi', 'Kawasan Mahasiswa & Pelajar', 'Akses Tol / Jalur Cepat', 'Kawasan Industri Kecil'],
  ];

  const cells: SpatialGridCell[] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const pm25Val = Math.round(basePm25 * multipliers[r][c] * 10) / 10;
      let status: 'aman' | 'waspada' | 'siaga' | 'bahaya' = 'aman';
      if (pm25Val > 75) status = 'bahaya';
      else if (pm25Val > 55) status = 'siaga';
      else if (pm25Val > 30) status = 'waspada';

      const isAnomaly = pm25Val > 65;

      cells.push({
        id: `cell-${r + 1}-${c + 1}`,
        row: r + 1,
        col: c + 1,
        label: labels[r][c],
        pm25: pm25Val,
        status,
        anomalyDetected: isAnomaly,
      });
    }
  }

  return cells;
}

export const MODEL_BENCHMARKS: ModelBenchmarkData[] = [
  {
    modelName: 'HazePulse Spatio-Temporal Hybrid',
    type: 'Attention Transformer + Graph Conv',
    mae: 3.12,
    rmse: 4.58,
    mape: 8.4,
    latencyMs: 14,
    memoryMb: 86,
    highlight: true,
  },
  {
    modelName: 'Deep LSTM + Multi-Head Attention',
    type: 'Recurrent Neural Network',
    mae: 4.36,
    rmse: 6.12,
    mape: 11.7,
    latencyMs: 28,
    memoryMb: 112,
    highlight: false,
  },
  {
    modelName: 'Bidirectional GRU',
    type: 'Gated Recurrent Network',
    mae: 4.65,
    rmse: 6.45,
    mape: 12.3,
    latencyMs: 22,
    memoryMb: 94,
    highlight: false,
  },
  {
    modelName: 'XGBoost Hyperopt',
    type: 'Gradient Boosted Decision Trees',
    mae: 5.48,
    rmse: 7.82,
    mape: 14.9,
    latencyMs: 4,
    memoryMb: 42,
    highlight: false,
  },
  {
    modelName: 'Random Forest Baseline',
    type: 'Ensemble Bagging Trees',
    mae: 6.82,
    rmse: 9.35,
    mape: 18.2,
    latencyMs: 8,
    memoryMb: 68,
    highlight: false,
  },
];
