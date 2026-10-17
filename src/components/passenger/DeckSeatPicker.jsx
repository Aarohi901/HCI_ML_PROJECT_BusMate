import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ArrowRight, Disc, Layers, MapPin, Clock, AlertCircle, Bus } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from '../../context/TranslationContext';
import { useBusInventory } from '../../services/inventoryService';

export const DeckSeatPicker = ({ bus, isOpen, onClose, onProceedToCheckout }) => {
  const navigate = useNavigate();
  const { announce } = useAccessibility();
  const { t } = useTranslation();
  const inventory = useBusInventory(bus?.id);
  const [activeDeck, setActiveDeck] = useState('lower'); // 'lower' | 'upper'
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Authentic Boarding & Dropping Points for Swargate ⇄ Pune Station PMPML Bus
  const boardingOptions = [
    { id: 'b1', name: `${bus?.origin || 'Swargate'} - Main City Bus Stand (Bay 2)`, time: bus?.departureTime || '06:15', landmark: 'Platform 2 Near PMPML Inquiry Counter' },
    { id: 'b2', name: `${bus?.origin || 'Swargate'} - Sarasbaug BRTS Bus Stop`, time: '06:20', landmark: 'Dedicated BRTS Express Corridor Gate' },
  ];

  const droppingOptions = [
    { id: 'd1', name: `${bus?.destination || 'Pune Station'} - Moledina Stand Bus Depot`, time: bus?.arrivalTime || '06:35', landmark: 'Main Station PMPML Terminal Entrance' },
    { id: 'd2', name: `${bus?.destination || 'Pune Station'} - Railway Station Central Porch`, time: '06:40', landmark: 'Opposite Railway Reservation Building' },
  ];

  // Pre-select default boarding & dropping points so the user is never blocked by unselected radios
  const [boardingPoint, setBoardingPoint] = useState('b1');
  const [droppingPoint, setDroppingPoint] = useState('d1');
  const [errorMsg, setErrorMsg] = useState('');
  const [isHolding, setIsHolding] = useState(false);

  if (!isOpen || !bus) return null;

  // Urban City Bus (2+2 Low-Floor Seater Layout)
  const cityBusRows = [
    {
      row: 1,
      seats: [
        { id: '1A', type: 'seater', booked: false, womenOnly: true },
        { id: '1B', type: 'seater', booked: false, womenOnly: true },
        { id: '1C', type: 'seater', booked: false, womenOnly: false },
        { id: '1D', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 2,
      seats: [
        { id: '2A', type: 'seater', booked: false, womenOnly: true },
        { id: '2B', type: 'seater', booked: false, womenOnly: true },
        { id: '2C', type: 'seater', booked: false, womenOnly: false },
        { id: '2D', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 3,
      seats: [
        { id: '3A', type: 'seater', booked: false, womenOnly: false },
        { id: '3B', type: 'seater', booked: false, womenOnly: false },
        { id: '3C', type: 'seater', booked: false, womenOnly: false },
        { id: '3D', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 4,
      seats: [
        { id: '4A', type: 'seater', booked: false, womenOnly: false },
        { id: '4B', type: 'seater', booked: false, womenOnly: false },
        { id: '4C', type: 'seater', booked: false, womenOnly: false },
        { id: '4D', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 5,
      seats: [
        { id: '5A', type: 'seater', booked: false, womenOnly: false },
        { id: '5B', type: 'seater', booked: false, womenOnly: false },
        { id: '5C', type: 'seater', booked: false, womenOnly: false },
        { id: '5D', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 6,
      seats: [
        { id: '6A', type: 'seater', booked: false, womenOnly: false },
        { id: '6B', type: 'seater', booked: false, womenOnly: false },
        { id: '6C', type: 'seater', booked: false, womenOnly: false },
        { id: '6D', type: 'seater', booked: false, womenOnly: false }
      ]
    }
  ];

  // Lower Deck Seat Map (for intercity buses if any)
  const lowerDeckRows = [
    {
      row: 1,
      seats: [
        { id: 'L1', type: 'seater', booked: false, womenOnly: true },
        { id: 'L2', type: 'seater', booked: false, womenOnly: true },
        { id: 'L3', type: 'seater', booked: true, womenOnly: false },
        { id: 'L4', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 2,
      seats: [
        { id: 'L5', type: 'seater', booked: false, womenOnly: false },
        { id: 'L6', type: 'seater', booked: false, womenOnly: false },
        { id: 'L7', type: 'seater', booked: false, womenOnly: false },
        { id: 'L8', type: 'seater', booked: true, womenOnly: false }
      ]
    },
    {
      row: 3,
      seats: [
        { id: 'L9', type: 'seater', booked: false, womenOnly: true },
        { id: 'L10', type: 'seater', booked: false, womenOnly: true },
        { id: 'L11', type: 'seater', booked: false, womenOnly: false },
        { id: 'L12', type: 'seater', booked: false, womenOnly: false }
      ]
    },
    {
      row: 4,
      seats: [
        { id: 'L13', type: 'sleeper', booked: true, womenOnly: false },
        { id: 'L14', type: 'sleeper', booked: false, womenOnly: false }
      ]
    }
  ];

  // Upper Deck Seat Map (Sleeper Berths)
  const upperDeckRows = [
    {
      row: 1,
      seats: [
        { id: 'U1', type: 'sleeper', booked: false, womenOnly: true },
        { id: 'U2', type: 'sleeper', booked: false, womenOnly: false }
      ]
    },
    {
      row: 2,
      seats: [
        { id: 'U3', type: 'sleeper', booked: false, womenOnly: false },
        { id: 'U4', type: 'sleeper', booked: true, womenOnly: false }
      ]
    },
    {
      row: 3,
      seats: [
        { id: 'U5', type: 'sleeper', booked: false, womenOnly: false },
        { id: 'U6', type: 'sleeper', booked: false, womenOnly: false }
      ]
    },
    {
      row: 4,
      seats: [
        { id: 'U7', type: 'sleeper', booked: false, womenOnly: true },
        { id: 'U8', type: 'sleeper', booked: false, womenOnly: false }
      ]
    }
  ];

  const currentDeckRows = bus?.isSleeper ? (activeDeck === 'lower' ? lowerDeckRows : upperDeckRows) : cityBusRows;

  const toggleSeat = (seat) => {
    const isBooked = seat.booked || (inventory?.bookedSeats || []).includes(seat.id);
    if (isBooked) return;
    setErrorMsg('');

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      announce(`Deselected seat ${seat.id}`);
    } else {
      if (selectedSeats.length >= 6) {
        setErrorMsg('Maximum 6 seats can be reserved in a single transaction.');
        return;
      }
      const rawFare = typeof bus.fare === 'number' ? bus.fare : parseInt(String(bus.fare).replace(/\D/g, ''), 10) || 15;
      const seatObj = {
        id: seat.id,
        type: seat.type || 'seater',
        deck: bus?.isSleeper ? activeDeck : 'main',
        fare: rawFare
      };
      setSelectedSeats(prev => [...prev, seatObj]);
      announce(`Selected seat ${seat.id} (Fare: ₹${rawFare})`);
    }
  };

  const handleProceed = async () => {
    setErrorMsg('');

    // Pre-condition 1: At least 1 seat selected
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat from the cabin layout above to proceed.');
      announce('Validation Error: Please select at least one seat.');
      return;
    }

    // Pre-condition 2: Boarding point selected
    if (!boardingPoint) {
      setErrorMsg('Please select your preferred boarding point from the options.');
      announce('Validation Error: Please select your boarding point.');
      return;
    }

    // Pre-condition 3: Dropping point selected
    if (!droppingPoint) {
      setErrorMsg('Please select your preferred dropping point from the options.');
      announce('Validation Error: Please select your dropping point.');
      return;
    }

    const chosenBoarding = boardingOptions.find(b => b.id === boardingPoint) || boardingOptions[0];
    const chosenDropping = droppingOptions.find(d => d.id === droppingPoint) || droppingOptions[0];
    const totalBaseFare = selectedSeats.reduce((acc, s) => acc + s.fare, 0);

    const reservationData = {
      bus,
      busId: bus.id,
      selectedBusId: bus.id,
      seats: selectedSeats,
      boarding: chosenBoarding,
      boardingPoint: chosenBoarding.name,
      boardingPointId: chosenBoarding.id,
      dropping: chosenDropping,
      droppingPoint: chosenDropping.name,
      droppingPointId: chosenDropping.id,
      totalBaseFare,
      totalFare: totalBaseFare
    };

    setIsHolding(true);
    announce('Locking selected seats and preparing passenger details...');

    try {
      // Backend seat-hold API attempt with safe fallback
      await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busId: bus.id,
          seats: selectedSeats.map(s => s.id),
          boarding: chosenBoarding,
          dropping: chosenDropping,
          totalBaseFare
        })
      }).catch(err => {
        console.warn('[SmartBus] Backend hold API offline or network delay, proceeding with local lock:', err);
      });
    } catch (e) {
      console.warn('[SmartBus] Hold fallback active:', e);
    }

    // Persist reservation state to sessionStorage for seamless route navigation
    sessionStorage.setItem('smartbus_current_reservation', JSON.stringify(reservationData));
    localStorage.setItem('smartbus_current_reservation', JSON.stringify(reservationData));

    setIsHolding(false);

    // If parent supplied a modal callback, invoke it; otherwise navigate to /checkout route
    if (onProceedToCheckout) {
      onProceedToCheckout(reservationData);
    } else {
      onClose();
      navigate('/checkout');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deckSeatPickerHeading"
    >
      <div className="bg-white rounded-3xl border-2 border-slate-300 max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.05em] bg-sky-50 text-[#075985] border border-sky-200" data-i18n="deck.subheading">
                {t('deck.subheading')}
              </span>
              <span className="text-xs font-medium text-slate-500">• {bus.routeNumber}</span>
            </div>
            <h2 id="deckSeatPickerHeading" className="text-xl sm:text-2xl font-semibold font-heading text-slate-900 tracking-[-0.015em] mt-1" data-i18n="deck.heading">
              {t('deck.heading')}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {bus.origin} ➔ {bus.destination} • Departure: <span className="tabular-nums font-semibold">{bus.departureTime}</span>
            </p>
          </div>

          <button
            type="button"
            data-a11y-engine="true"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            aria-label="Close seat selection"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Clear Inline Validation Banner */}
        {errorMsg && (
          <div 
            className="p-3.5 bg-red-50 border-2 border-red-300 text-red-900 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-150"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Deck Switcher & Interactive Seat Cabin */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Deck Switcher or Urban City Bus Single-Deck Indicator */}
            {bus?.isSleeper ? (
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  data-a11y-engine="true"
                  onClick={() => setActiveDeck('lower')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeDeck === 'lower' 
                      ? 'bg-white text-[#075985] shadow-xs border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={activeDeck === 'lower'}
                >
                  <Layers className="w-4 h-4" />
                  <span data-i18n="lowerDeck">{t('lowerDeck')}</span>
                </button>
                <button
                  type="button"
                  data-a11y-engine="true"
                  onClick={() => setActiveDeck('upper')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    activeDeck === 'upper' 
                      ? 'bg-white text-[#075985] shadow-xs border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  aria-pressed={activeDeck === 'upper'}
                >
                  <Layers className="w-4 h-4" />
                  <span data-i18n="upperDeck">{t('upperDeck')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-50 to-amber-50/60 rounded-2xl border border-red-200/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      PMPML Low-Floor Urban Bus (2+2 Seater)
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Single Deck • Front Women/Senior Priority
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                  {bus.busType || 'Urban City Bus'}
                </span>
              </div>
            )}

            {/* Visual Seat State Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600 py-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border-2 border-slate-300 bg-white inline-block"></span>
                <span data-i18n="availableSeat">{t('availableSeat')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#075985] inline-block"></span>
                <span data-i18n="selectedSeat">{t('selectedSeat')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-slate-300 inline-block"></span>
                <span data-i18n="bookedSeat">{t('bookedSeat')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded border-2 border-rose-400 bg-rose-50 inline-block"></span>
                <span className="text-rose-700" data-i18n="ladiesSeat">{t('ladiesSeat')}</span>
              </div>
            </div>

            {/* Cabin Layout Canvas */}
            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-4 max-w-sm mx-auto">
              
              {/* Front Driver Cabin Indicator */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-200 text-xs font-mono font-medium text-slate-400">
                <span data-i18n="deck.front_driver">{t('deck.front_driver')}</span>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                  <Disc className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '9s' }} />
                  <span>Driver</span>
                </div>
              </div>

              {/* Deck Rows */}
              <div className="space-y-3.5">
                {currentDeckRows.map((rowObj) => (
                  <div key={rowObj.row} className="flex items-center justify-between">
                    
                    {rowObj.seats.length === 4 ? (
                      <>
                        {/* 2 left seats */}
                        <div className="flex gap-2">
                          {rowObj.seats.slice(0, 2).map((seat) => {
                            const isBooked = seat.booked || (inventory?.bookedSeats || []).includes(seat.id);
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                data-a11y-engine="true"
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat)}
                                className={`w-10 h-10 rounded-xl text-xs font-bold tabular-nums transition-all flex flex-col items-center justify-center relative ${
                                  isBooked
                                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                                    : isSelected
                                      ? 'bg-[#075985] text-white shadow-md ring-2 ring-sky-300'
                                      : seat.womenOnly
                                        ? 'bg-rose-50 border-2 border-rose-400 text-rose-800 hover:bg-rose-100'
                                        : 'bg-white border-2 border-slate-300 hover:border-[#075985] text-slate-800'
                                }`}
                                aria-label={`Seat ${seat.id} ${seat.womenOnly ? 'Women Reserved' : ''} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                              >
                                <span>{seat.id}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle */}
                        <span className="text-[10px] text-slate-300 font-mono uppercase tracking-widest font-medium">AISLE</span>

                        {/* 2 right seats */}
                        <div className="flex gap-2">
                          {rowObj.seats.slice(2, 4).map((seat) => {
                            const isBooked = seat.booked || (inventory?.bookedSeats || []).includes(seat.id);
                            const isSelected = selectedSeats.some(s => s.id === seat.id);
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                data-a11y-engine="true"
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat)}
                                className={`w-10 h-10 rounded-xl text-xs font-bold tabular-nums transition-all flex flex-col items-center justify-center relative ${
                                  isBooked
                                    ? 'bg-slate-300 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                                    : isSelected
                                      ? 'bg-[#075985] text-white shadow-md ring-2 ring-sky-300'
                                      : seat.womenOnly
                                        ? 'bg-rose-50 border-2 border-rose-400 text-rose-800 hover:bg-rose-100'
                                        : 'bg-white border-2 border-slate-300 hover:border-[#075985] text-slate-800'
                                }`}
                                aria-label={`Seat ${seat.id} ${seat.womenOnly ? 'Women Reserved' : ''} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                              >
                                <span>{seat.id}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* Sleeper Berths layout */
                      <div className="flex items-center justify-between w-full">
                        {rowObj.seats.map((seat) => {
                          const isBooked = seat.booked || (inventory?.bookedSeats || []).includes(seat.id);
                          const isSelected = selectedSeats.some(s => s.id === seat.id);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              data-a11y-engine="true"
                              disabled={isBooked}
                              onClick={() => toggleSeat(seat)}
                              className={`w-32 h-12 rounded-xl text-xs font-semibold tabular-nums transition-all flex items-center justify-between px-3 ${
                                isBooked
                                  ? 'bg-slate-300 text-slate-400 cursor-not-allowed border-2 border-slate-300'
                                  : isSelected
                                    ? 'bg-[#075985] text-white shadow-md ring-2 ring-sky-300'
                                    : seat.womenOnly
                                      ? 'bg-rose-50 border-2 border-rose-400 text-rose-800 hover:bg-rose-100'
                                      : 'bg-white border-2 border-slate-300 hover:border-[#075985] text-slate-800'
                              }`}
                              aria-label={`Sleeper Berth ${seat.id} ${seat.womenOnly ? 'Women Reserved' : ''} ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                            >
                              <span>Berth {seat.id}</span>
                              <span className="text-[10px] font-mono opacity-80">{isBooked ? 'Booked' : 'Sleeper'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Required Boarding / Dropping Pickers + Unlock Checkout */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Boarding Point Picker */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#075985]" />
                <span data-i18n="boardingPoint">{t('boardingPoint')}</span>
              </label>
              <div className="space-y-2">
                {boardingOptions.map((opt) => (
                  <label 
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      boardingPoint === opt.id 
                        ? 'bg-white border-[#075985] shadow-2xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="boardingPointGroup"
                      value={opt.id}
                      checked={boardingPoint === opt.id}
                      onChange={() => { setBoardingPoint(opt.id); setErrorMsg(''); }}
                      className="mt-1 text-[#075985] focus:ring-[#075985]"
                    />
                    <div className="text-xs font-medium">
                      <span className="font-semibold text-slate-900 block tabular-nums">{opt.name} ({opt.time})</span>
                      <span className="text-[11px] text-slate-500 font-normal">{opt.landmark}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dropping Point Picker */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2.5">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0F766E]" />
                <span data-i18n="droppingPoint">{t('droppingPoint')}</span>
              </label>
              <div className="space-y-2">
                {droppingOptions.map((opt) => (
                  <label 
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      droppingPoint === opt.id 
                        ? 'bg-white border-[#075985] shadow-2xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="droppingPointGroup"
                      value={opt.id}
                      checked={droppingPoint === opt.id}
                      onChange={() => { setDroppingPoint(opt.id); setErrorMsg(''); }}
                      className="mt-1 text-[#075985] focus:ring-[#075985]"
                    />
                    <div className="text-xs font-medium">
                      <span className="font-semibold text-slate-900 block tabular-nums">{opt.name} ({opt.time})</span>
                      <span className="text-[11px] text-slate-500 font-normal">{opt.landmark}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Selection Summary Card */}
            <div className="deck-picker-summary-card p-4 bg-sky-50/70 border-2 border-sky-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600" data-i18n="deck.selected_seats">{t('deck.selected_seats')}:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : <span data-i18n="deck.none_selected">{t('deck.none_selected')}</span>}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600" data-i18n="col.fare">{t('col.fare')}:</span>
                <span className="text-lg font-bold text-[#075985] tabular-nums tracking-[-0.01em]">
                  ₹{selectedSeats.reduce((acc, s) => acc + s.fare, 0)}
                </span>
              </div>
            </div>

            {/* Primary Action Button - Always Interactive with Visual Validation */}
            <button
              type="button"
              data-a11y-engine="true"
              onClick={handleProceed}
              disabled={isHolding}
              className={`deck-picker-cta-button w-full py-3.5 text-white font-semibold text-sm tracking-wide rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                selectedSeats.length === 0
                  ? 'bg-slate-400 hover:bg-slate-500 cursor-pointer'
                  : 'bg-[#075985] hover:bg-[#0C4A6E] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-sky-200'
              }`}
            >
              {isHolding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Locking Seats...</span>
                </>
              ) : (
                <>
                  <span data-i18n="proceedToBook">{t('proceedToBook')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
