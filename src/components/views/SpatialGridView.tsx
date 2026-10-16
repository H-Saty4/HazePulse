import React, { useState, useMemo } from 'react';
import { SpatialGridCell, LocationInfo } from '../../types';
import { generateDynamicSpatialGrid } from '../../data/defaultData';
import { Wind, MapPin } from 'lucide-react';

interface SpatialGridViewProps {
  currentPm25?: number;
  location?: LocationInfo;
  currentWind?: number;
  currentWindDir?: string;
}

export const SpatialGridView: React.FC<SpatialGridViewProps> = ({
  currentPm25 = 35.4,
  location = { name: 'Jakarta Pusat', region: 'DKI Jakarta', lat: -6.1754, lng: 106.8272, isGps: false },
  currentWind = 8,
  currentWindDir = 'Barat Daya',
}) => {
  const gridCells = useMemo(
    () => generateDynamicSpatialGrid(currentPm25),
    [currentPm25]
  );

  const [selectedCell, setSelectedCell] = useState<SpatialGridCell>(() => gridCells[6] || gridCells[0]);

  // Keep selectedCell updated when gridCells regenerate
  React.useEffect(() => {
    const found = gridCells.find((c) => c.id === selectedCell.id) || gridCells[6] || gridCells[0];
    setSelectedCell(found);
  }, [gridCells]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>GRID SPASIAL HYPERLOCAL · 4×4 RESOLUSI MIKRO</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Pemetaan Variasi Polusi Mikro-Grid
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Variasi konsentrasi aerosol di sekitar <strong>{location.name}</strong> berdasarkan adveksi angin dan morfologi tata ruang.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-emerald-500" /> Baik (&lt;30)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-amber-500" /> Sedang (30-55)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-orange-500" /> Sensitif (55-75)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-rose-500" /> Tidak Sehat (&gt;75)
          </span>
        </div>
      </div>

      {/* Grid Layout & Selected Cell Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive 4x4 Grid Matrix (Left 7 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>SEKTOR WILAYAH SEKITAR (1.5 km per sel)</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5 text-emerald-600" />
              <span>Arah Angin: {currentWindDir} ({currentWind} km/j)</span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            {gridCells.map((cell) => {
              const isSelected = selectedCell.id === cell.id;
              let bg =
                'bg-emerald-50/70 border-emerald-200 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-200';

              if (cell.status === 'waspada') {
                bg =
                  'bg-amber-50/70 border-amber-200 text-amber-950 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200';
              } else if (cell.status === 'siaga') {
                bg =
                  'bg-orange-50/70 border-orange-200 text-orange-950 dark:bg-orange-950/40 dark:border-orange-900/60 dark:text-orange-200';
              } else if (cell.status === 'bahaya') {
                bg =
                  'bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-200';
              }

              return (
                <div
                  key={cell.id}
                  onClick={() => setSelectedCell(cell)}
                  className={`relative flex min-h-[105px] cursor-pointer flex-col justify-between rounded-xl border p-2.5 transition-all hover:scale-[1.02] shadow-2xs ${bg} ${
                    isSelected
                      ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 shadow-md font-bold'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-bold opacity-75">{`R${cell.row}:C${cell.col}`}</span>
                    {cell.anomalyDetected && (
                      <span className="rounded bg-rose-600 px-1 py-0.2 text-[8px] font-black text-white">
                        PEKAT
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-black">{cell.pm25}</div>
                    <div className="line-clamp-1 text-[10px] font-semibold opacity-85">
                      {cell.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-[11px] text-slate-500 dark:text-slate-400">
            Tip: Klik sel mana saja untuk meninjau detail mikrolokasi dan karakteristik dispersi.
          </div>
        </div>

        {/* Selected Cell Inspector (Right 5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              DETAIL MIKRO-SEL TERPILIH
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
              {selectedCell.label}
            </h2>
            <div className="mt-0.5 text-xs text-slate-500 font-mono dark:text-slate-400">
              Koordinat Grid Relatif [Baris {selectedCell.row}, Kolom {selectedCell.col}]
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold dark:text-slate-400">
                    KONSENTRASI PM2.5 MIKRO
                  </div>
                  <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
                    {selectedCell.pm25}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">µg/m³</span>
                  </div>
                </div>
                <span
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold uppercase shadow-2xs ${
                    selectedCell.status === 'aman'
                      ? 'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300'
                      : selectedCell.status === 'waspada'
                      ? 'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300'
                  }`}
                >
                  {selectedCell.status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Karakteristik Area:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedCell.anomalyDetected
                    ? 'Persimpangan Arteri & Emisi Knalpot'
                    : 'Pemukiman & Kanopi Pepohonan'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Rasio Infiltrasi Bangunan:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  0.36 (Ruang AC Tertutup)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <span>Estimasi Puncak Jam:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  16.30 - 18.00 WIB
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            Model grid spasial memadukan sensor atmosfer aktif dengan hukum adveksi dispersi horizontal.
          </div>
        </div>
      </div>
    </div>
  );
};
