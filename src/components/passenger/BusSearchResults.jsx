import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Filter, 
  SlidersHorizontal, 
  Wifi, 
  Zap, 
  Droplet, 
  SunMedium, 
  Layers, 
  RotateCcw, 
  AlertCircle,
  ChevronDown,
  Sparkles,
  Info,
  Accessibility,
  Volume2,
  Wind
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from '../../context/TranslationContext';
import { getAllInventories, getBusInventory } from '../../services/inventoryService';
import { OperatorBadge } from './OperatorBadge';

export const BusSearchResults = ({ 
  from = 'Swargate, Pune', 
  to = 'Railway Station, Pune', 
  date = new Date().toISOString().split('T')[0], 
  buses = [], 
  onSelectBus 
}) => {
  const { announce } = useAccessibility();
  const { t } = useTranslation();

  // Loading skeleton state for dynamic filter/search transitions
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Real-time seat inventory state
  const [inventories, setInventories] = useState(() => getAllInventories());

  // Subscribe to real-time seat inventory updates
  useEffect(() => {
    const refreshInventories = () => {
      setInventories(getAllInventories());
    };

    window.addEventListener('smartbus_inventory_updated', refreshInventories);
    window.addEventListener('storage', refreshInventories);

    return () => {
      window.removeEventListener('smartbus_inventory_updated', refreshInventories);
      window.removeEventListener('storage', refreshInventories);
    };
  }, []);

  // Facet Filters State
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // 'morning', 'afternoon', 'evening', 'night'
  const [selectedBusTypes, setSelectedBusTypes] = useState([]); // 'ebus', 'cng', 'atal'
  const [selectedAmenities, setSelectedAmenities] = useState([]); // 'low_floor', 'cctv', 'digital_display', 'usb_charging', 'electric_ac'
  const [maxPrice, setMaxPrice] = useState(30);
  const [sortBy, setSortBy] = useState('departure_asc'); // 'price_asc', 'price_desc', 'duration_asc', 'departure_asc', 'departure_desc'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Trigger a brief skeleton loader whenever core search terms change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [from, to, date]);

  // Enrich bus items dynamically tailored to the searched origin, destination and inventory
  const enrichedBuses = useMemo(() => {
    // Authentic PMPML (Pune Mahanagar Parivahan Mahamandal Ltd) intra-city schedules
    const templates = [
      {
        idSuffix: '01',
        busId: 'BUS-01',
        routeNumber: 'Route 5',
        viaText: 'via Ghorpade Peth, Nana Peth & Sassoon Hospital',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML E-Bus (Olectra/Tata EV AC)',
        boardingPointShort: 'Swargate Bus Stand (Bay 2 City Depot)',
        droppingPointShort: 'Pune Station (Moledina Stand)',
        depTime: '06:15',
        durationMins: 20,
        fare: 15,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'usb_charging', 'electric_ac'],
        rating: 4.8,
        reviewsCount: 312
      },
      {
        idSuffix: '02',
        busId: 'BUS-02',
        routeNumber: 'Route 3',
        viaText: 'via Khajina Vihir / Mandai Circular',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML City Diesel/CNG Standard Seater',
        boardingPointShort: 'Swargate Terminal Stand',
        droppingPointShort: 'Pune Station Moledina Stand',
        depTime: '06:45',
        durationMins: 22,
        fare: 10,
        isAC: false,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'usb_charging'],
        rating: 4.5,
        reviewsCount: 245
      },
      {
        idSuffix: '03',
        busId: 'BUS-03',
        routeNumber: 'Route 4 ATAL',
        viaText: 'Swargate ➔ Pune Station ATAL ₹10 Express',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML Metro Feeder / ATAL Shuttle',
        boardingPointShort: 'Swargate Metro Feeder Bay 1',
        droppingPointShort: 'Pune Station Metro Exit Gate',
        depTime: '07:15',
        durationMins: 18,
        fare: 10,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'electric_ac'],
        rating: 4.9,
        reviewsCount: 428
      },
      {
        idSuffix: '04',
        busId: 'BUS-04',
        routeNumber: 'Route 24',
        viaText: 'Katraj / Swargate ➔ Pune Station Direct',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML City Diesel/CNG Standard Seater',
        boardingPointShort: 'Swargate Sarasbaug Stand',
        droppingPointShort: 'Pune Station Main Terminus',
        depTime: '07:45',
        durationMins: 25,
        fare: 15,
        isAC: false,
        isSleeper: false,
        amenities: ['cctv', 'usb_charging', 'low_floor'],
        rating: 4.6,
        reviewsCount: 198
      },
      {
        idSuffix: '05',
        busId: 'BUS-05',
        routeNumber: 'Route 5',
        viaText: 'via Ghorpade Peth & Sassoon Hospital',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML E-Bus (Olectra/Tata EV AC)',
        boardingPointShort: 'Swargate Bus Stand (Bay 2)',
        droppingPointShort: 'Pune Station (Moledina Stand)',
        depTime: '08:30',
        durationMins: 20,
        fare: 15,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'usb_charging', 'electric_ac'],
        rating: 4.8,
        reviewsCount: 356
      },
      {
        idSuffix: '06',
        busId: 'BUS-06',
        routeNumber: 'Route 4 ATAL',
        viaText: 'Swargate ➔ Pune Station ATAL Fast Feeder',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML Metro Feeder / ATAL Shuttle',
        boardingPointShort: 'Swargate Metro Feeder Bay 1',
        droppingPointShort: 'Pune Station Platform Porch',
        depTime: '09:15',
        durationMins: 18,
        fare: 10,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'electric_ac', 'usb_charging'],
        rating: 4.9,
        reviewsCount: 512
      },
      {
        idSuffix: '07',
        busId: 'BUS-07',
        routeNumber: 'Route 3',
        viaText: 'via Khajina Vihir / Circular',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML E-Bus (Olectra/Tata EV AC)',
        boardingPointShort: 'Swargate Terminal Stand',
        droppingPointShort: 'Pune Station (Moledina Stand)',
        depTime: '10:30',
        durationMins: 22,
        fare: 15,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'electric_ac'],
        rating: 4.7,
        reviewsCount: 220
      },
      {
        idSuffix: '08',
        busId: 'BUS-08',
        routeNumber: 'Route 24',
        viaText: 'Katraj / Swargate ➔ Pune Station Midday Service',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML City Diesel/CNG Standard Seater',
        boardingPointShort: 'Swargate Sarasbaug Stand',
        droppingPointShort: 'Pune Station Central Porch',
        depTime: '12:00',
        durationMins: 24,
        fare: 15,
        isAC: false,
        isSleeper: false,
        amenities: ['cctv', 'low_floor'],
        rating: 4.5,
        reviewsCount: 165
      },
      {
        idSuffix: '09',
        busId: 'BUS-09',
        routeNumber: 'Route 5',
        viaText: 'via Ghorpade Peth & Sassoon Hospital',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML E-Bus (Olectra/Tata EV AC)',
        boardingPointShort: 'Swargate Bus Stand (Bay 2)',
        droppingPointShort: 'Pune Station (Moledina Stand)',
        depTime: '14:30',
        durationMins: 20,
        fare: 15,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'usb_charging', 'electric_ac'],
        rating: 4.8,
        reviewsCount: 289
      },
      {
        idSuffix: '10',
        busId: 'BUS-10',
        routeNumber: 'Route 4 ATAL',
        viaText: 'Swargate ➔ Pune Station Evening Peak ATAL',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML Metro Feeder / ATAL Shuttle',
        boardingPointShort: 'Swargate Metro Feeder Bay 1',
        droppingPointShort: 'Pune Station Metro Exit Gate',
        depTime: '17:30',
        durationMins: 20,
        fare: 10,
        isAC: true,
        isSleeper: false,
        amenities: ['low_floor', 'cctv', 'digital_display', 'electric_ac'],
        rating: 4.9,
        reviewsCount: 620
      },
      {
        idSuffix: '11',
        busId: 'BUS-11',
        routeNumber: 'Route 5',
        viaText: 'Swargate ➔ Pune Station Night Shuttle',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML City Diesel/CNG Standard Seater',
        boardingPointShort: 'Swargate Terminal Stand',
        droppingPointShort: 'Pune Station (Moledina Stand)',
        depTime: '21:15',
        durationMins: 18,
        fare: 20,
        isAC: false,
        isSleeper: false,
        amenities: ['cctv', 'usb_charging'],
        rating: 4.6,
        reviewsCount: 174
      },
      {
        idSuffix: '12',
        busId: 'BUS-12',
        routeNumber: 'Route 5 Late Night',
        viaText: 'Swargate ➔ Pune Station Late Night Service',
        operator: 'PMPML (Pune Mahanagar Parivahan Mahamandal Ltd)',
        busClass: 'PMPML City Diesel/CNG Standard Seater',
        boardingPointShort: 'Swargate Terminal Gate',
        droppingPointShort: 'Pune Station Night Exit',
        depTime: '22:45',
        durationMins: 17,
        fare: 20,
        isAC: false,
        isSleeper: false,
        amenities: ['cctv'],
        rating: 4.5,
        reviewsCount: 110
      }
    ];

    return templates.map((tmpl, idx) => {
      // Calculate arrival time
      const [h, m] = tmpl.depTime.split(':').map(Number);
      const totalArrivalMins = h * 60 + m + tmpl.durationMins;
      const arrH = Math.floor(totalArrivalMins / 60) % 24;
      const arrM = totalArrivalMins % 60;
      const arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;

      // Time slot classification
      let slot = 'night';
      if (h >= 6 && h < 12) slot = 'morning';
      else if (h >= 12 && h < 18) slot = 'afternoon';
      else if (h >= 18 && h < 23) slot = 'evening';

      // Read real-time mutated inventory
      const inv = inventories[tmpl.busId] || getBusInventory(tmpl.busId);
      const liveSeats = inv ? inv.availableSeats : 18;
      const bookedList = inv ? inv.bookedSeats : ['L3', 'L8', 'L13', 'U4'];

      return {
        id: tmpl.busId,
        routeNumber: tmpl.routeNumber,
        operator: tmpl.operator,
        busClass: tmpl.busClass,
        boardingPointShort: tmpl.boardingPointShort,
        droppingPointShort: tmpl.droppingPointShort,
        origin: from,
        destination: to,
        departureTime: tmpl.depTime,
        arrivalTime: arrTime,
        durationMins: tmpl.durationMins,
        durationFormatted: `${tmpl.durationMins}m`,
        timeSlot: slot,
        fare: tmpl.fare,
        baseFare: tmpl.fare,
        isAC: tmpl.isAC,
        isSleeper: tmpl.isSleeper,
        amenities: tmpl.amenities,
        rating: tmpl.rating,
        reviewsCount: tmpl.reviewsCount,
        availableSeats: liveSeats,
        bookedSeats: bookedList,
        totalSeats: inv ? inv.totalSeats : 22,
        status: idx === 3 ? 'Boarding Soon' : 'On Schedule',
        busPlate: `MH 14 BT ${3310 + idx}`
      };
    });
  }, [from, to, inventories]);

  // Apply Facet Filters
  const filteredBuses = useMemo(() => {
    return enrichedBuses.filter(bus => {
      // Departure Time Slot Filter
      if (selectedTimeSlots.length > 0 && !selectedTimeSlots.includes(bus.timeSlot)) {
        return false;
      }

      // Bus Type Filter (PMPML City Fleet)
      if (selectedBusTypes.length > 0) {
        const matchesEBus = selectedBusTypes.includes('ebus') && (bus.isAC || bus.busClass.includes('E-Bus'));
        const matchesStandard = selectedBusTypes.includes('cng') && (!bus.isAC && !bus.busClass.includes('ATAL'));
        const matchesAtal = selectedBusTypes.includes('atal') && (bus.busClass.includes('ATAL') || bus.routeNumber.includes('ATAL'));

        if (!matchesEBus && !matchesStandard && !matchesAtal) {
          return false;
        }
      }

      // Amenities Filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every(amenity => 
          bus.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Price Slider Filter
      if (bus.fare > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.fare - b.fare;
      if (sortBy === 'price_desc') return b.fare - a.fare;
      if (sortBy === 'duration_asc') return a.durationMins - b.durationMins;
      if (sortBy === 'departure_desc') return b.departureTime.localeCompare(a.departureTime);
      return a.departureTime.localeCompare(b.departureTime); // default: departure_asc
    });
  }, [enrichedBuses, selectedTimeSlots, selectedBusTypes, selectedAmenities, maxPrice, sortBy]);

  // Facet toggle helpers
  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const toggleBusType = (type) => {
    setSelectedBusTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setSelectedTimeSlots([]);
    setSelectedBusTypes([]);
    setSelectedAmenities([]);
    setMaxPrice(30);
    setSortBy('departure_asc');
    announce('All filters cleared. Showing all available buses.');
  };

  const timeSlotOptions = [
    { id: 'morning', label: t('morning'), icon: '🌅' },
    { id: 'afternoon', label: t('afternoon'), icon: '☀️' },
    { id: 'evening', label: t('evening'), icon: '🌆' },
    { id: 'night', label: t('night'), icon: '🌙' },
  ];

  const busTypeOptions = [
    { id: 'ebus', label: 'PMPML E-Bus (AC EV)' },
    { id: 'cng', label: 'PMPML Standard (Diesel/CNG)' },
    { id: 'atal', label: 'Metro Feeder / ATAL Shuttle' }
  ];

  const amenityOptions = [
    { id: 'low_floor', label: 'Low Floor / Ramp', icon: Accessibility },
    { id: 'cctv', label: 'CCTV Surveillance', icon: ShieldCheck },
    { id: 'digital_display', label: 'Audio / Next Stop Info', icon: Volume2 },
    { id: 'usb_charging', label: 'USB Mobile Charging', icon: Zap },
    { id: 'electric_ac', label: 'Electric AC', icon: Wind }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto space-y-6" aria-label="Available Bus Departures">
      
      {/* Route & Date Banner Bar */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#075985] uppercase tracking-[0.05em] block" data-i18n="availableBusesTitle">
            {t('availableBusesTitle')}
          </span>
          <h2 className="text-xl sm:text-[1.375rem] font-semibold text-slate-900 tracking-[-0.015em] leading-[1.3] mt-0.5">
            {from} ➔ {to}
          </h2>
          <p className="text-xs font-normal text-slate-500 mt-1">
            Travel Date: {date} • {filteredBuses.length} <span data-i18n="results.found_schedules">{t('results.found_schedules')}</span> • Real-time Inventory Active
          </p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-a11y-engine="true"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-xl flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4 text-[#075985]" />
            <span>{t('filtersTitle')} ({selectedTimeSlots.length + selectedBusTypes.length + selectedAmenities.length})</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sortBySelect" className="text-xs font-medium text-slate-600 hidden sm:inline">
              Sort By:
            </label>
            <select
              id="sortBySelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#075985]"
            >
              <option value="departure_asc">Departure: Earliest First</option>
              <option value="departure_desc">Departure: Latest First</option>
              <option value="price_asc">Price: Lowest to Highest</option>
              <option value="price_desc">Price: Highest to Lowest</option>
              <option value="duration_asc">Duration: Fastest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Facets Sidebar + Results List */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Dynamic Facets Filter Sidebar */}
        <aside 
          className={`md:col-span-3 bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
          aria-label="Filter Search Results"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#075985]" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider" data-i18n="filtersTitle">
                {t('filtersTitle')}
              </h3>
            </div>
            {(selectedTimeSlots.length > 0 || selectedBusTypes.length > 0 || selectedAmenities.length > 0 || maxPrice < 100) && (
              <button
                type="button"
                data-a11y-engine="true"
                onClick={handleResetFilters}
                className="text-[11px] font-black text-[#075985] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span data-i18n="clearAll">{t('clearAll')}</span>
              </button>
            )}
          </div>

          {/* 1. Departure Time Slots */}
          <div className="space-y-2.5">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block" data-i18n="departureTime">
              {t('departureTime')}
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {timeSlotOptions.map(slot => (
                <label 
                  key={slot.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedTimeSlots.includes(slot.id)
                      ? 'border-[#075985] bg-sky-50/70 text-[#075985]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{slot.icon}</span>
                    <span>{slot.label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTimeSlots.includes(slot.id)}
                    onChange={() => toggleTimeSlot(slot.id)}
                    className="w-4 h-4 text-[#075985] rounded border-slate-300 focus:ring-[#075985]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 2. Bus Type Facet */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block" data-i18n="busType">
              {t('busType')}
            </span>
            <div className="space-y-1.5">
              {busTypeOptions.map(type => (
                <label 
                  key={type.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    selectedBusTypes.includes(type.id)
                      ? 'text-[#075985] font-black bg-sky-50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{type.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedBusTypes.includes(type.id)}
                    onChange={() => toggleBusType(type.id)}
                    className="w-4 h-4 text-[#075985] rounded border-slate-300 focus:ring-[#075985]"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 3. Amenities Facet */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              Amenities
            </span>
            <div className="space-y-1.5">
              {amenityOptions.map(amenity => {
                const Icon = amenity.icon;
                return (
                  <label 
                    key={amenity.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      selectedAmenities.includes(amenity.id)
                        ? 'text-[#075985] font-black bg-sky-50'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{amenity.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="w-4 h-4 text-[#075985] rounded border-slate-300 focus:ring-[#075985]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Price Slider */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-800 uppercase tracking-wider">
                Max Fare
              </span>
              <span className="font-black text-[#075985]">
                Up to ₹{maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#075985] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>₹10</span>
              <span>₹30</span>
            </div>
          </div>

        </aside>

        {/* Results Column */}
        <div className="md:col-span-9 space-y-3">
          
          {/* Skeleton Loaders for In-Flight Transitions */}
          {isLoading ? (
            <div className="space-y-3 animate-pulse" aria-label="Loading bus schedules">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl border-2 border-slate-200 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-40 bg-slate-200 rounded-lg"></div>
                    <div className="h-5 w-20 bg-slate-200 rounded-lg"></div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                    <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                  </div>
                  <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredBuses.length === 0 ? (
            /* Empty State with Alternative Suggestions */
            <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border-2 border-slate-200 space-y-4">
              <div className="w-14 h-14 bg-sky-50 text-[#075985] rounded-2xl flex items-center justify-center mx-auto">
                <Bus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900" data-i18n="noBusesFound">
                  {t('noBusesFound')}
                </h3>
                <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto">
                  {t('noBusesFound')}
                </p>
              </div>

              <button
                type="button"
                data-a11y-engine="true"
                data-i18n="clearAll"
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-[#075985] hover:bg-[#0C4A6E] text-white text-xs font-black uppercase rounded-xl transition-colors shadow-xs"
              >
                {t('clearAll')}
              </button>
            </div>
          ) : (
            <>
              {/* 1A. Column Header Bar (Anchoring the tabular horizontal layout) */}
              <div className="bus-results-header-bar hidden lg:grid grid-cols-12 gap-3 px-6 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-xs font-semibold uppercase tracking-[0.05em] text-slate-500 items-center">
                <div className="col-span-4 text-left" data-i18n="operatorsCol">{t('operatorsCol')}</div>
                <div className="col-span-2 text-left" data-i18n="sourceCol">{t('sourceCol')}</div>
                <div className="col-span-1 text-center" data-i18n="durationCol">{t('durationCol')}</div>
                <div className="col-span-2 text-left" data-i18n="destinationCol">{t('destinationCol')}</div>
                <div className="col-span-3 text-right" data-i18n="priceCol">{t('priceCol')} & Booking</div>
              </div>

              {/* 1B. Result Card List (Structured across clear informational zones with hover lift & micro-interactions) */}
              <div className="space-y-3">
                {filteredBuses.map((bus) => (
                  <article
                    key={bus.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs bus-card-interactive space-y-4"
                  >
                    <div className="bus-card-grid grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      
                      {/* ZONE 1: Operator Details (Col 4 - Left with Vector Logo) */}
                      <div className="lg:col-span-4 flex items-start gap-3">
                        <OperatorBadge operator={bus.operator} className="mt-0.5" />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs font-mono border border-rose-200">
                              {bus.routeNumber}
                            </span>
                            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                              <span>{bus.rating}</span>
                            </div>
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 tracking-tight leading-[1.3] truncate pt-0.5" title={bus.operator}>
                            {bus.operator}
                          </h3>
                          <p className="text-[0.8125rem] font-medium text-slate-600 leading-[1.3] truncate">
                            {bus.busClass}
                          </p>
                          {bus.viaText && (
                            <p className="text-[11px] font-normal text-slate-400 italic truncate" title={bus.viaText}>
                              {bus.viaText}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ZONE 2: Departure Info (Col 2) */}
                      <div className="lg:col-span-2 space-y-0.5 text-left">
                        <span className="text-[1.25rem] font-bold text-slate-900 tabular-nums leading-[1.2] block">
                          {bus.departureTime}
                        </span>
                        <span className="text-[0.8125rem] font-medium text-slate-600 block truncate" title={bus.origin}>
                          {bus.origin}
                        </span>
                        <span className="text-xs font-normal text-slate-400 block truncate" title={bus.boardingPointShort}>
                          {bus.boardingPointShort}
                        </span>
                      </div>

                      {/* ZONE 3: Journey Trajectory (Col 1 - Center) */}
                      <div className="lg:col-span-1 flex flex-col items-center justify-center text-center px-1">
                        <div className="flex items-center gap-1 text-[0.8125rem] font-medium text-slate-600 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{bus.durationFormatted}</span>
                        </div>
                        
                        {/* Trajectory indicator */}
                        <div className="w-full max-w-[80px] flex items-center gap-1 my-1">
                          <div className="w-2 h-2 rounded-full bg-[#075985] shrink-0"></div>
                          <div className="h-0.5 bg-slate-300 flex-1 border-t border-dashed border-slate-400"></div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#075985] shrink-0" />
                        </div>

                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {bus.status}
                        </span>
                      </div>

                      {/* ZONE 4: Arrival Info (Col 2) */}
                      <div className="lg:col-span-2 space-y-0.5 text-left">
                        <span className="text-[1.25rem] font-bold text-slate-900 tabular-nums leading-[1.2] block">
                          {bus.arrivalTime}
                        </span>
                        <span className="text-[0.8125rem] font-medium text-slate-600 block truncate" title={bus.destination}>
                          {bus.destination}
                        </span>
                        <span className="text-xs font-normal text-slate-400 block truncate" title={bus.droppingPointShort}>
                          {bus.droppingPointShort}
                        </span>
                      </div>

                      {/* ZONE 5 & 6: Combined Pricing & Booking Action Zone (Col 3 - Right, Flex Row No Overlap) */}
                      <div className="card-action-zone lg:col-span-3 flex flex-col md:flex-row items-end md:items-center justify-between gap-4 min-w-[200px] shrink-0">
                        
                        {/* Price & Seat Inventory Info Block */}
                        <div className="card-pricing-zone flex flex-col items-end text-right">
                          <span className="text-xs text-slate-500 font-medium" data-i18n="startingFrom">{t('startingFrom')}</span>
                          <span className="text-xl font-bold text-slate-900 tabular-nums">
                            ₹{bus.baseFare || bus.fare}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>{bus.availableSeats} <span data-i18n="seatsLeft">{t('seatsLeft')}</span></span>
                          </span>
                        </div>

                        {/* Select Seats CTA Button */}
                        <button
                          type="button"
                          data-a11y-engine="true"
                          data-i18n="selectSeats"
                          onClick={() => onSelectBus(bus)}
                          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 transition-all shadow-sm whitespace-nowrap cursor-pointer"
                        >
                          SELECT SEATS
                        </button>

                      </div>

                    </div>

                    {/* Subtle Amenities & Live Badges Strip */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-500">
                      <div className="flex flex-wrap items-center gap-2">
                        {bus.isAC ? (
                          <span className="bg-sky-50 text-[#075985] px-2 py-0.5 rounded-md border border-sky-200">
                            Electric AC
                          </span>
                        ) : (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            Standard Non-AC
                          </span>
                        )}

                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
                          Low-Floor City Bus (2+2 Seater)
                        </span>

                        {bus.amenities.map(am => (
                          <span key={am} className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                            {am === 'low_floor' ? 'Low Floor / Ramp' :
                             am === 'cctv' ? 'CCTV Surveillance' :
                             am === 'digital_display' ? 'Next Stop Audio' :
                             am === 'usb_charging' ? 'USB Charging' :
                             am === 'electric_ac' ? 'Electric AC' : am.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="text-slate-400 font-mono text-[10px]">
                        Fleet Bus: {bus.busPlate}
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            </>
          )}

        </div>

      </div>

    </section>
  );
};

export default BusSearchResults;
