
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { findParkingSpots, getAddressFromCoords } from './services/geminiService';
import { Location, ParkingSlot, SearchResult } from './types';
import ParkingCard from './components/ParkingCard';

const App: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const watchId = useRef<number | null>(null);
  const lastSearchCoords = useRef<{lat: number, lng: number} | null>(null);
  const refreshTimerRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLoc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLoc);
        setLastSync(new Date());
        setPermissionDenied(false);
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setPermissionDenied(true);
        setLoading(false);
        setError("GPS signal weak or permission denied. Please enable high accuracy.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }, []);

  const handleSearch = useCallback(async (loc: Location, force: boolean = false) => {
    // Only search if moved significantly (approx 50m) OR if it's a forced refresh
    if (!force && lastSearchCoords.current) {
      const dist = Math.sqrt(
        Math.pow(loc.latitude - lastSearchCoords.current.lat, 2) + 
        Math.pow(loc.longitude - lastSearchCoords.current.lng, 2)
      );
      if (dist < 0.0005) return; 
    }

    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const [spots, address] = await Promise.all([
        findParkingSpots(loc),
        getAddressFromCoords(loc)
      ]);
      setSearchResult(spots);
      setCurrentAddress(address);
      lastSearchCoords.current = { lat: loc.latitude, lng: loc.longitude };
      setLastSync(new Date());
    } catch (err) {
      console.error(err);
      setError("Unable to update nearby parking spots.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Set up the automatic refresh timer
  useEffect(() => {
    refreshTimerRef.current = window.setInterval(() => {
      if (location && document.visibilityState === 'visible') {
        handleSearch(location, true);
      }
    }, 60000); // 60 seconds

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [location, handleSearch]);

  useEffect(() => {
    if (location) {
      handleSearch(location);
    }
  }, [location, handleSearch]);

  useEffect(() => {
    startTracking();
    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [startTracking]);

  const navigateTo = (slot: ParkingSlot) => {
    if (!location) return;
    const url = slot.mapsUri || `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${encodeURIComponent(slot.name)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-safe">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200 relative">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {refreshing && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">ParkSmart</h1>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
                Real-Time Tracking
                {refreshing && <span className="inline-block w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>}
              </span>
            </div>
          </div>
          <button 
            onClick={() => location && handleSearch(location, true)}
            disabled={loading || refreshing}
            className={`p-3 rounded-2xl transition-all active:scale-95 ${
              loading || refreshing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 shadow-sm'
            }`}
          >
            <svg className={`w-6 h-6 ${(loading || refreshing) ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        
        {/* Real-time Address & Location Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm overflow-hidden relative group transition-all hover:border-blue-200">
          <div className="absolute top-0 right-0 p-3">
             <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
               ACTIVE
             </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Current Address</p>
                <h2 className="text-base font-bold text-slate-800 line-clamp-2 min-h-[3rem]">
                  {currentAddress || (loading ? "Locating..." : "Retrieving address...")}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="text-xs text-slate-400 font-medium">
                GPS: {location?.latitude.toFixed(5)}, {location?.longitude.toFixed(5)}
              </div>
              <div className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded">
                Auto-refresh in 60s
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Last: {lastSync?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {permissionDenied && (
          <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-center">
            <h3 className="text-rose-900 font-bold mb-2">Location Restricted</h3>
            <p className="text-rose-700 text-sm mb-4">On mobile, please ensure "High Accuracy" is enabled in your system settings and browser permissions.</p>
            <button onClick={startTracking} className="w-full py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200">Retry Access</button>
          </div>
        )}

        {error && (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800 text-sm font-medium flex gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {searchResult && (
          <div className={`flex flex-col gap-5 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Nearest Slots</h2>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
                {searchResult.slots.length} Found
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {searchResult.slots.map((slot) => (
                <ParkingCard key={slot.id} slot={slot} onNavigate={navigateTo} />
              ))}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mt-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800">Smart Tips</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4">
                {searchResult.rawResponse}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 text-center bg-white border-t border-slate-100 mt-10">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">ParkSmart Engine 2.1 • LIVE</p>
      </footer>
    </div>
  );
};

export default App;
