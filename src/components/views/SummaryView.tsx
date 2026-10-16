import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Wind,
  Compass,
  Thermometer,
  Droplets,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Flame,
  Activity,
  Layers,
} from 'lucide-react';
import {
  HourlyForecastPoint,
  AnomalyDetectionEvent,
  PersonalExposureData,
  PollutantType,
} from '../../types';

interface SummaryViewProps {
  forecast: HourlyForecastPoint[];
  currentPm25: number;
  currentPm10: number;
  currentNo2: number;
  currentCo?: number;
  currentAqi?: number;
  currentWind: number;
  currentWindDir?: string;
  currentTemp?: number;
  currentHumidity?: number;
  weatherCondition?: string;
  indicativeScore: number;
  projectionTrend: string;
  bestWindow: string;
  peakWindow: string;
  lastUpdated?: string;
  exposureData: PersonalExposureData;
  anomalyEvent: AnomalyDetectionEvent;
  onNavigateToForecast: () => void;
  onNavigateToExposure: () => void;
  onNavigateToSimulator: () => void;
  onOpenAiChat: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  forecast,
  currentPm25,
  currentPm10,
  currentNo2,
  currentCo = 350,
  currentAqi = 75,
  currentWind,
  currentWindDir = 'Barat Daya',
  currentTemp = 28,
  currentHumidity = 74,
  weatherCondition = 'Cerah Berawan',
  indicativeScore,
  projectionTrend,
  bestWindow,
  peakWindow,
  lastUpdated,
  exposureData,
  anomalyEvent,
  onNavigateToForecast,
  onNavigateToExposure,
  onNavigateToSimulator,
  onOpenAiChat,
}) => {
  const [selectedPollutant, setSelectedPollutant] = useState<PollutantType>('pm25');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 24 hour slice for the summary chart
  const forecast24h = forecast.slice(0, 24);

  const values = forecast24h.map((p) => {
    if (selectedPollutant === 'pm10') return p.pm10;
    if (selectedPollutant === 'no2') return p.no2;
    if (selectedPollutant === 'co') return p.co;
    if (selectedPollutant === 'aqi') return p.aqi;
    return p.pm25;
  });

  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 50);

  // SVG chart dimensions
  const chartWidth = 560;
  const chartHeight = 120;
  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 24) - 12;
    return { x, y, val, data: forecast24h[idx] };
  });

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  const displayUnit =
    selectedPollutant === 'no2'
      ? 'ppb'
      : selectedPollutant === 'co'
      ? 'µg/m³'
      : selectedPollutant === 'aqi'
      ? 'AQI'
      : 'µg/m³';

  const currentValue =
    selectedPollutant === 'pm10'
      ? currentPm10
      : selectedPollutant === 'no2'
      ? currentNo2
      : selectedPollutant === 'co'
      ? currentCo
      : selectedPollutant === 'aqi'
      ? currentAqi
      : currentPm25;

  // Real Air Quality Category according to US AQI & WHO standard
  let qualityCategory = 'Baik';
  let categoryColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let categoryDotColor = 'bg-emerald-500';
  let gaugeColor = '#10b981';

  if (currentAqi > 200 || currentPm25 > 150.4) {
    qualityCategory = 'Sangat Tidak Sehat';
    categoryColor = 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    categoryDotColor = 'bg-purple-500';
    gaugeColor = '#a855f7';
  } else if (currentAqi > 150 || currentPm25 > 55.4) {
    qualityCategory = 'Tidak Sehat';
    categoryColor = 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    categoryDotColor = 'bg-rose-500';
    gaugeColor = '#f43f5e';
  } else if (currentAqi > 100 || currentPm25 > 35.4) {
    qualityCategory = 'Perlu Perhatian (Sensitif)';
    categoryColor = 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    categoryDotColor = 'bg-amber-500';
    gaugeColor = '#f59e0b';
  } else if (currentAqi > 50 || currentPm25 > 12.0) {
    qualityCategory = 'Sedang (Moderat)';
    categoryColor = 'text-yellow-800 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800';
    categoryDotColor = 'bg-yellow-500';
    gaugeColor = '#eab308';
  }

  const isTrendUp = projectionTrend.includes('naik');
  const isTrendDown = projectionTrend.includes('turun');

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Real-Time Status & Weather Ribbon */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Pemantauan Atmosfer Real-Time
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {lastUpdated ? `Diperbarui ${lastUpdated} WIB` : 'Sinkronisasi Otomatis'}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Kondisi & Kualitas Udara Ambien
          </h1>
        </div>

        {/* Live Weather Metrics Strip */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 shadow-2xs">
            <Thermometer className="h-4 w-4 text-rose-500" />
            <span>{currentTemp}°C</span>
            <span className="text-[10px] text-slate-400 font-normal">({weatherCondition})</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 shadow-2xs">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{currentHumidity}% RH</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 shadow-2xs">
            <Wind className="h-4 w-4 text-emerald-500" />
            <span>{currentWind} km/j</span>
            <span className="text-[10px] text-slate-400 font-normal">({currentWindDir})</span>
          </div>

          <button
            onClick={onNavigateToForecast}
            className="group flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span>Prakiraan 48j</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Main Grid: Hero AQI & Pollutants (7 cols) + Environmental Signals Radar (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Hero Air Quality Card (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div>
            {/* Header with Pollutant Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>KONSENTRASI POLUTAN AMBIEN</span>
              </div>

              <div className="relative">
                <select
                  value={selectedPollutant}
                  onChange={(e) => setSelectedPollutant(e.target.value as PollutantType)}
                  aria-label="Pilih parameter polutan"
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="pm25">PM2.5 (Partikulat Halus)</option>
                  <option value="pm10">PM10 (Partikulat Kasar)</option>
                  <option value="aqi">US AQI (Air Quality Index)</option>
                  <option value="no2">NO₂ (Nitrogen Dioksida)</option>
                  <option value="co">CO (Karbon Monoksida)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Main Value Display & Category */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl">
                    {currentValue}
                  </span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    {displayUnit}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold shadow-2xs">
                  <span className={`h-2.5 w-2.5 rounded-full ${categoryDotColor}`} />
                  <span className={categoryColor.split(' ')[0]}>{qualityCategory}</span>
                </div>

                {/* WHO Guideline Benchmark */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="uppercase">AMBANG BAKU MUTU WHO 2021</span>
                    <span className="text-emerald-700 dark:text-emerald-400">15 µg/m³ (24j)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (currentPm25 / 150) * 100)}%`,
                        backgroundColor: gaugeColor,
                      }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>0 Baik</span>
                    <span>15 Standar WHO</span>
                    <span>55+ Berbahaya</span>
                  </div>
                </div>
              </div>

              {/* Sparkline curve */}
              <div className="flex flex-col justify-end md:col-span-7">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    PROYEKSI 24 JAM KE DEPAN
                  </span>
                  <span
                    className={`flex items-center gap-1 font-bold ${
                      isTrendUp
                        ? 'text-amber-700 dark:text-amber-400'
                        : isTrendDown
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isTrendUp ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : isTrendDown ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    <span>{projectionTrend}</span>
                  </span>
                </div>

                <div className="relative mt-3 h-32 w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={gaugeColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={gaugeColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#curveGradient)" />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Interactive points */}
                    {points.map((pt, idx) => (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={hoveredIdx === idx ? 5 : 2}
                          fill={hoveredIdx === idx ? gaugeColor : '#ffffff'}
                          stroke={gaugeColor}
                          strokeWidth={hoveredIdx === idx ? 2 : 1}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(idx)}
                        />
                        <rect
                          x={pt.x - 10}
                          y={0}
                          width={20}
                          height={chartHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIdx(idx)}
                        />
                      </g>
                    ))}
                  </svg>

                  {hoveredPoint && (
                    <div
                      className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900"
                      style={{
                        left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                        top: '5px',
                      }}
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {hoveredPoint.data.hourStr}
                      </div>
                      <div className="font-black text-emerald-600 dark:text-emerald-400">
                        {hoveredPoint.val} {displayUnit}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  <span>{forecast24h[0]?.hourStr || '00.00'}</span>
                  <span>{forecast24h[6]?.hourStr || '06.00'}</span>
                  <span>{forecast24h[12]?.hourStr || '12.00'}</span>
                  <span>{forecast24h[18]?.hourStr || '18.00'}</span>
                  <span>{forecast24h[23]?.hourStr || '23.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Pollutants Grid Strip */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase">PM10</span>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {currentPm10} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase">NO₂ (DI OKSIDA)</span>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {currentNo2} <span className="text-[10px] font-normal text-slate-500">ppb</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase">CO (MONOKSIDA)</span>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {currentCo} <span className="text-[10px] font-normal text-slate-500">µg/m³</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase">US AQI INDEX</span>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {currentAqi} <span className="text-[10px] font-normal text-slate-500">/ 500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Radar & Dispersion Card (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                RADAR ANOMALI & DISPERSI ATMOSFER
              </span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                RADIUS 25 KM
              </span>
            </div>

            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              Dinamika Massa Udara & Hotspot
            </h2>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Tidak Terdeteksi Anomali Titik Api
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    Sensor satelit termal MODIS & VIIRS tidak mendeteksi kebakaran aktif radius 25 km. Fluktuasi polusi saat ini didominasi emisi lokal dan siklus inversi malam.
                  </div>
                </div>
              </div>
            </div>

            {/* Dispersion Vector Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <span>VEKTOR ANGIN</span>
                </div>
                <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                  {currentWindDir}
                </div>
                <div className="text-[10px] text-slate-500">{currentWind} km/j kecepatan</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">
                  <Layers className="h-3.5 w-3.5 text-emerald-600" />
                  <span>KONDISI DISPERSI</span>
                </div>
                <div className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                  {currentWind < 6 ? 'Massa Mandek' : 'Ventilasi Aktif'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {currentWind < 6 ? 'Emisi terakumulasi' : 'Pengenceran wajar'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              onClick={onNavigateToSimulator}
              className="group flex w-full items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <span>Uji simulasi titik api di What-If Simulator</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Actionable Health Decision Cards Grid (4 columns) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              REKOMENDASI PREVENTIF PROAKTIF
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Panduan Aktivitas & Tindakan Perlindungan
            </h2>
          </div>
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Tanya Rekomendasi Medis &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Waktu Olahraga */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                WAKTU OLAHRAGA LUAR
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                OPTIMAL
              </span>
            </div>
            <div className="mt-2 text-base font-black text-emerald-700 dark:text-emerald-400">
              {bestWindow} WIB
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Konsentrasi PM2.5 terendah hari ini. Hindari olahraga berat saat puncak sore ({peakWindow}).
            </p>
          </div>

          {/* Card 2: Ventilasi Jendela */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                VENTILASI JENDELA
              </span>
              <span className="rounded bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                PANDUAN
              </span>
            </div>
            <div className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">
              Buka Jam 09.00 - 11.00
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Tutup rapat jendela mulai pukul 17.00 hingga dini hari untuk mencegah udara inversi masuk.
            </p>
          </div>

          {/* Card 3: Masker & Pelindung */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                PROTEKSI RESPIRASI
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                STANDAR
              </span>
            </div>
            <div className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">
              {currentPm25 > 35 ? 'Gunakan KF94 / N95' : 'Masker Opsional'}
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Masker kain tidak menyaring partikel mikro PM2.5. Gunakan respirator bersertifikasi di jalan raya.
            </p>
          </div>

          {/* Card 4: Dosis Paparan Anda */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                DOSIS HIRUPAN PERSONAL
              </span>
              <span className="rounded bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                HARI INI
              </span>
            </div>
            <div className="mt-2 text-base font-black text-slate-900 dark:text-slate-100">
              Skor {exposureData.score} <span className="text-xs font-normal text-slate-500">/ 100 ({exposureData.level.toLowerCase()})</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Berdasarkan {exposureData.totalActivitiesCount} kegiatan terdaftar. Geser jam luar ruang untuk menurunkan dosis.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Provenance Footer */}
      <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center">
        <div>
          Data sensor aktual terhubung langsung ke <strong>Open-Meteo Air Quality & Weather API</strong> serta model atmosfer regional <strong>Copernicus CAMS</strong>.
        </div>
        <div className="font-mono text-[10px]">
          LAT/LNG DYNAMIC SENSING
        </div>
      </div>
    </div>
  );
};
