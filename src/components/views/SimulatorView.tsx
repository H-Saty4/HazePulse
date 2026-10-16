import React from 'react';
import {
  RotateCcw,
  Activity,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  ScenarioSettings,
  SimulationResult,
  HourlyForecastPoint,
  PersonalExposureData,
} from '../../types';
import { simulateScenario } from '../../services/airQualityService';

interface SimulatorViewProps {
  baselineForecast: HourlyForecastPoint[];
  currentExposure: PersonalExposureData;
  onNavigateToRoute: () => void;
  onNavigateToExposure: () => void;
  onNavigateToCompare: () => void;
  scenarioSettings: ScenarioSettings;
  setScenarioSettings: React.Dispatch<React.SetStateAction<ScenarioSettings>>;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  baselineForecast,
  currentExposure,
  onNavigateToRoute,
  onNavigateToExposure,
  onNavigateToCompare,
  scenarioSettings,
  setScenarioSettings,
}) => {
  const simResult: SimulationResult = simulateScenario(
    scenarioSettings,
    baselineForecast,
    currentExposure
  );

  const handleReset = () => {
    setScenarioSettings({
      hotspotEnabled: true,
      hotspotDistanceKm: 8,
      scenarioIntensityPct: 70,
      windDirectionChange: 'tetap',
      activityType: 'olahraga',
      activityTime: '16.00 – 17.00',
      activityDurationMinutes: 60,
    });
  };

  const deltaPm25 = simResult.peakPm25Scenario - simResult.peakPm25Baseline;
  const deltaExposure = simResult.exposureScenario - simResult.exposureBaseline;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Simulasi Skenario Atmosfer
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            What-If Simulator
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Uji skenario titik api kebakaran, pergeseran arah angin, atau pergeseran jadwal aktivitas untuk melihat dampaknya terhadap paparan Anda.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
          <span>Model Aktif</span>
        </div>
      </div>

      {/* Main Split Layout: Left Controls (5 cols) & Right Results (7 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Controls */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Card 01: Gangguan Lingkungan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  01
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Gangguan Lingkungan
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Simulasi titik api kebakaran (hotspot)
                  </div>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() =>
                  setScenarioSettings((prev) => ({
                    ...prev,
                    hotspotEnabled: !prev.hotspotEnabled,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  scenarioSettings.hotspotEnabled
                    ? 'bg-emerald-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                    scenarioSettings.hotspotEnabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {scenarioSettings.hotspotEnabled && (
              <div className="mt-5 flex flex-col gap-4">
                {/* Jarak Hotspot Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <span>Jarak Hotspot ke Lokasi</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {scenarioSettings.hotspotDistanceKm} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={scenarioSettings.hotspotDistanceKm}
                    onChange={(e) =>
                      setScenarioSettings((prev) => ({
                        ...prev,
                        hotspotDistanceKm: Number(e.target.value),
                      }))
                    }
                    className="mt-2 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 dark:bg-slate-800"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>1 km</span>
                    <span>25 km</span>
                  </div>
                </div>

                {/* Intensitas Skenario Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <span>Intensitas Sumber Emisi</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {scenarioSettings.scenarioIntensityPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={scenarioSettings.scenarioIntensityPct}
                    onChange={(e) =>
                      setScenarioSettings((prev) => ({
                        ...prev,
                        scenarioIntensityPct: Number(e.target.value),
                      }))
                    }
                    className="mt-2 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 dark:bg-slate-800"
                  />
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Rendah</span>
                    <span>Tinggi</span>
                  </div>
                </div>

                {/* Perubahan Arah Angin Dropdown */}
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    Arah Angin Terhadap Lokasi
                  </label>
                  <select
                    value={scenarioSettings.windDirectionChange}
                    onChange={(e) =>
                      setScenarioSettings((prev) => ({
                        ...prev,
                        windDirectionChange: e.target.value as any,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="tetap">Tetap menuju lokasi (adveksi langsung)</option>
                    <option value="menjauhi">Menjauhi lokasi (dispersi berlawanan)</option>
                    <option value="stagnan">Angin tenang / stagnan (akumulasi lokal)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Card 02: Rencana Aktivitas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                02
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Rencana Aktivitas
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Uji pengaruh perubahan jam aktivitas
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Olahraga luar ruang
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {scenarioSettings.activityDurationMinutes} menit · intensitas sedang
                    </div>
                  </div>
                </div>

                <select
                  value={scenarioSettings.activityTime}
                  onChange={(e) =>
                    setScenarioSettings((prev) => ({
                      ...prev,
                      activityTime: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="06.00 – 07.00">06.00 – 07.00</option>
                  <option value="09.00 – 10.00">09.00 – 10.00</option>
                  <option value="16.00 – 17.00">16.00 – 17.00</option>
                  <option value="18.00 – 19.00">18.00 – 19.00</option>
                </select>
              </div>

              {/* Durasi di Luar Ruang */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Durasi di Luar Ruang</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {scenarioSettings.activityDurationMinutes} menit
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={15}
                  value={scenarioSettings.activityDurationMinutes}
                  onChange={(e) =>
                    setScenarioSettings((prev) => ({
                      ...prev,
                      activityDurationMinutes: Number(e.target.value),
                    }))
                  }
                  className="mt-2 h-1.5 w-full cursor-pointer rounded-lg bg-slate-200 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                HASIL PERBANDINGAN SKENARIO
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-bold dark:text-slate-400 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Atur ulang</span>
              </button>
            </div>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {simResult.summaryTitle}
            </h2>

            {/* 2 Comparison Cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  PM2.5 PADA JAM PUNCAK
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    {simResult.peakPm25Scenario}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">µg/m³</span>
                </div>
                <div className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {deltaPm25 >= 0 ? `+${deltaPm25}` : deltaPm25} µg/m³ dari baseline
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  SKOR PAPARAN PERSONAL
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    {simResult.exposureScenario}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">/ 100</span>
                </div>
                <div className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  {deltaExposure >= 0 ? `+${deltaExposure}` : deltaExposure} poin dari baseline
                </div>
              </div>
            </div>

            {/* Comparison Bars */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 font-bold uppercase">KONSENTRASI PM2.5 (µg/m³)</div>

              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Skenario dasar</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {simResult.peakPm25Baseline}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(100, (simResult.peakPm25Baseline / 90) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    <span>Dengan skenario baru</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {simResult.peakPm25Scenario}
                    </span>
                  </div>
                  <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${Math.min(100, (simResult.peakPm25Scenario / 90) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Confidence meter */}
              <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Tingkat keyakinan pemodelan</span>
                  <span>{simResult.estimationConfidence}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${simResult.estimationConfidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row at Bottom */}
          <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Terapkan hasil skenario ke modul lainnya
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onNavigateToRoute}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Rute Lebih Bersih →
              </button>

              <button
                onClick={onNavigateToExposure}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Paparan Pribadi →
              </button>

              <button
                onClick={onNavigateToCompare}
                className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <span>Bandingkan</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
