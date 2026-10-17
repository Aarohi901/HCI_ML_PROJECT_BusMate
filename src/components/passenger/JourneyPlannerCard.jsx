import React, { useState, useRef, useEffect } from 'react';
import { 
  Circle, 
  MapPin, 
  ArrowDownUp, 
  X, 
  Search, 
  Calendar, 
  Clock, 
  Zap, 
  Snowflake, 
  Accessibility, 
  ShieldCheck, 
  AlertCircle,
  Bus,
  Check
} from 'lucide-react';

const POPULAR_STATIONS = [
  { name: 'Swargate Stand', type: 'Major Intercity Hub', code: 'SWG' },
  { name: 'Pune Railway Station', type: 'Central Rail Interchange', code: 'PUNE' },
  { name: 'Katraj Bus Stand', type: 'South Corridor Terminal', code: 'KAT' },
  { name: 'Shivajinagar Station', type: 'Metro & Suburban Rail', code: 'SVN' },
  { name: 'Hinjawadi IT Park Phase 1', type: 'Tech Corridor Express', code: 'HINJ' },
  { name: 'Hadapsar Gadital', type: 'East Terminal', code: 'HDP' },
  { name: 'Vimannagar / Airport', type: 'North Transit Corridor', code: 'VIM' },
  { name: 'Kothrud Depot', type: 'West Corridor Depot', code: 'KTH' },
  { name: 'IIIT Pune Campus', type: 'Academic Shuttle Quad', code: 'IIIT' },
  { name: 'Godavari Hostel', type: 'Residential Shuttle Hub', code: 'GDV' },
  { name: 'Talegaon Railway Station', type: 'Suburban Direct Link', code: 'TLG' },
];

export const JourneyPlannerCard = ({ 
  initialFrom = 'Swargate Stand', 
  initialTo = 'Pune Railway Station', 
  onSearch,
  onOpenAlerts
}) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [timingMode, setTimingMode] = useState('leave-now'); // 'leave-now' | 'depart-at' | 'arrive-by'
  const [departureDate, setDepartureDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [departureTime, setDepartureTime] = useState('17:30');
  
  // Real commuter transit filters (Replaces demographic age filters per HCI spec)
  const [filters, setFilters] = useState({
    directOnly: false,
    acOnly: false,
    wheelchair: false,
    lowFloor: false
  });

  // Autocomplete state
  const [activeInput, setActiveInput] = useState(null); // 'from' | 'to' | null
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validationError, setValidationError] = useState('');

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync prop changes if external stop selected from map
  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
  }, [initialFrom]);

  useEffect(() => {
    if (initialTo) setTo(initialTo);
  }, [initialTo]);

  // Filter stations based on query
  const getSuggestions = (query) => {
    if (!query || query.trim() === '') return POPULAR_STATIONS.slice(0, 5);
    const clean = query.toLowerCase().trim();
    return POPULAR_STATIONS.filter(s => 
      s.name.toLowerCase().includes(clean) || 
      s.type.toLowerCase().includes(clean) ||
      s.code.toLowerCase().includes(clean)
    );
  };

  const currentSuggestions = activeInput === 'from' 
    ? getSuggestions(from) 
    : activeInput === 'to' 
      ? getSuggestions(to) 
      : [];

  // Two-way swap function
  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setValidationError('');
  };

  // Field clear
  const handleClear = (field) => {
    if (field === 'from') {
      setFrom('');
      fromInputRef.current?.focus();
    } else {
      setTo('');
      toInputRef.current?.focus();
    }
    setValidationError('');
  };

  // Keyboard navigation for typeahead
  const handleKeyDown = (e, field) => {
    if (currentSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < currentSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : currentSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < currentSuggestions.length) {
        e.preventDefault();
        selectSuggestion(currentSuggestions[activeIndex].name, field);
      }
    } else if (e.key === 'Escape') {
      setActiveInput(null);
      setActiveIndex(-1);
    }
  };

  const selectSuggestion = (stationName, field) => {
    if (field === 'from') {
      setFrom(stationName);
      toInputRef.current?.focus();
    } else {
      setTo(stationName);
    }
    setActiveInput(null);
    setActiveIndex(-1);
    setValidationError('');
  };

  // Toggle commuter preference filter
  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Form submission & validation
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (!cleanFrom || !cleanTo) {
      setValidationError('Please specify both your origin and destination station.');
      return;
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setValidationError('Origin and destination cannot be identical. Please choose different stops.');
      return;
    }

    setValidationError('');
    if (onSearch) {
      onSearch({
        from: cleanFrom,
        to: cleanTo,
        timingMode,
        departureDate,
        departureTime,
        filters
      });
    }
  };

  // Quick saved routes
  const savedRoutes = [
    { label: 'Swargate → Pune Station', from: 'Swargate Stand', to: 'Pune Railway Station' },
    { label: 'Katraj → Shivajinagar', from: 'Katraj Bus Stand', to: 'Shivajinagar Station' },
    { label: 'IIIT Pune → Talegaon', from: 'IIIT Pune Campus', to: 'Talegaon Railway Station' },
    { label: 'Hinjawadi → Swargate', from: 'Hinjawadi IT Park Phase 1', to: 'Swargate Stand' }
  ];

  return (
    <div className="space-y-4">
      {/* Journey Planner Card Container */}
      <div 
        className="bg-white rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-xl space-y-6"
        role="search"
        aria-label="Transit Journey Planner"
      >
        {/* Card Header & Live System Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
              PUNE RAPID TRANSIT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              Where are you heading today?
            </h2>
          </div>

          {/* Status Indicator Badge (Requirement 2 Spec) */}
          <button
            type="button"
            onClick={onOpenAlerts}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            title="Click to view live service status and alerts"
            aria-label="Live System Status: All routes running on time. Click for service alerts."
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>All routes running on time</span>
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div 
            className="flex items-center gap-3 p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-red-900 text-sm font-bold animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin & Destination with Two-Way Swap Affordance */}
          <div className="relative space-y-3">
            
            {/* Origin Input */}
            <div className="relative">
              <label htmlFor="plannerOriginInput" className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Origin (Boarding Point)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#075985]" aria-hidden="true">
                  {/* Hollow Circle (Requirement 2 Spec) */}
                  <Circle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <input
                  id="plannerOriginInput"
                  ref={fromInputRef}
                  type="text"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setActiveInput('from');
                    setValidationError('');
                  }}
                  onFocus={() => setActiveInput('from')}
                  onKeyDown={(e) => handleKeyDown(e, 'from')}
                  placeholder="Enter starting stop or station..."
                  className="w-full min-h-[52px] pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-extrabold text-[#172033] placeholder-slate-400 focus:bg-white focus:border-[#075985] focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors"
                  role="combobox"
                  aria-expanded={activeInput === 'from'}
                  aria-autocomplete="list"
                  aria-controls="origin-suggestions"
                  autoComplete="off"
                />
                {from && (
                  <button
                    type="button"
                    onClick={() => handleClear('from')}
                    className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Clear origin field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Origin Autocomplete List */}
              {activeInput === 'from' && currentSuggestions.length > 0 && (
                <ul
                  id="origin-suggestions"
                  ref={dropdownRef}
                  className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-1 max-h-72 overflow-y-auto"
                  style={{
                    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 10px 10px -5px rgba(15, 23, 42, 0.08)',
                    zIndex: 9999
                  }}
                  role="listbox"
                >
                  <li className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                    Suggested Stops & Stations
                  </li>
                  {currentSuggestions.map((item, idx) => (
                    <li
                      key={item.name}
                      onClick={() => selectSuggestion(item.name, 'from')}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm ${
                        idx === activeIndex ? 'bg-sky-50 text-[#075985]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                      role="option"
                      aria-selected={idx === activeIndex}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#075985] shrink-0" />
                        <div>
                          <span className="font-extrabold block leading-tight">{item.name}</span>
                          <span className="text-xs text-slate-500 font-semibold">{item.type}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {item.code}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Two-Way Swap Button (Requirement 2 Spec) */}
            <div className="flex justify-center -my-1 relative z-10">
              <button
                type="button"
                onClick={handleSwap}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-slate-300 rounded-full text-xs font-black text-[#075985] hover:bg-sky-50 hover:border-[#075985] shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-200 transition-all group"
                aria-label="Swap origin and destination stops"
                title="Swap departure and arrival points"
              >
                <ArrowDownUp className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
                <span>Swap Direction</span>
              </button>
            </div>

            {/* Destination Input */}
            <div className="relative">
              <label htmlFor="plannerDestinationInput" className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Destination (Arrival Point)
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 pointer-events-none text-[#075985]" aria-hidden="true">
                  {/* Map Pin (Requirement 2 Spec) */}
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  id="plannerDestinationInput"
                  ref={toInputRef}
                  type="text"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setActiveInput('to');
                    setValidationError('');
                  }}
                  onFocus={() => setActiveInput('to')}
                  onKeyDown={(e) => handleKeyDown(e, 'to')}
                  placeholder="Enter arrival stop or station..."
                  className="w-full min-h-[52px] pl-12 pr-12 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base font-extrabold text-[#172033] placeholder-slate-400 focus:bg-white focus:border-[#075985] focus:ring-4 focus:ring-sky-200 focus:outline-none transition-colors"
                  role="combobox"
                  aria-expanded={activeInput === 'to'}
                  aria-autocomplete="list"
                  aria-controls="destination-suggestions"
                  autoComplete="off"
                />
                {to && (
                  <button
                    type="button"
                    onClick={() => handleClear('to')}
                    className="absolute right-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Clear destination field"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Destination Autocomplete List */}
              {activeInput === 'to' && currentSuggestions.length > 0 && (
                <ul
                  id="destination-suggestions"
                  className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xl py-1 max-h-72 overflow-y-auto"
                  style={{
                    boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 10px 10px -5px rgba(15, 23, 42, 0.08)',
                    zIndex: 9999
                  }}
                  role="listbox"
                >
                  <li className="px-4 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                    Suggested Stops & Stations
                  </li>
                  {currentSuggestions.map((item, idx) => (
                    <li
                      key={item.name}
                      onClick={() => selectSuggestion(item.name, 'to')}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`px-4 py-2.5 cursor-pointer flex items-center justify-between text-sm ${
                        idx === activeIndex ? 'bg-sky-50 text-[#075985]' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                      role="option"
                      aria-selected={idx === activeIndex}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-[#075985] shrink-0" />
                        <div>
                          <span className="font-extrabold block leading-tight">{item.name}</span>
                          <span className="text-xs text-slate-500 font-semibold">{item.type}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {item.code}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          {/* Timing & Departure Controls (Segmented Picker alongside Date/Time) */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Departure Timing
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Segmented timing selector */}
              <div 
                className="sm:col-span-6 flex bg-slate-100 p-1 rounded-2xl border border-slate-300"
                role="group"
                aria-label="Departure timing mode"
              >
                <button
                  type="button"
                  onClick={() => setTimingMode('leave-now')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    timingMode === 'leave-now' 
                      ? 'bg-white text-[#075985] shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={timingMode === 'leave-now'}
                >
                  Leave Now
                </button>
                <button
                  type="button"
                  onClick={() => setTimingMode('depart-at')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    timingMode === 'depart-at' 
                      ? 'bg-white text-[#075985] shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={timingMode === 'depart-at'}
                >
                  Depart At
                </button>
                <button
                  type="button"
                  onClick={() => setTimingMode('arrive-by')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    timingMode === 'arrive-by' 
                      ? 'bg-white text-[#075985] shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={timingMode === 'arrive-by'}
                >
                  Arrive By
                </button>
              </div>

              {/* Date & Time Input Row */}
              <div className="sm:col-span-6 flex gap-2">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    disabled={timingMode === 'leave-now'}
                    className={`w-full pl-9 pr-2 py-2 text-xs font-black rounded-xl border-2 transition-colors ${
                      timingMode === 'leave-now' 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : 'bg-white text-slate-800 border-slate-300 focus:border-[#075985] focus:outline-none'
                    }`}
                    aria-label="Select departure time"
                  />
                </div>
                <div className="relative flex-1">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    disabled={timingMode === 'leave-now'}
                    className={`w-full pl-9 pr-2 py-2 text-xs font-black rounded-xl border-2 transition-colors ${
                      timingMode === 'leave-now' 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : 'bg-white text-slate-800 border-slate-300 focus:border-[#075985] focus:outline-none'
                    }`}
                    aria-label="Select departure date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real Transit Filter Chips (Inside the Card per HCI Spec) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Transit Preferences
            </span>
            <div className="flex flex-wrap gap-2.5" role="group" aria-label="Transit preferences filters">
              {/* Direct Routes */}
              <button
                type="button"
                onClick={() => toggleFilter('directOnly')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-sky-200 ${
                  filters.directOnly 
                    ? 'bg-[#075985] text-white border-[#0C4A6E] shadow-sm' 
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                aria-pressed={filters.directOnly}
              >
                <Zap className={`w-3.5 h-3.5 ${filters.directOnly ? 'text-amber-300' : 'text-[#075985]'}`} />
                <span>Direct Routes</span>
              </button>

              {/* AC Only */}
              <button
                type="button"
                onClick={() => toggleFilter('acOnly')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-sky-200 ${
                  filters.acOnly 
                    ? 'bg-[#075985] text-white border-[#0C4A6E] shadow-sm' 
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                aria-pressed={filters.acOnly}
              >
                <Snowflake className={`w-3.5 h-3.5 ${filters.acOnly ? 'text-sky-300' : 'text-[#075985]'}`} />
                <span>AC Only</span>
              </button>

              {/* Wheelchair Accessible */}
              <button
                type="button"
                onClick={() => toggleFilter('wheelchair')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-sky-200 ${
                  filters.wheelchair 
                    ? 'bg-[#075985] text-white border-[#0C4A6E] shadow-sm' 
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                aria-pressed={filters.wheelchair}
              >
                <Accessibility className={`w-3.5 h-3.5 ${filters.wheelchair ? 'text-teal-300' : 'text-[#075985]'}`} />
                <span>Wheelchair Accessible</span>
              </button>

              {/* Low Floor */}
              <button
                type="button"
                onClick={() => toggleFilter('lowFloor')}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 transition-all focus:outline-none focus:ring-4 focus:ring-sky-200 ${
                  filters.lowFloor 
                    ? 'bg-[#075985] text-white border-[#0C4A6E] shadow-sm' 
                    : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                }`}
                aria-pressed={filters.lowFloor}
              >
                <Bus className={`w-3.5 h-3.5 ${filters.lowFloor ? 'text-emerald-300' : 'text-[#075985]'}`} />
                <span>Low Floor</span>
              </button>
            </div>
          </div>

          {/* Primary Action Button (Requirement 2 Spec) */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[52px] py-4 bg-[#075985] text-white font-black text-base rounded-2xl hover:bg-[#0C4A6E] focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>Find Buses & Routes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Access: Recent / Saved Routes (Requirement 2 Spec) */}
      <div className="px-2 space-y-2">
        <span className="text-xs font-black text-slate-600 uppercase tracking-wider block">
          Recent & Saved Routes:
        </span>
        <div className="flex flex-wrap gap-2">
          {savedRoutes.map((route, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFrom(route.from);
                setTo(route.to);
                setValidationError('');
              }}
              className="min-h-[38px] px-3.5 py-1.5 bg-white hover:bg-sky-50 text-slate-800 hover:text-[#075985] text-xs font-extrabold rounded-xl border border-slate-300 hover:border-[#075985] transition-all shadow-xs flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <span>{route.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
