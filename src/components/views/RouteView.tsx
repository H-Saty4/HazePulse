import React, { useState, useMemo } from 'react';
import { ExternalLink, Navigation, Check, ShieldCheck, MapPin } from 'lucide-react';
import { RouteOption, LocationInfo } from '../../types';
import { generateDynamicRoutes } from '../../data/defaultData';

interface RouteViewProps {
  currentPm25?: number;
  location?: LocationInfo;
}

export const RouteView: React.FC<RouteViewProps> = ({
  currentPm25 = 35.4,
  location = { name: 'Jakarta Pusat', region: 'DKI Jakarta', lat: -6.1754, lng: 106.8272, isGps: false },
}) => {
  const [origin, setOrigin] = useState(() => `${location.name} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`);
  const [destination, setDestination] = useState('Pusat Aktivitas / Taman Kota');
  const [mode, setMode] = useState<'mobil' | 'motor' | 'sepeda' | 'jalan'>('mobil');

  const routes: RouteOption[] = useMemo(
    () => generateDynamicRoutes(currentPm25),
    [currentPm25]
  );

  const [selectedRouteId, setSelectedRouteId] = useState<string>('rute-tenang');

  // Keep origin synced if location changes
  React.useEffect(() => {
    setOrigin(`${location.name} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`);
  }, [location.lat, location.lng, location.name]);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const handleOpenGoogleMaps = () => {
    const encodedOrigin = encodeURIComponent(`${location.lat},${location.lng}`);
    const encodedDest = encodeURIComponent(destination);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>NAVIGASI & MOBILITAS BERSIH · MULTI-OBJEKTIF</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
            Pilih Jalur dengan Paparan Minimal
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Bandingkan dosis paparan partikulat di sepanjang jalan sebelum berangkat untuk memilih jalur yang paling aman bagi paru-paru Anda.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>REAL-TIME EMISSION AVOIDANCE</span>
        </div>
      </div>

      {/* Form Inputs Row */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-12 sm:items-center">
        <div className="sm:col-span-5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TITIK KEBERANGKATAN
          </label>
          <div className="relative mt-1">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            LOKASI TUJUAN
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ketik alamat atau tempat tujuan..."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            MODA TRANSPORTASI
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as any)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="mobil">Mobil (Kabin AC)</option>
            <option value="motor">Sepeda Motor</option>
            <option value="sepeda">Sepeda Gowes</option>
            <option value="jalan">Jalan Kaki</option>
          </select>
        </div>
      </div>

      {/* Main Split: Schematic Map & Route Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Schematic Route Map (Left 7 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  PETA JALUR SKEMATIK
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Alternatif Koridor Mobilitas Bersih
                </h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Data PM2.5: {currentPm25} µg/m³
              </span>
            </div>

            {/* Interactive Schematic SVG Map Canvas */}
            <div className="relative mt-5 h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <svg viewBox="0 0 600 320" className="h-full w-full">
                {/* Background grid network lines */}
                <g stroke="#94a3b8" strokeOpacity="0.3" strokeWidth="1.5">
                  <line x1="50" y1="20" x2="550" y2="300" />
                  <line x1="20" y1="180" x2="580" y2="120" />
                  <line x1="120" y1="310" x2="480" y2="10" />
                  <line x1="30" y1="90" x2="570" y2="250" />
                  <line x1="200" y1="10" x2="400" y2="310" />
                </g>

                {/* Road Corridor C (Koridor Utama) */}
                <path
                  d="M 120 220 Q 280 180 500 90"
                  fill="none"
                  stroke={selectedRouteId === 'rute-utama' ? '#f97316' : '#fdba74'}
                  strokeWidth={selectedRouteId === 'rute-utama' ? '7' : '3.5'}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all hover:stroke-[#ea580c]"
                  onClick={() => setSelectedRouteId('rute-utama')}
                />

                {/* Road Corridor B (Jalur Lingkungan) */}
                <path
                  d="M 120 220 Q 300 240 500 90"
                  fill="none"
                  stroke={selectedRouteId === 'rute-lingkungan' ? '#eab308' : '#fde047'}
                  strokeWidth={selectedRouteId === 'rute-lingkungan' ? '7' : '3.5'}
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  className="cursor-pointer transition-all hover:stroke-[#ca8a04]"
                  onClick={() => setSelectedRouteId('rute-lingkungan')}
                />

                {/* Road Corridor A (Koridor Lebih Tenang) */}
                <path
                  d="M 120 220 C 180 120 380 320 500 90"
                  fill="none"
                  stroke={selectedRouteId === 'rute-tenang' ? '#10b981' : '#6ee7b7'}
                  strokeWidth={selectedRouteId === 'rute-tenang' ? '7' : '3.5'}
                  strokeLinecap="round"
                  className="cursor-pointer transition-all hover:stroke-[#059669]"
                  onClick={() => setSelectedRouteId('rute-tenang')}
                />

                {/* Origin Pin */}
                <g transform="translate(120, 220)">
                  <circle r="12" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                  <circle r="5" fill="#10b981" />
                  <rect
                    x="-50"
                    y="18"
                    width="100"
                    height="20"
                    rx="6"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                  />
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Titik Berangkat
                  </text>
                </g>

                {/* Destination Pin */}
                <g transform="translate(500, 90)">
                  <circle r="12" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
                  <circle r="5" fill="#f97316" />
                  <rect
                    x="-35"
                    y="-30"
                    width="70"
                    height="20"
                    rx="6"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                  />
                  <text
                    x="0"
                    y="-16"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    Tujuan
                  </text>
                </g>
              </svg>

              <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 dark:text-slate-400">
                Visualisasi perbandingan rute multi-objektif berbasis konsentrasi partikulat jalan.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-3 rounded-xs bg-emerald-500" /> Paparan Rendah
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-2 w-3 rounded-xs bg-amber-500" /> Sedang
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-orange-600 dark:text-orange-400">
                <span className="h-2 w-3 rounded-xs bg-orange-500" /> Arteri Padat
              </span>
            </div>
          </div>
        </div>

        {/* Route Cards Column (Right 5 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              PILIHAN RUTE PERJALANAN
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Evaluasi Dosis Paparan Rute
            </h2>

            {/* 3 Routes List */}
            <div className="mt-4 flex flex-col gap-3">
              {routes.map((r) => {
                const isSelected = r.id === selectedRouteId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {r.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                          r.tagType === 'terendah'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : r.tagType === 'seimbang'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-300'
                        }`}
                      >
                        {r.tag}
                      </span>
                    </div>

                    <div className="mt-1.5 flex items-baseline justify-between">
                      <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {r.exposureScore}
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {' '}/ 100 skor dosis
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-bold dark:text-slate-300">
                        {r.timeMinutes} mnt · {r.distanceKm} km
                      </div>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {r.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              onClick={handleOpenGoogleMaps}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-md"
            >
              <span>Buka Petunjuk Arah di Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
