import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Navigation, Check, Loader2, Globe } from 'lucide-react';
import { LocationInfo } from '../types';
import { PRESET_LOCATIONS } from '../data/defaultData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
}

interface SearchResultItem {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search via Open-Meteo geocoding proxy
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.results)) {
            setSearchResults(data.results);
          } else {
            setSearchResults([]);
          }
        }
      } catch (err) {
        console.error('Search geocode error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleUseRealGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat atau browser Anda belum mengizinkan geolokasi GPS.');
      return;
    }

    setIsDetectingGps(true);
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
          console.warn('Reverse geocode warning:', e);
        }

        setIsDetectingGps(false);
        const newLoc: LocationInfo = {
          name: placeName,
          region: regionName,
          lat,
          lng,
          isGps: true,
        };
        onSelectLocation(newLoc);
        onClose();
      },
      (err) => {
        setIsDetectingGps(false);
        alert(`Gagal mengakses sensor GPS: ${err.message}. Silakan pilih kota dari daftar.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pilih Lokasi Pemantauan Real-Time
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih kota atau gunakan GPS fisik perangkat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="mt-4">
          <button
            onClick={handleUseRealGps}
            disabled={isDetectingGps}
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 shadow-2xs"
          >
            {isDetectingGps ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
            ) : (
              <Navigation className="h-4 w-4 text-slate-700 dark:text-slate-300 transition-transform group-hover:scale-110" />
            )}
            <span>
              {isDetectingGps
                ? 'Membaca Sensor GPS Perangkat...'
                : 'Gunakan Lokasi GPS Saya Saat Ini'}
            </span>
          </button>
        </div>

        {/* Live Search input */}
        <div className="relative mt-3">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kota, kabupaten, atau kecamatan di Indonesia..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {isSearching && (
            <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-slate-500" />
          )}
        </div>

        {/* Pilihan Kota Cepat (Hanya terlihat ketika modal Ctrl+K dibuka) */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>PILIHAN KOTA CEPAT</span>
            <span className="text-[10px] text-slate-400">Klik untuk langsung beralih</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: 'Jakarta', region: 'DKI Jakarta', lat: -6.1754, lng: 106.8272 },
              { name: 'Bandung', region: 'Jawa Barat', lat: -6.9175, lng: 107.6191 },
              { name: 'Surabaya', region: 'Jawa Timur', lat: -7.2575, lng: 112.7521 },
              { name: 'Denpasar', region: 'Bali', lat: -8.6705, lng: 115.2126 },
              { name: 'Yogyakarta', region: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
              { name: 'Medan', region: 'Sumatera Utara', lat: 3.5952, lng: 98.6722 },
              { name: 'Semarang', region: 'Jawa Tengah', lat: -6.9667, lng: 110.4167 },
              { name: 'Makassar', region: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327 },
            ].map((c) => {
              const isSelected = Math.abs(c.lat - currentLocation.lat) < 0.05 && Math.abs(c.lng - currentLocation.lng) < 0.05;
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    onSelectLocation({
                      name: c.name,
                      region: c.region,
                      lat: c.lat,
                      lng: c.lng,
                      isGps: false,
                    });
                    onClose();
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold dark:bg-slate-100 dark:text-slate-900'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results or Preset Locations List */}
        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {searchResults.length > 0 ? (
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HASIL PENCARIAN REAL-TIME
              </div>
              {searchResults.map((res) => (
                <div
                  key={`${res.id}-${res.latitude}-${res.longitude}`}
                  onClick={() => {
                    onSelectLocation({
                      name: res.name,
                      region: `${res.admin1 || ''}${res.admin1 ? ', ' : ''}${res.country}`,
                      lat: Number(res.latitude.toFixed(4)),
                      lng: Number(res.longitude.toFixed(4)),
                      isGps: false,
                    });
                    onClose();
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {res.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {res.latitude.toFixed(2)}, {res.longitude.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SEMUA STASIUN PEMANTAU ATMOSFER
              </div>
              {PRESET_LOCATIONS.map((loc) => {
                const isSelected =
                  Math.abs(loc.lat - currentLocation.lat) < 0.001 &&
                  Math.abs(loc.lng - currentLocation.lng) < 0.001;

                return (
                  <div
                    key={loc.name}
                    onClick={() => {
                      onSelectLocation(loc);
                      onClose();
                    }}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                      isSelected
                        ? 'border-slate-900 bg-slate-100 font-semibold dark:border-slate-400 dark:bg-slate-800'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {loc.region}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">
                        {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-slate-900 dark:text-slate-100" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Data kualitas udara Open-Meteo & CAMS
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
