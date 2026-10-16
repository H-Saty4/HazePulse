import React, { useState } from 'react';
import {
  Clock,
  Layers,
  HelpCircle,
  Wind,
  Thermometer,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { HourlyForecastPoint, PollutantType } from '../../types';

interface ForecastViewProps {
  forecast: HourlyForecastPoint[];
  currentPm25: number;
  onOpenAiChat: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  forecast,
  currentPm25,
  onOpenAiChat,
}) => {
  const [horizon, setHorizon] = useState<'24' | '48'>('48');
  const [pollutant, setPollutant] = useState<PollutantType>('pm25');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const activeData = horizon === '24' ? forecast.slice(0, 24) : forecast.slice(0, 48);

  const values = activeData.map((d) => {
    if (pollutant === 'pm10') return d.pm10;
    if (pollutant === 'no2') return d.no2;
    if (pollutant === 'co') return d.co;
    if (pollutant === 'aqi') return d.aqi;
    return d.pm25;
  });

  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 60);
  const maxPointIdx = values.indexOf(Math.max(...values));
  const maxPoint = activeData[maxPointIdx];

  const svgWidth = 840;
  const svgHeight = 220;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1 || 1)) * svgWidth;
    const y = svgHeight - ((val - minVal) / (maxVal - minVal || 1)) * (svgHeight - 40) - 20;
    return { x, y, val, data: activeData[idx] };
  });

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L ${svgWidth},${svgHeight} L 0,${svgHeight} Z`;

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>PRAKIRAAN HYPERLOCAL · DATA ATMOSFER REAL-TIME</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Prakiraan 48 Jam Per Jam
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Proyeksi konsentrasi partikulat mikro dan meteorologi permukaan berbasis model CAMS & sensor Open-Meteo.
          </p>
        </div>

        {/* 24j / 48j Switcher */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setHorizon('24')}
            className={`rounded-lg px-3.5 py-1.5 font-bold transition ${
              horizon === '24'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            24 jam
          </button>
          <button
            onClick={() => setHorizon('48')}
            className={`rounded-lg px-3.5 py-1.5 font-bold transition ${
              horizon === '48'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            48 jam
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            PM2.5 SAAT INI (SENSOR AKTIF)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {currentPm25}
              </span>
              <span className="text-xs font-semibold text-slate-500">µg/m³</span>
            </div>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live Real-Time
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            PUNCAK MAKSIMUM ({horizon} JAM)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {Math.round(maxVal)}
              </span>
              <span className="text-xs font-semibold text-slate-500">µg/m³</span>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-bold">
              Pukul {maxPoint?.hourStr || '16.00'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            INTERPOLASI DATA
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">CAMS Ensemble</div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              Resolusi Jam
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              DINAMIKA KONSENTRASI PER JAM
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Kurva Fluktuasi Polutan
            </h2>
          </div>

          {/* Pollutant Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['pm25', 'pm10', 'aqi', 'no2', 'co'] as PollutantType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPollutant(p)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  pollutant === p
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {p === 'pm25'
                  ? 'PM2.5'
                  : p === 'pm10'
                  ? 'PM10'
                  : p === 'aqi'
                  ? 'AQI'
                  : p === 'no2'
                  ? 'NO₂'
                  : 'CO'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="relative mt-6 h-64 w-full">
          <div className="relative h-full w-full pl-8">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path d={areaD} fill="url(#forecastAreaGrad)" />
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIdx === idx ? 6 : 2}
                    fill={hoveredIdx === idx ? '#10b981' : '#ffffff'}
                    stroke="#10b981"
                    strokeWidth={hoveredIdx === idx ? 2.5 : 1}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                  <rect
                    x={pt.x - 10}
                    y={0}
                    width={20}
                    height={svgHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                  />
                </g>
              ))}

              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={0}
                  x2={hoveredPoint.x}
                  y2={svgHeight}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xl dark:border-slate-800 dark:bg-slate-900"
                style={{
                  left: `calc(32px + ${(hoveredPoint.x / svgWidth) * 100}%)`,
                  top: '10px',
                }}
              >
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  Pukul {hoveredPoint.data.hourStr}
                </div>
                <div className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {hoveredPoint.val} {pollutant === 'no2' ? 'ppb' : pollutant === 'aqi' ? 'AQI' : 'µg/m³'}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Angin: {hoveredPoint.data.windSpeed} km/j ({hoveredPoint.data.windDir})</span>
                  <span>•</span>
                  <span>Suhu: {hoveredPoint.data.temp}°C</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* X Axis Time Labels */}
        <div className="mt-4 flex justify-between pl-8 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <span>{activeData[0]?.hourStr || '00.00'}</span>
          <span>{activeData[Math.round(activeData.length * 0.25)]?.hourStr || '06.00'}</span>
          <span>{activeData[Math.round(activeData.length * 0.5)]?.hourStr || '12.00'}</span>
          <span>{activeData[Math.round(activeData.length * 0.75)]?.hourStr || '18.00'}</span>
          <span>{activeData[activeData.length - 1]?.hourStr || '23.00'}</span>
        </div>
      </div>

      {/* Atmospheric Factor Drivers Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase dark:text-emerald-400">
            <HelpCircle className="h-4 w-4" />
            <span>ANALISIS FAKTOR PENYEBAB FLUKTUASI (EXPLAINABLE AI)</span>
          </div>
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tanya Haze AI</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Inversi Termal Malam</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">+38%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Mendinginnya tanah di malam hari menahan polusi agar tidak membubung ke atas.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Kecepatan Angin</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">+29%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Kecepatan angin rendah membatasi ventilasi turbulen dan memperlambat pengenceran.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Latar Belakang Regional</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">+21%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Transpor massa udara partikulat aerosol jarak menengah dari dataran sekitar.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
              <span>Emisi Jam Sibuk</span>
              <span className="text-amber-600 dark:text-amber-400 font-black">+12%</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Akumulasi gas buang kendaraan bermotor di jam sibuk pagi dan sore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
