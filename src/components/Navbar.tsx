import React from 'react';
import {
  Search,
  Sparkles,
  Menu,
  BookOpen,
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Navigation,
} from 'lucide-react';
import { LocationInfo } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTabName: string;
  location: LocationInfo;
  onOpenSearch: () => void;
  onOpenGuide: () => void;
  onOpenAiChat: () => void;
  onToggleMobileMenu: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  onQuickSelectCity?: (city: { name: string; region: string; lat: number; lng: number }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTabName,
  location,
  onOpenSearch,
  onOpenGuide,
  onOpenAiChat,
  onToggleMobileMenu,
  onRefreshData,
  isRefreshing = false,
  onQuickSelectCity,
}) => {
  const { theme, toggleTheme } = useTheme();

  const quickCities = [
    { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.1754, lng: 106.8272 },
    { name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
    { name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
    { name: 'Denpasar', region: 'Bali', lat: -8.6705, lng: 115.2126 },
    { name: 'Yogyakarta', region: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { name: 'Medan', region: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 lg:px-8">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
          aria-label="Buka navigasi"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-800 dark:text-slate-200 tracking-tight">HazePulse</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{currentTabName}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Refresh Live Data button */}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs"
            title="Sinkronisasi data atmosfer sensor terbaru"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isRefreshing ? 'Sinkron...' : 'Live Sinkron'}</span>
          </button>
        )}

        {/* Search / Location Picker (Ctrl + K) */}
        <button
          onClick={onOpenSearch}
          className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
          <span className="hidden sm:inline font-medium">Cari Wilayah</span>
          <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400 md:inline font-mono font-medium border border-slate-200 dark:border-slate-700">
            Ctrl K
          </kbd>
        </button>

        {/* Real-time Indicator Tag (Calm, no pulsing neon) */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 lg:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
          <span>Sensor Terkini</span>
        </div>

        {/* Dark Mode / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs"
          title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          aria-label="Toggle Dark Mode"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform rotate-0 hover:-rotate-12 duration-300" />
          )}
        </button>

        {/* Panduan Button */}
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-2xs"
          title="Panduan Sistem"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline">Panduan</span>
        </button>

        {/* Tanya Haze Assistant Header Button (Professional Slate button, no AI neon glow) */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300 dark:text-amber-500" />
          <span>Tanya Haze</span>
        </button>
      </div>
    </header>
  );
};
