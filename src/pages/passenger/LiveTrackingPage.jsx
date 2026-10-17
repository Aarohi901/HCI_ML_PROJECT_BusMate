import React, { useState } from 'react';
import busesData from '../../data/buses.json';
import { Bus, Navigation, Users, Clock, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export const LiveTrackingPage = () => {
  const [selectedBusId, setSelectedBusId] = useState('SB-04');
  const bus = busesData.find(b => b.id === selectedBusId) || busesData[0];

  const occupancyPercent = Math.round((bus.currentOccupancy / bus.capacity) * 100);

  const routeStops = [
    { name: 'University Campus Terminal', time: '05:00 PM', status: 'Departed', passed: true },
    { name: 'Student Union Hub', time: '05:08 PM', status: 'Passed', passed: true },
    { name: 'Science Park Stop', time: '05:14 PM', status: 'Next Stop (In Transit)', current: true },
    { name: 'Oak Street Interchange', time: '05:20 PM', status: 'Upcoming', passed: false },
    { name: 'Central Station Terminal', time: '05:25 PM', status: 'Destination', passed: false }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-6 h-6 text-[#075985]" />
            <h1 className="text-2xl sm:text-[2.25rem] font-semibold font-heading text-slate-900 tracking-[-0.02em] leading-[1.25]">Live Bus Telemetry & Tracking</h1>
          </div>
          <p className="text-sm sm:text-base font-normal text-slate-600 mt-1 leading-relaxed">
            Real-time vehicle location, onboard capacity meters, and stop ETAs.
          </p>
        </div>

        {/* Vehicle Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">Select Bus:</label>
          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#075985]"
          >
            {busesData.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} ({b.routeNumber}) - {b.departureTime}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Bus Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Map & Route Telemetry */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Visual Route Progress Timeline */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-900 text-white font-bold text-base rounded-xl flex items-center justify-center tabular-nums">
                  {bus.id}
                </div>
                <div>
                  <h2 className="text-lg font-semibold font-heading text-slate-900">{bus.routeNumber}: {bus.origin} → {bus.destination}</h2>
                  <p className="text-xs text-slate-600 font-medium">Driver: {bus.driver} • Bus Status: {bus.status}</p>
                </div>
              </div>

              <div className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 tabular-nums ${
                bus.currentOccupancy >= 45 
                  ? 'bg-amber-50 text-amber-900 border-amber-300' 
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{bus.currentOccupancy >= 45 ? 'Filling Fast' : 'Seats Guaranteed'} ({bus.capacity - bus.currentOccupancy} Left)</span>
              </div>
            </div>

            {/* Simulated Live Route Map View */}
            <div className="relative bg-slate-900 text-white rounded-xl p-6 border-2 border-slate-800 overflow-hidden space-y-6">
              <div className="flex justify-between items-center text-xs font-mono text-teal-400">
                <span>GPS FEED: ACTIVE</span>
                <span>SPEED: 32 MPH</span>
                <span>LAT/LONG: 42.3601 N, 71.0589 W</span>
              </div>

              {/* Stops Progress Bar */}
              <div className="space-y-4 relative z-10">
                {routeStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        stop.current
                          ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/30 font-black animate-bounce'
                          : stop.passed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {stop.passed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < routeStops.length - 1 && (
                        <div className={`w-1 h-8 ${stop.passed ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      )}
                    </div>

                    <div className="flex-1 bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                      <div>
                        <span className={`text-sm font-bold block ${stop.current ? 'text-amber-300' : 'text-white'}`}>
                          {stop.name}
                        </span>
                        <span className="text-xs text-slate-400">{stop.status}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-sky-300">{stop.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right: Live Capacity & Metrics */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-800" />
              <span>Live Onboard Occupancy</span>
            </h3>

            {/* Meter Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Current Occupancy: {bus.currentOccupancy} seats</span>
                <span>{occupancyPercent}% capacity</span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                <div 
                  className={`h-full transition-all ${
                    occupancyPercent >= 80 ? 'bg-red-700' : occupancyPercent >= 60 ? 'bg-amber-600' : 'bg-emerald-700'
                  }`}
                  style={{ width: `${occupancyPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                <span>0 (Empty)</span>
                <span>Total Seats: {bus.capacity}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase">Predicted Trip Overcrowding</div>
              <div className="text-2xl font-black text-sky-900">{bus.overcrowdingProbability}% Likelihood</div>
              <p className="text-xs text-slate-600 font-medium">
                High probability model score triggered by Friday peak commuter flow and campus event conclusion.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="text-xs font-bold text-slate-700">Accessibility Onboard:</div>
              <ul className="text-xs text-slate-600 space-y-1">
                {bus.accessibility.map((a, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
