
import React from 'react';
import { ParkingSlot } from '../types';

interface ParkingCardProps {
  slot: ParkingSlot;
  onNavigate: (slot: ParkingSlot) => void;
}

const ParkingCard: React.FC<ParkingCardProps> = ({ slot, onNavigate }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return {
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          pulse: true,
          label: 'Available'
        };
      case 'Limited':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          pulse: false,
          label: 'Filling Fast'
        };
      case 'Full':
        return {
          color: 'bg-rose-100 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          pulse: false,
          label: 'Full'
        };
      default:
        return {
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          pulse: false,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(slot.availability || 'Unknown');
  const occupancy = slot.occupancy ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">
            {slot.name}
          </h3>
          <span className="text-xs text-slate-400 mt-0.5">Updated at {slot.lastUpdated}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
          <span className={`relative flex h-2 w-2`}>
            {config.pulse && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
          </span>
          {config.label}
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-4 flex items-start gap-1.5">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="line-clamp-1">{slot.address === "Nearby Location" ? "Central Business District" : slot.address}</span>
      </p>

      {/* Occupancy Meter */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Current Occupancy</span>
          <span className="text-xs font-bold text-slate-700">{occupancy}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${
              occupancy > 85 ? 'bg-rose-500' : occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancy}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">{slot.distance}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">{slot.priceEstimate || 'N/A'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-700">{(slot.rating || 4.5).toFixed(1)}</span>
        </div>
      </div>

      <button 
        onClick={() => onNavigate(slot)}
        className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Get Directions
      </button>
    </div>
  );
};

export default ParkingCard;
