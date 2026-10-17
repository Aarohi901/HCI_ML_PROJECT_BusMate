import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTranslation } from '../../context/TranslationContext';

export const BookingCheckoutModal = ({ 
  reservationData, 
  isOpen, 
  onClose, 
  onBookingSuccess 
}) => {
  const { announce } = useAccessibility();
  const { t } = useTranslation();

  // 10-minute locking countdown timer
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes
  const [timerExpired, setTimerExpired] = useState(false);

  // Passenger details for each seat
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState('alex.commuter@gmail.com');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code: 'FIRST', discount: 150 }
  const [promoError, setPromoError] = useState('');

  // Payment mode state
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [upiId, setUpiId] = useState('commuter@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [isProcessing, setIsProcessing] = useState(false);

  // Unique idempotency token generated per checkout session
  const [idempotencyToken] = useState(() => 
    `idemp_sb_live_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`
  );

  // Initialize passenger list based on reserved seats
  useEffect(() => {
    if (reservationData?.seats) {
      setPassengers(
        reservationData.seats.map((seat, index) => ({
          seatId: seat.id,
          deck: seat.deck,
          name: index === 0 ? 'Alex Rivera' : `Passenger ${index + 1}`,
          age: index === 0 ? 24 : 22,
          gender: 'Female'
        }))
      );
    }
  }, [reservationData]);

  // Run countdown timer for seat locking
  useEffect(() => {
    if (!isOpen || timerExpired) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          announce('Your 10-minute seat inventory lock has expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timerExpired, announce]);

  if (!isOpen || !reservationData) return null;

  const { bus, seats, boarding, dropping, totalBaseFare } = reservationData;

  // Format timer MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Update passenger details
  const updatePassenger = (index, field, value) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Promo code calculation
  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'FIRST') {
      setAppliedPromo({ code: 'FIRST', discount: Math.min(150, totalBaseFare) });
      announce('Promo code FIRST applied: 150 rupees discount');
    } else if (code === 'CAMPUS20') {
      const disc = Math.round(totalBaseFare * 0.20);
      setAppliedPromo({ code: 'CAMPUS20', discount: disc });
      announce('Promo code CAMPUS20 applied: 20 percent discount');
    } else {
      setPromoError('Invalid coupon code. Try FIRST or CAMPUS20.');
      announce('Invalid coupon code.');
    }
  };

  // Tax calculations
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const taxableSubtotal = Math.max(0, totalBaseFare - discountAmount);
  const gstTax = Math.round(taxableSubtotal * 0.05); // 5% Transit GST
  const finalTotal = taxableSubtotal + gstTax;

  // Sandbox Payment Submission
  const handlePayment = (e) => {
    e.preventDefault();
    if (timerExpired) return;

    setIsProcessing(true);
    announce('Processing simulated payment transaction...');

    setTimeout(() => {
      const pnrNumber = 'PNR-' + Math.floor(Math.random() * 899999 + 100000);
      const bookingRecord = {
        pnr: pnrNumber,
        busId: bus.id,
        routeNumber: bus.routeNumber,
        busPlate: bus.busPlate || 'MH 14 BT 3312',
        operator: 'SmartBus Express Transit',
        origin: bus.origin,
        destination: bus.destination,
        boardingPoint: boarding?.name,
        boardingTime: boarding?.time,
        droppingPoint: dropping?.name,
        droppingTime: dropping?.time,
        seats: seats.map(s => s.id),
        passengers,
        contactEmail,
        contactPhone,
        fareBreakdown: {
          baseFare: totalBaseFare,
          discount: discountAmount,
          gst: gstTax,
          total: finalTotal
        },
        idempotencyToken,
        bookingDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'Confirmed'
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('smartbus_my_trips') || '[]');
      localStorage.setItem('smartbus_my_trips', JSON.stringify([bookingRecord, ...existing]));

      setIsProcessing(false);
      onBookingSuccess(bookingRecord);
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkoutModalHeading"
    >
      <div className="bg-white rounded-3xl border-2 border-slate-300 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header & Seat Locking Timer Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#075985] bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              SECURE CHECKOUT & RESERVATION
            </span>
            <h2 id="checkoutModalHeading" className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Confirm Passenger & Payment Details
            </h2>
          </div>

          <button
            type="button"
            data-a11y-engine="true"
            onClick={onClose}
            className="self-end sm:self-auto p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            aria-label="Cancel checkout"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 10-Minute Inventory Hold Safeguard Banner */}
        <div className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
          timerExpired 
            ? 'bg-red-50 border-red-300 text-red-900' 
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-black text-xs block">
                {timerExpired ? 'Inventory Lock Expired' : 'Server Inventory Hold Active'}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {timerExpired 
                  ? 'Your seat reservation hold has timed out. Please go back to re-select seats.' 
                  : 'Seats are locked exclusively for you to prevent concurrent double bookings.'}
              </span>
            </div>
          </div>
          <span className="font-mono font-black text-lg text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300">
            {formattedTimer}
          </span>
        </div>

        {timerExpired ? (
          <div className="text-center py-6 space-y-3">
            <button
              type="button"
              data-a11y-engine="true"
              onClick={onClose}
              className="px-6 py-3 bg-[#075985] text-white font-black text-sm rounded-xl"
            >
              Return to Seat Selection
            </button>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-6">
            
            {/* 1. Passenger Details Capture */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-[#075985]" />
                <span data-i18n="passengerDetails">{t('passengerDetails')}</span>
              </h3>

              <div className="space-y-3">
                {passengers.map((p, idx) => (
                  <div key={p.seatId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Seat Assigned</span>
                      <span className="font-black text-sm text-[#075985]">Seat {p.seatId} ({p.deck} deck)</span>
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        required
                        data-i18n-placeholder="fullName"
                        placeholder={t('fullName')}
                        value={p.name}
                        onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#075985]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        required
                        min="5"
                        max="99"
                        data-i18n-placeholder="age"
                        placeholder={t('age')}
                        value={p.age}
                        onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#075985]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={p.gender}
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#075985]"
                      >
                        <option value="Female">{t('female')}</option>
                        <option value="Male">{t('male')}</option>
                        <option value="Other">{t('other')}</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1" data-i18n="emailAddress">
                    {t('emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#075985]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1" data-i18n="mobileNumber">
                    {t('mobileNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#075985]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Promo Code & Dynamic Fare Breakdown */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#075985]" />
                  <span>2. Apply Coupon / Concession Code</span>
                </span>
                
                {/* Promo input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code (e.g. FIRST)"
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-[#075985]"
                  />
                  <button
                    type="button"
                    data-a11y-engine="true"
                    onClick={handleApplyPromo}
                    className="px-4 py-1.5 bg-[#075985] text-white text-xs font-black rounded-xl hover:bg-[#0C4A6E]"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {promoError && (
                <p className="text-xs text-red-600 font-bold">{promoError}</p>
              )}

              {appliedPromo && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800">
                  <span>Coupon {appliedPromo.code} Applied</span>
                  <span>-₹{appliedPromo.discount}</span>
                </div>
              )}

              {/* Dynamic Fare Calculation Table */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Base Seat Fare ({seats.length} seats)</span>
                  <span>₹{totalBaseFare}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Applied</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Transit GST & Convenience (5%)</span>
                  <span>₹{gstTax}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount Payable</span>
                  <span className="text-[#075985]">₹{finalTotal}</span>
                </div>
              </div>
            </div>

            {/* 3. Clearly Labeled Payment Sandbox with Idempotency Tokens */}
            <div className="p-5 bg-sky-50/70 rounded-2xl border-2 border-sky-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#075985]" />
                  <span className="text-xs font-black text-[#075985] uppercase tracking-wider">
                    3. Payment Sandbox (Simulated)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-sky-300 rounded text-slate-600">
                  IDEMP: {idempotencyToken.substring(0, 18)}...
                </span>
              </div>

              {/* Payment Methods Tabs */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-300">
                <button
                  type="button"
                  data-a11y-engine="true"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'upi' ? 'bg-[#075985] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  data-a11y-engine="true"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'card' ? 'bg-[#075985] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  data-a11y-engine="true"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'netbanking' ? 'bg-[#075985] text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* Payment input display */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-bold">
                {paymentMethod === 'upi' ? (
                  <div className="flex items-center justify-between">
                    <span>Virtual UPI Address:</span>
                    <span className="font-mono text-[#075985]">{upiId}</span>
                  </div>
                ) : paymentMethod === 'card' ? (
                  <div className="flex items-center justify-between">
                    <span>Test Card Sandbox:</span>
                    <span className="font-mono text-[#075985]">{cardNumber}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>Preferred Bank:</span>
                    <span className="font-bold text-[#075985]">HDFC NetBanking Sandbox</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              data-a11y-engine="true"
              className="w-full py-4 bg-[#075985] hover:bg-[#0C4A6E] active:scale-[0.99] text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-sky-300 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Idempotent Payment...</span>
                </>
              ) : (
                <>
                  <span data-i18n="payAndConfirm">{t('payAndConfirm')} ₹{finalTotal}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
