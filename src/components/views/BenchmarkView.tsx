import React from 'react';
import {
  Award,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { MODEL_BENCHMARKS } from '../../data/defaultData';

export const BenchmarkView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          Riset Metrologi & Validasi Model
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
          Evaluasi & Benchmark Model Atmosfer
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Evaluasi perbandingan 5 arsitektur machine learning dengan metrik standar industri (MAE, RMSE, MAPE) pada data deret waktu atmosfer.
        </p>
      </div>

      {/* Highlight Banner (Clean Scientific Card, no AI neon gradient) */}
      <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:flex-row md:items-center md:p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start md:items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 shadow-2xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluasi Akurasi Tertinggi
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">
              HazePulse Spatio-Temporal Hybrid mencapai 28.4% lebih rendah MAE dibanding baseline
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Arsitektur Graph Convolution + Temporal Attention memprediksi variasi adveksi angin antar-sel geografis secara presisi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[10px] text-slate-400 font-bold uppercase">MAE TERBAIK</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">3.12 µg/m³</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-950">
            <div className="text-[10px] text-slate-400 font-bold uppercase">MAPE</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">8.4%</div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Tabel Evaluasi Kinerja Model (Test Set 48 Jam)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Diukur pada stasiun pemantau permukaan dan data ground truth CAMS.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="py-3 pl-5 pr-4">Model & Arsitektur</th>
                <th className="px-4 py-3">Tipe Jaringan</th>
                <th className="px-4 py-3">MAE (µg/m³)</th>
                <th className="px-4 py-3">RMSE</th>
                <th className="px-4 py-3">MAPE (%)</th>
                <th className="px-4 py-3">Latency</th>
                <th className="py-3 pl-4 pr-5">Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {MODEL_BENCHMARKS.map((m) => (
                <tr
                  key={m.modelName}
                  className={
                    m.highlight
                      ? 'bg-slate-100/70 font-semibold dark:bg-slate-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }
                >
                  <td className="py-3.5 pl-5 pr-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      {m.highlight && (
                        <CheckCircle2 className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      )}
                      <span>{m.modelName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{m.type}</td>
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">{m.mae}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">{m.rmse}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">{m.mape}%</td>
                  <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-400">{m.latencyMs} ms</td>
                  <td className="py-3.5 pl-4 pr-5 font-mono text-slate-600 dark:text-slate-400">{m.memoryMb} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
