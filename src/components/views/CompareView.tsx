import React from 'react';
import {
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  HourlyForecastPoint,
  PersonalExposureData,
  ScenarioSettings,
} from '../../types';
import { simulateScenario } from '../../services/airQualityService';

interface CompareViewProps {
  baselineForecast: HourlyForecastPoint[];
  currentExposure: PersonalExposureData;
  scenarioSettings: ScenarioSettings;
  onNavigateToForecast: () => void;
  onNavigateToSimulator: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  baselineForecast,
  currentExposure,
  scenarioSettings,
  onNavigateToForecast,
  onNavigateToSimulator,
}) => {
  const simResult = simulateScenario(
    scenarioSettings,
    baselineForecast,
    currentExposure
  );

  const deltaPm25 = simResult.peakPm25Scenario - simResult.peakPm25Baseline;
  const deltaExposure = simResult.exposureScenario - simResult.exposureBaseline;

  const values = baselineForecast.slice(0, 48).map((d) => d.pm25);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 60);
  const chartWidth = 560;
  const chartHeight = 160;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1 || 1)) * chartWidth;
    const y = chartHeight - ((val - minVal) / (maxVal - minVal || 1)) * (chartHeight - 30) - 15;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Analisis Komparatif Dua Panel
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Bandingkan Sebelum Mengambil Tindakan
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Lihat pola prakiraan dasar atmosfer dan hasil skenario intervensi dalam satu layar perbandingan.
          </p>
        </div>

        <button
          onClick={onNavigateToSimulator}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span>Ubah Parameter Skenario</span>
          <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
        </button>
      </div>

      {/* Two Comparison Panels Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Panel: Prakiraan 48 Jam (6 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PRAKIRAAN 48 JAM (BASELINE REAL-TIME)
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                Sensor Aktif
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              PM2.5 per Jam (Baseline)
            </h2>

            {/* Canvas Chart */}
            <div className="relative mt-6 h-48 w-full">
              <div className="relative h-full w-full pl-6">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="h-full w-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* X Axis Time Labels */}
            <div className="mt-4 flex justify-between pl-6 text-xs text-slate-400 dark:text-slate-500 font-semibold">
              <span>Sekarang</span>
              <span>+12j</span>
              <span>+24j</span>
              <span>+36j</span>
              <span>+48j</span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              onClick={onNavigateToForecast}
              className="group flex items-center gap-1.5 text-xs font-bold text-slate-700 transition hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
            >
              <span>Buka grafik prakiraan lengkap 48 jam</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Panel: Simulator Skenario (6 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                HASIL PROYEKSI INTERVENSI SKENARIO
              </span>
              <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PROYEKSI AKTIF
              </span>
            </div>

            <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              {simResult.summaryTitle}
            </h2>

            {/* Base vs Scenario Rows */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">PM2.5 dasar → skenario puncak</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">
                  {simResult.peakPm25Baseline} →{' '}
                  <span className="text-amber-600 dark:text-amber-400">
                    {simResult.peakPm25Scenario}
                  </span>{' '}
                  <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Paparan personal total</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">
                  {simResult.exposureBaseline} →{' '}
                  <span className="text-amber-600 dark:text-amber-400">
                    {simResult.exposureScenario}
                  </span>{' '}
                  <span className="text-xs font-normal text-slate-500">/ 100</span>
                </span>
              </div>
            </div>

            {/* Two Change Stat Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Perubahan PM2.5</div>
                <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                  {deltaPm25 >= 0 ? `+${deltaPm25}` : deltaPm25} µg/m³
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Perubahan Dosis Paparan</div>
                <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
                  {deltaExposure >= 0 ? `+${deltaExposure}` : deltaExposure} poin
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              onClick={onNavigateToSimulator}
              className="group flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
            >
              <span>Buka What-If Simulator</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
