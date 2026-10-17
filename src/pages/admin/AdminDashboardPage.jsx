import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bus, Users, ShieldAlert, Clock, Activity, AlertTriangle, 
  Scale, LineChart as LineChartIcon, FileCode2, FlaskConical, Sliders, BarChart2, CheckCircle2, ArrowRight,
  Download, RefreshCw, Search, Filter, Calendar, Info, HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';
import tripsData from '../../data/trips.json';
import surveyPayload from '../../data/survey.json';
import predictionsPayload from '../../data/predictions.json';
import metricsData from '../../data/model_metrics.json';
import busesData from '../../data/buses.json';
import { RiskBadge } from '../../components/common/RiskBadge';

export const AdminDashboardPage = () => {
  // Filter States
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [timeBandFilter, setTimeBandFilter] = useState('ALL');
  const [dayTypeFilter, setDayTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Available routes
  const routeOptions = [
    { value: 'ALL', label: 'All Corridors (Metropolitan Network)' },
    { value: 'LINE_HINJ_STN', label: 'Hinjawadi IT Park ➔ Pune Central (310 IT Express)' },
    { value: 'LINE_SWAR_STN', label: 'Swargate ➔ Pune Central Station (101 Direct)' },
    { value: 'LINE_KATR_SHIV', label: 'Katraj ➔ Shivajinagar Metro (204 Express)' },
    { value: 'LINE_HAD_KOTH', label: 'Hadapsar Gadital ➔ Kothrud Depot (412 Cross-Town)' },
    { value: 'LINE_VIM_SWAR', label: 'Pune Airport ➔ Swargate Terminal (505 Airport Flyer)' },
    { value: 'LINE_PUN_TALE', label: 'Talegaon Suburban Hub ➔ Pune Central (601 Suburban Link)' },
    { value: 'TALEGAON', label: 'Talegaon Town Link (Legacy)' },
    { value: 'GODAVARI', label: 'Godavari Transit Shuttle (Legacy)' },
  ];

  // Reset Filters
  const handleResetFilters = () => {
    setRouteFilter('ALL');
    setTimeBandFilter('ALL');
    setDayTypeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return tripsData.filter(t => {
      if (routeFilter !== 'ALL' && t.route !== routeFilter) return false;
      if (timeBandFilter !== 'ALL' && t.timeBand !== timeBandFilter) return false;
      if (dayTypeFilter === 'WEEKDAY' && t.isWeekend) return false;
      if (dayTypeFilter === 'WEEKEND' && !t.isWeekend) return false;
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = t.tripId.toLowerCase().includes(q);
        const matchesRoute = t.route.toLowerCase().includes(q);
        const matchesBus = t.bus.toLowerCase().includes(q);
        const matchesDept = t.departure.includes(q);
        if (!matchesId && !matchesRoute && !matchesBus && !matchesDept) return false;
      }
      return true;
    });
  }, [routeFilter, timeBandFilter, dayTypeFilter, startDate, endDate, searchQuery]);

  // Sort filtered trips
  const sortedTrips = useMemo(() => {
    const list = [...filteredTrips];
    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'date') {
        va = `${a.date} ${a.departure}`;
        vb = `${b.date} ${b.departure}`;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredTrips, sortField, sortAsc]);

  // Dynamic KPIs computed from filtered data
  const totalBookings = useMemo(() => {
    return filteredTrips.reduce((acc, t) => acc + t.recordedBookings, 0);
  }, [filteredTrips]);

  const totalTripsCount = filteredTrips.length;
  const avgBookingsPerTrip = totalTripsCount > 0 ? (totalBookings / totalTripsCount).toFixed(1) : '0.0';
  const totalSeatingCapacity = totalTripsCount * 52;
  const avgUtilization = totalTripsCount > 0 
    ? ((totalBookings / totalSeatingCapacity) * 100).toFixed(1) + '%' 
    : '0.0%';
  const overcapacityTripsCount = filteredTrips.filter(t => t.recordedBookings > 52).length;
  const highRiskTripsCount = filteredTrips.filter(t => t.riskLevel === 'High').length;
  const mediumRiskTripsCount = filteredTrips.filter(t => t.riskLevel === 'Medium').length;

  // Chart 1: Daily Trend
  const dailyTrendData = useMemo(() => {
    const map = {};
    filteredTrips.forEach(t => {
      if (!map[t.date]) {
        map[t.date] = { date: t.date.slice(5), bookings: 0, trips: 0 };
      }
      map[t.date].bookings += t.recordedBookings;
      map[t.date].trips += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTrips]);

  // Chart 2: Route Breakdown
  const routeBreakdownData = useMemo(() => {
    const map = { TALEGAON: 0, GODAVARI: 0, GODAVARI_VIA_TALEGAON: 0 };
    filteredTrips.forEach(t => {
      if (map[t.route] !== undefined) map[t.route] += t.recordedBookings;
    });
    return [
      { route: 'Talegaon', bookings: map.TALEGAON },
      { route: 'Godavari', bookings: map.GODAVARI },
      { route: 'Godavari via Tal.', bookings: map.GODAVARI_VIA_TALEGAON },
    ];
  }, [filteredTrips]);

  // Chart 3: Departure Window / Time Band
  const timeBandData = useMemo(() => {
    const map = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    filteredTrips.forEach(t => {
      if (map[t.timeBand] !== undefined) map[t.timeBand] += t.recordedBookings;
    });
    return [
      { band: 'Morning (06-12)', bookings: map.Morning },
      { band: 'Afternoon (12-17)', bookings: map.Afternoon },
      { band: 'Evening (17-21)', bookings: map.Evening },
      { band: 'Night (21-24)', bookings: map.Night },
    ];
  }, [filteredTrips]);

  // Chart 4: Chronological Test Set Predicted vs Observed
  const testEvalPoints = predictionsPayload.testEvaluationPoints || [];

  // Heatmap: Day of Week x Time Band matrix
  const heatmapMatrix = useMemo(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const bands = ['Morning', 'Afternoon', 'Evening', 'Night'];
    const matrix = {};
    days.forEach(d => {
      matrix[d] = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    });
    filteredTrips.forEach(t => {
      if (matrix[t.weekday] && matrix[t.weekday][t.timeBand] !== undefined) {
        matrix[t.weekday][t.timeBand] += t.recordedBookings;
      }
    });
    return { days, bands, matrix };
  }, [filteredTrips]);

  // CSV Export of filtered aggregate data only (NO names, NO MIS)
  const handleExportCSV = () => {
    if (filteredTrips.length === 0) return;
    const headers = ['TripID', 'Date', 'Weekday', 'IsWeekend', 'Route', 'Direction', 'Departure', 'TimeBand', 'Bus', 'RecordedBookings', 'Capacity', 'UtilizationPct', 'RiskLevel'];
    const rows = filteredTrips.map(t => [
      t.tripId, t.date, t.weekday, t.isWeekend, t.route, t.direction, t.departure, t.timeBand, `"${t.bus}"`, t.recordedBookings, t.capacity, t.utilizationPct, t.riskLevel
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartbus_trips_export_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const surveySummary = surveyPayload.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-2 border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-black tracking-widest uppercase">
              Recorded Data Backed
            </span>
            <span className="px-3 py-1 bg-sky-600 text-white rounded-full text-xs font-black tracking-widest uppercase">
              ML Scikit-Learn Model
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mt-2">SmartBus Institute Operational Intelligence</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Trained and validated on <strong className="text-white">249 authenticated IIIT Pune booking logs</strong> (Aug 16–31, 2026).
            Metric records <strong className="text-amber-400">Recorded Bookings</strong> (verified roster registrations; boardings/no-shows are non-tracked).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-extrabold text-xs rounded-xl border border-slate-700 transition-colors shadow flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/admin/demand"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl transition-colors shadow flex items-center gap-2"
          >
            <span>Demand Prediction</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Dynamic Filter Toolbar */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-800" />
            <h2 className="text-lg font-black text-slate-900">Institute Schedule & Route Filters</h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Route</label>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-800"
            >
              {routeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time Band</label>
            <select
              value={timeBandFilter}
              onChange={(e) => setTimeBandFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-800"
            >
              <option value="ALL">All Departure Windows</option>
              <option value="Morning">Morning (06:00 - 12:00)</option>
              <option value="Afternoon">Afternoon (12:00 - 17:00)</option>
              <option value="Evening">Evening Peak (17:00 - 21:00)</option>
              <option value="Night">Night (21:00 - 24:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Day Type</label>
            <select
              value={dayTypeFilter}
              onChange={(e) => setDayTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-800"
            >
              <option value="ALL">All Days (Mon–Sun)</option>
              <option value="WEEKDAY">Weekdays Only (Mon–Fri)</option>
              <option value="WEEKEND">Weekends Only (Sat–Sun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              min="2026-08-16"
              max="2026-08-31"
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              min="2026-08-16"
              max="2026-08-31"
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-sky-800"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Recorded Bookings</span>
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalBookings}</div>
          <div className="text-xs text-slate-500 font-semibold">Verified roster reservations</div>
          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">Recorded Data</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Trips Analyzed</span>
            <div className="w-9 h-9 rounded-lg bg-sky-800 text-white flex items-center justify-center">
              <Bus className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalTripsCount}</div>
          <div className="text-xs text-slate-500 font-semibold">Of 249 valid historical trips</div>
          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">Recorded Data</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Avg Bookings / Trip</span>
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{avgBookingsPerTrip}</div>
          <div className="text-xs text-slate-500 font-semibold">Seating capacity: 52 seats</div>
          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">Recorded Data</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Avg Fleet Utilization</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-800 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{avgUtilization}</div>
          <div className="text-xs text-slate-500 font-semibold">Total seats: {totalSeatingCapacity}</div>
          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">Recorded Data</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Trips Above Capacity</span>
            <div className="w-9 h-9 rounded-lg bg-amber-700 text-white flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{overcapacityTripsCount}</div>
          <div className="text-xs text-slate-500 font-semibold">Roster entries &gt; 52 seats</div>
          <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-black uppercase">Recorded Data</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Trips at Risk</span>
            <div className="w-9 h-9 rounded-lg bg-red-700 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{highRiskTripsCount + mediumRiskTripsCount}</div>
          <div className="text-xs text-slate-500 font-semibold">{highRiskTripsCount} High, {mediumRiskTripsCount} Med</div>
          <span className="inline-block px-2 py-0.5 bg-sky-100 text-sky-800 rounded text-[10px] font-black uppercase">Model Estimate</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Passenger No-Show Rate</span>
            <div className="w-9 h-9 rounded-lg bg-slate-300 text-slate-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-400 italic">data unavailable</div>
          <div className="text-xs text-slate-400 font-medium">No boarding/turnstile sensor data</div>
          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase">Not In Logging</span>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">System Fairness Score</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">91 / 100</div>
          <div className="text-xs text-slate-500 font-semibold">Calibrated Pareto index</div>
          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-[10px] font-black uppercase">Simulated Metric</span>
        </div>
      </div>

      {/* Evidence-Based Operational Insights & Alerts */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-800" />
          <h3 className="text-base font-black text-amber-900">Evidence-Based Operational Insights & Advisory</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-amber-950">
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
            <span className="text-amber-800 font-black uppercase">Peak Outbound Window (Post-17:30):</span>
            <p className="font-semibold text-slate-700">
              Students stay on campus until 17:30. In the dataset, outbound bookings to Talegaon surge between 17:45 and 18:30 on weekdays.
              <strong> Advisory:</strong> Consider aligning bus departures closely with EMU local train schedules (e.g. 18:45 Talegaon Local).
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
            <span className="text-amber-800 font-black uppercase">Dedicated Godavari Route Fleet:</span>
            <p className="font-semibold text-slate-700">
              One bus is continuously reserved for Godavari hostel students. Total recorded Godavari trips: 37 with peak evening occupancy of ~38 bookings.
              <strong> Advisory:</strong> Capacity of 52 seats is sufficient; no second vehicle needed during standard weekdays.
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Recorded Bookings Trend Over Dates */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Recorded Bookings Trend Across Dates</h3>
              <p className="text-xs text-slate-500 font-semibold">Total verified roster sign-ups per calendar date</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">Recorded</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#0f766e" strokeWidth={3} name="Recorded Bookings" />
                <Line type="monotone" dataKey="trips" stroke="#0284c7" strokeWidth={2} name="Trips Scheduled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demand by Institute Route */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Total Bookings by Institute Route</h3>
              <p className="text-xs text-slate-500 font-semibold">Talegaon vs Godavari dedicated corridor</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">Recorded</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeBreakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="route" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#0369a1" name="Recorded Bookings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Departure Window Distribution */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Demand by Departure Window (Time Band)</h3>
              <p className="text-xs text-slate-500 font-semibold">Morning, Afternoon, Evening peak, Night</p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">Recorded</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeBandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="band" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#047857" name="Recorded Bookings" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Chronological Test Set Predicted vs Observed */}
        <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900">Model Evaluation: Predicted vs Observed</h3>
              <p className="text-xs text-slate-500 font-semibold">Chronological Test Set (Aug 28–31; n={testEvalPoints.length})</p>
            </div>
            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded uppercase">Model Estimate</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={testEvalPoints.slice(0, 30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tripId" stroke="#64748b" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={40} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="observed" stroke="#15803d" strokeWidth={2} name="Observed Bookings" />
                <Line type="monotone" dataKey="predicted" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" name="ML Predicted (RF)" />
                <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1} name="Baseline Mean" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Weekday x Slot Demand Heatmap */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Weekday × Time Slot Demand Intensity Heatmap</h3>
            <p className="text-xs text-slate-500 font-semibold">Shows aggregate recorded student bookings clustered across schedule slots</p>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">Recorded Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs font-bold text-center">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="p-3 text-left">Day of Week</th>
                <th className="p-3">Morning (06:00 - 12:00)</th>
                <th className="p-3">Afternoon (12:00 - 17:00)</th>
                <th className="p-3 bg-amber-50 text-amber-900">Evening Peak (17:00 - 21:00)</th>
                <th className="p-3">Night (21:00 - 24:00)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {heatmapMatrix.days.map(d => {
                const row = heatmapMatrix.matrix[d];
                return (
                  <tr key={d} className="hover:bg-slate-50">
                    <td className="p-3 text-left font-black text-slate-900">{d}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg ${row.Morning > 20 ? 'bg-teal-200 text-teal-900' : 'bg-slate-100 text-slate-700'}`}>
                        {row.Morning}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-lg ${row.Afternoon > 25 ? 'bg-teal-300 text-teal-900 font-black' : 'bg-slate-100 text-slate-700'}`}>
                        {row.Afternoon}
                      </span>
                    </td>
                    <td className="p-3 bg-amber-50/50">
                      <span className={`px-2.5 py-1 rounded-lg ${row.Evening > 30 ? 'bg-amber-300 text-amber-950 font-black' : 'bg-amber-100 text-amber-800'}`}>
                        {row.Evening}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {row.Night}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Insights Panel (To justify allocation design) */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Student Survey & Fairness Preference Insights</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Anonymous sample (n=10) providing empirical basis for allocation constraints & XAI transparency
            </p>
          </div>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded uppercase">Survey Basis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Explainability Expectation</span>
            <div className="text-2xl font-black text-slate-900">{surveySummary.wantsExplanationDist?.Yes || 80}%</div>
            <p className="text-slate-600 font-medium">Demand full transparency showing criteria & weights used</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Fairest Allocation Policy</span>
            <div className="text-2xl font-black text-slate-900">{surveySummary.fairestSystemDist?.EquityWeightedPoints || 40}%</div>
            <p className="text-slate-600 font-medium">Favor Equity-Weighted Points over FCFS for urgency & past denials</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Connecting Transit Buffer</span>
            <div className="text-2xl font-black text-slate-900">10–30 min</div>
            <p className="text-slate-600 font-medium">Required buffer before onward Talegaon local train connection</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">Departure Flexibility</span>
            <div className="text-2xl font-black text-slate-900">80%</div>
            <p className="text-slate-600 font-medium">Accept alternate departure within 15–30 min window</p>
          </div>
        </div>
      </div>

      {/* Filtered Trips Table */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Authenticated Trips Schedule & Allocation Table</h3>
            <p className="text-xs text-slate-500 font-semibold">
              Showing {sortedTrips.length} of {tripsData.length} recorded trips
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trip, bus, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 w-full sm:w-64 focus:ring-2 focus:ring-sky-800"
              />
            </div>
          </div>
        </div>

        {sortedTrips.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="text-base font-black text-slate-800">No trips match the selected filter criteria</h4>
            <p className="text-xs text-slate-500">Try loosening your date range or route selectors to view records.</p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs font-bold divide-y divide-slate-200">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3 text-left cursor-pointer" onClick={() => { setSortField('tripId'); setSortAsc(!sortAsc); }}>
                    Trip ID
                  </th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => { setSortField('date'); setSortAsc(!sortAsc); }}>
                    Date & Departure
                  </th>
                  <th className="p-3 text-left">Route & Direction</th>
                  <th className="p-3 text-left">Bus Assigned</th>
                  <th className="p-3 text-center">Capacity</th>
                  <th className="p-3 text-center cursor-pointer" onClick={() => { setSortField('recordedBookings'); setSortAsc(!sortAsc); }}>
                    Recorded Bookings
                  </th>
                  <th className="p-3 text-center cursor-pointer" onClick={() => { setSortField('utilizationPct'); setSortAsc(!sortAsc); }}>
                    Utilization
                  </th>
                  <th className="p-3 text-center">Seats Rem. / Excess</th>
                  <th className="p-3 text-center">Risk Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedTrips.slice(0, 50).map((t) => {
                  const rem = Math.max(0, t.capacity - t.recordedBookings);
                  return (
                    <tr key={t.tripId} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-black text-slate-900">{t.tripId}</td>
                      <td className="p-3 text-slate-700">
                        <div>{t.date} ({t.weekday.slice(0, 3)})</div>
                        <div className="text-slate-500 font-mono text-[11px]">{t.departure}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-900">{t.route}</span>
                        <span className="block text-[11px] font-semibold text-slate-500 capitalize">{t.direction}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{t.bus}</td>
                      <td className="p-3 text-center text-slate-700 font-black">{t.capacity}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-teal-100 text-teal-900 font-black rounded">
                          {t.recordedBookings}
                        </span>
                      </td>
                      <td className="p-3 text-center font-black text-slate-900">
                        {t.utilizationPct}%
                      </td>
                      <td className="p-3 text-center">
                        {t.excessDemand > 0 ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-black">
                            +{t.excessDemand} excess
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {rem} free
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <RiskBadge riskLevel={t.riskLevel} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedTrips.length > 50 && (
              <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 font-bold border-t border-slate-200">
                Showing top 50 records. Use filters or export CSV to examine all {sortedTrips.length} trips.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
