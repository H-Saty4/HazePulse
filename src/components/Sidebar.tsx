import React from 'react';
import {
  Activity,
  Clock,
  UserCheck,
  Sliders,
  Columns,
  Grid3X3,
  Navigation,
  Users2,
  Cpu,
  Sparkles,
  MapPin,
  X,
  Info,
  Waves,
  Sun,
  Moon,
} from 'lucide-react';
import { LocationInfo } from '../types';
import { useTheme } from '../context/ThemeContext';

export type TabId =
  | 'ringkasan'
  | 'prakiraan'
  | 'paparan'
  | 'simulator'
  | 'bandingkan'
  | 'grid'
  | 'rute'
  | 'komunitas'
  | 'benchmark';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  location: LocationInfo;
  onOpenLocationPicker: () => void;
  onOpenAiChat: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  location,
  onOpenLocationPicker,
  onOpenAiChat,
  mobileOpen,
  onCloseMobile,
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    {
      section: 'RUANG KERJA',
      items: [
        { id: 'ringkasan' as TabId, label: 'Ringkasan Real-Time', icon: Activity },
        {
          id: 'prakiraan' as TabId,
          label: 'Prakiraan 48 Jam',
          icon: Clock,
          badge: '48j',
        },
        {
          id: 'paparan' as TabId,
          label: 'Paparan Pribadi',
          icon: UserCheck,
        },
        {
          id: 'simulator' as TabId,
          label: 'What-If Simulator',
          icon: Sliders,
          dotColor: 'bg-amber-500',
        },
        {
          id: 'bandingkan' as TabId,
          label: 'Bandingkan Skenario',
          icon: Columns,
        },
        {
          id: 'grid' as TabId,
          label: 'Grid Spasial Mikro',
          icon: Grid3X3,
        },
      ],
    },
    {
      section: 'PERENCANAAN & MOBILITAS',
      items: [
        {
          id: 'rute' as TabId,
          label: 'Rute Lebih Bersih',
          icon: Navigation,
        },
        {
          id: 'komunitas' as TabId,
          label: 'Aksi Komunitas',
          icon: Users2,
        },
      ],
    },
    {
      section: 'RISET & METROLOGI',
      items: [
        {
          id: 'benchmark' as TabId,
          label: 'Benchmark Model Prediksi',
          icon: Cpu,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar: Fixed viewport-locked on desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col overflow-y-auto px-4 py-5">
          {/* Logo / Brand Header */}
          <div className="mb-5 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900">
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 text-lg leading-tight dark:text-slate-100">
                  <span>hazepulse</span>
                </div>
                <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                  Sistem Pemantau Atmosfer
                </div>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Location Card */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-left shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    LOKASI AKTIF
                  </div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-1 dark:text-slate-100">
                    {location.name}
                  </div>
                </div>
              </div>
              <button
                onClick={onOpenLocationPicker}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Ganti lokasi pemantauan (Ctrl+K)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-mono dark:text-slate-400">
              <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              <button
                onClick={onOpenLocationPicker}
                className="text-[11px] font-semibold text-slate-700 hover:underline dark:text-slate-300"
              >
                Ubah (Ctrl+K)
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex flex-col gap-4">
            {navItems.map((group) => (
              <div key={group.section} className="flex flex-col gap-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                  {group.section}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.dotColor && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${item.dotColor}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Tanya Haze Assistant Section */}
            <div className="flex flex-col gap-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                ASISTEN
              </div>
              <button
                onClick={() => {
                  onOpenAiChat();
                  onCloseMobile();
                }}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold">Tanya Haze</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  Buka &rarr;
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Status Card */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Open-Meteo & CAMS
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Sensor Atmosfer Real-Time
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
