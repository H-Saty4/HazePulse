import React, { useState } from 'react';
import {
  Sun,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { CommunityInterventionItem } from '../../types';
import { DEFAULT_COMMUNITY_INTERVENTIONS } from '../../data/defaultData';

interface CommunityViewProps {
  onNavigateToSimulator: () => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onNavigateToSimulator,
}) => {
  const [interventions, setInterventions] = useState<CommunityInterventionItem[]>(
    DEFAULT_COMMUNITY_INTERVENTIONS
  );

  const toggleIntervention = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  const activeInterventions = interventions.filter((i) => i.active);
  const totalCombinedReduction = Math.min(
    42,
    activeInterventions.reduce((sum, curr) => sum + curr.reductionPct, 0)
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Perencanaan Kawasan & Kebijakan Publik
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Simulasi Intervensi Komunitas & Institusi
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Uji dampak kebijakan jam belajar, pengelolaan arus lalu lintas gerbang, dan zona proteksi udara bersih.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>INTERVENSI TERUKUR</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Active Actions Switcher */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DAFTAR KEBIJAKAN TERSEDIA
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {activeInterventions.length} Kebijakan Aktif
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {interventions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleIntervention(item.id)}
                  className={`flex cursor-pointer items-start justify-between rounded-xl border p-4 transition ${
                    item.active
                      ? 'border-emerald-600 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 rounded-md accent-emerald-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        {item.code} · {item.category}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    -{item.reductionPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Kebijakan dapat dikombinasikan untuk menguji akumulasi penurunan beban paparan.
            </span>
          </div>
        </div>

        {/* Right 5 cols: Result Projection */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              PROYEKSI DAMPAK KOMULATIF
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              Estimasi Penurunan Paparan
            </h2>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-[10px] text-slate-400 uppercase font-bold">TOTAL PENURUNAN PAPARAN</div>
              <div className="mt-1 text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {totalCombinedReduction > 0 ? `-${totalCombinedReduction}%` : '0%'}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {activeInterventions.length === 0
                  ? 'Pilih minimal satu intervensi di samping'
                  : `Dari aktivasi ${activeInterventions.length} kebijakan terpadu`}
              </div>
            </div>

            <div className="mt-5 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Kelompok Sasaran:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Komuter, Mahasiswa, Atlet
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Area Proteksi:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Radius 500m Kawasan Terbuka
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Implementasi Biaya:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Rendah (Penjadwalan & Regulasi)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              onClick={onNavigateToSimulator}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
            >
              <span>Uji Skenario Lengkap di Simulator</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
