/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabId } from './components/Sidebar';
import { SummaryView } from './components/views/SummaryView';
import { ForecastView } from './components/views/ForecastView';
import { PersonalExposureView } from './components/views/PersonalExposureView';
import { SimulatorView } from './components/views/SimulatorView';
import { CompareView } from './components/views/CompareView';
import { SpatialGridView } from './components/views/SpatialGridView';
import { RouteView } from './components/views/RouteView';
import { CommunityView } from './components/views/CommunityView';
import { BenchmarkView } from './components/views/BenchmarkView';
import { TanyaHazeDrawer } from './components/TanyaHazeDrawer';
import { LocationModal } from './components/LocationModal';
import { GuideModal } from './components/GuideModal';
import { RoutineEditorModal } from './components/RoutineEditorModal';
import {
  LocationInfo,
  HourlyForecastPoint,
  PersonalExposureData,
  ScenarioSettings,
  AnomalyDetectionEvent,
  UserActivity,
} from './types';
import {
  PRESET_LOCATIONS,
  INITIAL_ANOMALY_EVENT,
  INITIAL_EXPOSURE_DATA,
  generate48HourForecast,
} from './data/defaultData';
import {
  fetchLiveAirQuality,
  calculatePersonalExposure,
} from './services/airQualityService';
import { Sparkles, Activity, Clock, Sliders, UserCheck, MapPin } from 'lucide-react';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<TabId>('ringkasan');
  const [location, setLocation] = useState<LocationInfo>(PRESET_LOCATIONS[0]); // Starts at Jakarta Pusat or detected GPS
  const [forecast, setForecast] = useState<HourlyForecastPoint[]>(
    generate48HourForecast(32.5)
  );

  // Live sensor readings
  const [currentPm25, setCurrentPm25] = useState<number>(32.5);
  const [currentPm10, setCurrentPm10] = useState<number>(40.2);
  const [currentNo2, setCurrentNo2] = useState<number>(4.2);
  const [currentCo, setCurrentCo] = useState<number>(380);
  const [currentAqi, setCurrentAqi] = useState<number>(92);
  const [currentWind, setCurrentWind] = useState<number>(8);
  const [currentWindDir, setCurrentWindDir] = useState<string>('Barat Daya');
  const [currentTemp, setCurrentTemp] = useState<number>(29);
  const [currentHumidity, setCurrentHumidity] = useState<number>(75);
  const [weatherCondition, setWeatherCondition] = useState<string>('Cerah Berawan');
  const [indicativeScore, setIndicativeScore] = useState<number>(45);
  const [projectionTrend, setProjectionTrend] = useState<string>('stabil dalam 6 jam');
  const [bestWindow, setBestWindow] = useState<string>('09.00 — 11.00');
  const [peakWindow, setPeakWindow] = useState<string>('16.00 — 18.00');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [exposureData, setExposureData] = useState<PersonalExposureData>(
    INITIAL_EXPOSURE_DATA
  );
  const [scenarioSettings, setScenarioSettings] = useState<ScenarioSettings>({
    hotspotEnabled: true,
    hotspotDistanceKm: 8,
    scenarioIntensityPct: 70,
    windDirectionChange: 'tetap',
    activityType: 'olahraga',
    activityTime: '16.00 – 17.00',
    activityDurationMinutes: 60,
  });
  const [anomalyEvent] = useState<AnomalyDetectionEvent>(
    INITIAL_ANOMALY_EVENT
  );

  // Modals & Drawers state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isRoutineEditorOpen, setIsRoutineEditorOpen] = useState(false);

  // Load real-time air quality & weather per coordinates
  const loadRealtimeData = useCallback(async (lat: number, lng: number) => {
    setIsRefreshing(true);
    try {
      const result = await fetchLiveAirQuality(lat, lng);
      setForecast(result.hourly);
      setCurrentPm25(result.currentPm25);
      setCurrentPm10(result.currentPm10);
      setCurrentNo2(result.currentNo2);
      setCurrentCo(result.currentCo);
      setCurrentAqi(result.currentAqi);
      setCurrentWind(result.currentWind);
      setCurrentWindDir(result.currentWindDir);
      setCurrentTemp(result.currentTemp);
      setCurrentHumidity(result.currentHumidity);
      setWeatherCondition(result.weatherCondition);
      setIndicativeScore(result.indicativeScore);
      setProjectionTrend(result.projectionTrend);
      setBestWindow(result.bestWindow);
      setPeakWindow(result.peakWindow);
      setLastUpdated(result.lastUpdated);

      setExposureData((prev) => calculatePersonalExposure(prev.activities, result.hourly));
    } catch (e) {
      console.error('Error refreshing air quality data:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Try auto-detecting user's real browser GPS on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));

          let placeName = 'Lokasi GPS Anda';
          let regionName = 'Koordinat Presisi';

          try {
            const revRes = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
            if (revRes.ok) {
              const revData = await revRes.json();
              const addr = revData?.address;
              if (addr) {
                const locality =
                  addr.suburb || addr.neighbourhood || addr.village || addr.city_district || addr.town || addr.city;
                const region = addr.state || addr.county || addr.region || addr.country;
                if (locality) placeName = locality;
                if (region) regionName = `${region}, Indonesia`;
              }
            }
          } catch (e) {
            console.warn(e);
          }

          setLocation({
            name: placeName,
            region: regionName,
            lat,
            lng,
            isGps: true,
          });
          loadRealtimeData(lat, lng);
        },
        () => {
          // If denied, load default preset
          loadRealtimeData(location.lat, location.lng);
        },
        { timeout: 7000 }
      );
    } else {
      loadRealtimeData(location.lat, location.lng);
    }
  }, []);

  // When location changes
  useEffect(() => {
    loadRealtimeData(location.lat, location.lng);
  }, [location.lat, location.lng, loadRealtimeData]);

  // Global Ctrl + K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsLocationModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveRoutineActivities = (newActivities: UserActivity[]) => {
    const recalculated = calculatePersonalExposure(newActivities, forecast);
    setExposureData(recalculated);
  };

  const handleQuickSelectCity = (c: { name: string; region: string; lat: number; lng: number }) => {
    setLocation({
      name: c.name,
      region: c.region,
      lat: c.lat,
      lng: c.lng,
      isGps: false,
    });
  };

  const tabNames: Record<TabId, string> = {
    ringkasan: 'Ringkasan Real-Time',
    prakiraan: 'Prakiraan 48 Jam',
    paparan: 'Paparan Pribadi',
    simulator: 'What-If Simulator',
    bandingkan: 'Bandingkan Skenario',
    grid: 'Grid Spasial Mikro',
    rute: 'Rute Lebih Bersih',
    komunitas: 'Aksi Komunitas',
    benchmark: 'Benchmark Model Prediksi',
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Viewport-locked desktop sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        location={location}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
        onOpenAiChat={() => setIsAiDrawerOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area: Independently scrolling container */}
      <div className="flex flex-1 flex-col h-screen overflow-y-auto">
        <Navbar
          currentTabName={tabNames[currentTab]}
          location={location}
          onOpenSearch={() => setIsLocationModalOpen(true)}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenAiChat={() => setIsAiDrawerOpen(true)}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onRefreshData={() => loadRealtimeData(location.lat, location.lng)}
          isRefreshing={isRefreshing}
          onQuickSelectCity={handleQuickSelectCity}
        />

        <main className="flex-1 pb-24 lg:pb-10">
          {currentTab === 'ringkasan' && (
            <SummaryView
              forecast={forecast}
              currentPm25={currentPm25}
              currentPm10={currentPm10}
              currentNo2={currentNo2}
              currentCo={currentCo}
              currentAqi={currentAqi}
              currentWind={currentWind}
              currentWindDir={currentWindDir}
              currentTemp={currentTemp}
              currentHumidity={currentHumidity}
              weatherCondition={weatherCondition}
              indicativeScore={indicativeScore}
              projectionTrend={projectionTrend}
              bestWindow={bestWindow}
              peakWindow={peakWindow}
              lastUpdated={lastUpdated}
              exposureData={exposureData}
              anomalyEvent={anomalyEvent}
              onNavigateToForecast={() => setCurrentTab('prakiraan')}
              onNavigateToExposure={() => setCurrentTab('paparan')}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {currentTab === 'prakiraan' && (
            <ForecastView
              forecast={forecast}
              currentPm25={currentPm25}
              onOpenAiChat={() => setIsAiDrawerOpen(true)}
            />
          )}

          {currentTab === 'paparan' && (
            <PersonalExposureView
              exposureData={exposureData}
              onOpenRoutineEditor={() => setIsRoutineEditorOpen(true)}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
              onNavigateToCompare={() => setCurrentTab('bandingkan')}
            />
          )}

          {currentTab === 'simulator' && (
            <SimulatorView
              baselineForecast={forecast}
              currentExposure={exposureData}
              scenarioSettings={scenarioSettings}
              setScenarioSettings={setScenarioSettings}
              onNavigateToRoute={() => setCurrentTab('rute')}
              onNavigateToExposure={() => setCurrentTab('paparan')}
              onNavigateToCompare={() => setCurrentTab('bandingkan')}
            />
          )}

          {currentTab === 'bandingkan' && (
            <CompareView
              baselineForecast={forecast}
              currentExposure={exposureData}
              scenarioSettings={scenarioSettings}
              onNavigateToForecast={() => setCurrentTab('prakiraan')}
              onNavigateToSimulator={() => setCurrentTab('simulator')}
            />
          )}

          {currentTab === 'grid' && (
            <SpatialGridView
              currentPm25={currentPm25}
              location={location}
              currentWind={currentWind}
              currentWindDir={currentWindDir}
            />
          )}

          {currentTab === 'rute' && (
            <RouteView
              currentPm25={currentPm25}
              location={location}
            />
          )}

          {currentTab === 'komunitas' && (
            <CommunityView
              onNavigateToSimulator={() => setCurrentTab('simulator')}
            />
          )}

          {currentTab === 'benchmark' && <BenchmarkView />}
        </main>
      </div>

      {/* Floating Tanya Haze Assistant Button (Professional Slate pill, no glowing AI neon) */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="group flex items-center gap-2 rounded-full border border-slate-700/20 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition hover:bg-slate-800 dark:border-slate-300/20 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-amber-400 dark:text-amber-600" />
          <span>Tanya Haze</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 px-2 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        <button
          onClick={() => setCurrentTab('ringkasan')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentTab === 'ringkasan' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Ringkasan</span>
        </button>

        <button
          onClick={() => setCurrentTab('prakiraan')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentTab === 'prakiraan' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Prakiraan</span>
        </button>

        <button
          onClick={() => setCurrentTab('paparan')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentTab === 'paparan' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>Paparan</span>
        </button>

        <button
          onClick={() => setCurrentTab('simulator')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition ${
            currentTab === 'simulator' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Simulator</span>
        </button>

        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-slate-800 dark:text-slate-200"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Tanya Haze</span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <TanyaHazeDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        location={location}
        currentPm25={currentPm25}
        currentWind={currentWind}
        currentWindDir={currentWindDir}
        currentTemp={currentTemp}
        currentHumidity={currentHumidity}
        currentAqi={currentAqi}
        indicativeScore={indicativeScore}
        bestWindow={bestWindow}
        peakWindow={peakWindow}
        exposureData={exposureData}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => {
          setLocation(loc);
          loadRealtimeData(loc.lat, loc.lng);
        }}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <RoutineEditorModal
        isOpen={isRoutineEditorOpen}
        onClose={() => setIsRoutineEditorOpen(false)}
        activities={exposureData.activities}
        onSaveActivities={handleSaveRoutineActivities}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
