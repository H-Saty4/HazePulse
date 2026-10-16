import React from 'react';
import {
  Sun,
  Plus,
  ArrowRight,
  Activity,
  Home,
  Navigation,
  Info,
} from 'lucide-react';
import { PersonalExposureData } from '../../types';

interface PersonalExposureViewProps {
  exposureData: PersonalExposureData;
  onOpenRoutineEditor: () => void;
  onNavigateToSimulator: () => void;
  onNavigateToCompare: () => void;
}

export const PersonalExposureView: React.FC<PersonalExposureViewProps> = ({
  exposureData,
  onOpenRoutineEditor,
  onNavigateToSimulator,
  onNavigateToCompare,
}) => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Dosis & Profil Paparan Personal
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Estimasi Dosis Hirupan Personal
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Kualitas udara kota bukanlah dosis riil yang masuk ke paru-paru. Waktu, durasi di luar ruang, dan intensitas respirasi menentukan beban paparan.
          </p>
        </div>

        <button
          onClick={onOpenRoutineEditor}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Plus className="h-4 w-4" />
          <span>Sesuaikan Jadwal Rutinitas</span>
        </button>
      </div>

      {/* Top 2 Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Card: Paparan Personal Hari Ini (7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              DOSIS PAPARAN KUMULATIF HARI INI
            </div>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Radial Dial */}
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <div
                  className="absolute inset-0 rounded-full border-4 border-emerald-500"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 65%)',
                  }}
                />
                <div className="text-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    {exposureData.score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold"> / 100</span>
                </div>
              </div>

              <div>
                <span className="rounded-lg bg-amber-100 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300 uppercase shadow-2xs">
                  {exposureData.level}
                </span>
                <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
                  Aktivitas luar ruang menyumbang beban paparan terbesar
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Perhitungan menggabungkan konsentrasi partikulat, lama waktu di luar ruang, dan ventilasi paru-paru.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-3 text-xs">
            <div>
              <div className="font-black text-slate-900 dark:text-slate-100 text-base">
                {exposureData.outdoorMinutes} menit
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total luar ruangan</div>
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-slate-100 text-base">
                {exposureData.peakWindow}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Jendela paparan tertinggi
              </div>
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-slate-100 text-base">
                {exposureData.totalActivitiesCount} aktivitas
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Dalam profil hari ini
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Mitigasi Cepat (5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                PELUANG MITIGASI CEPAT
              </span>
              <Sun className="h-5 w-5 text-amber-500" />
            </div>

            <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
              {exposureData.mitigationOpportunity.title}
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {exposureData.mitigationOpportunity.description}
            </p>

            <div className="mt-5 flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">SKOR SAAT INI</div>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                  {exposureData.mitigationOpportunity.currentScore}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                  SKOR DIGESER KE PAGI
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {exposureData.mitigationOpportunity.simulatedScore}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              onClick={onNavigateToCompare}
              className="group flex items-center gap-1.5 text-xs font-bold text-slate-700 transition hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
            >
              <span>Bandingkan skenario sebelum vs sesudah intervensi</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Routine Activities Grid */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              PROFIL JADWAL HARIAN
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Daftar Aktivitas Terjadwal
            </h2>
          </div>
          <button
            onClick={onOpenRoutineEditor}
            className="text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Edit Rutinitas
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {exposureData.activities.map((act, idx) => (
            <div
              key={act.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {idx === 0 ? (
                    <Navigation className="h-3.5 w-3.5" />
                  ) : idx === 1 ? (
                    <Home className="h-3.5 w-3.5" />
                  ) : (
                    <Activity className="h-3.5 w-3.5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {act.title}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    {act.locationName} · {act.durationMinutes} menit
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  {act.startTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
