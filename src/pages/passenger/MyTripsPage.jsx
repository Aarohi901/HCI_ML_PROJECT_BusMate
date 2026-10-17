import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, CheckCircle2, Trash2, Send, Star, Bus, MapPin, Printer, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

export const MyTripsPage = () => {
  const { announce } = useAccessibility();
  const [trips, setTrips] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('smartbus_my_trips');
    if (saved) {
      try {
        setTrips(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultTrips = [
        {
          id: 'TKT-849102',
          busId: 'SB-01',
          routeNumber: 'Route 1 (Godavari Express)',
          from: 'IIIT Pune Campus',
          to: 'Godavari Hostel',
          seats: ['12', '13'],
          totalPrice: 0,
          status: 'Confirmed',
          bookingDate: '18 Oct 2026'
        }
      ];
      setTrips(defaultTrips);
      localStorage.setItem('smartbus_my_trips', JSON.stringify(defaultTrips));
    }
  }, []);

  const handleCancelTrip = (tripId) => {
    if (window.confirm('Are you sure you want to cancel this ticket booking? Full refund will be credited instantly.')) {
      const updated = trips.filter(t => (t.pnr || t.id) !== tripId);
      setTrips(updated);
      localStorage.setItem('smartbus_my_trips', JSON.stringify(updated));
      announce('Ticket cancelled successfully');
    }
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const existingFeedback = JSON.parse(localStorage.getItem('smartbus_feedback') || '[]');
    const newEntry = {
      id: Date.now(),
      rating: feedbackRating,
      comment: feedbackComment,
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem('smartbus_feedback', JSON.stringify([newEntry, ...existingFeedback]));
    setFeedbackSubmitted(true);
    setFeedbackComment('');
    announce('Thank you! Your feedback has been received.');
    setTimeout(() => setFeedbackSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-[#075985]" />
            <h1 className="text-2xl sm:text-[2.25rem] font-semibold font-heading text-slate-900 tracking-[-0.02em] leading-[1.25]">My Bookings & Tickets</h1>
          </div>
          <p className="text-sm sm:text-base font-normal text-slate-600 mt-1 leading-relaxed">
            View active e-tickets, check boarding details, or manage cancellations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Bookings List */}
        <div className="lg:col-span-8 space-y-6">
          {trips.length === 0 ? (
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-12 text-center space-y-4">
              <Ticket className="w-12 h-12 text-slate-400 mx-auto" />
              <h2 className="text-xl font-semibold font-heading text-slate-800">No Active Bookings Found</h2>
              <p className="text-xs text-slate-500 font-medium">Search for buses on the home page to book your trip.</p>
            </div>
          ) : (
            trips.map(trip => (
              <div 
                key={trip.id} 
                className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs hover:border-[#075985] transition-all space-y-4"
              >
                <div className="flex justify-between items-start flex-wrap gap-2 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-[#075985] bg-sky-50 px-2 py-0.5 rounded border border-sky-200 tabular-nums">
                      {trip.pnr || trip.id}
                    </span>
                    <h2 className="text-lg font-semibold font-heading text-slate-900 mt-1">
                      {trip.routeNumber || `Bus ${trip.busId}`}
                    </h2>
                    <p className="text-xs font-medium text-slate-700">
                      {trip.from || trip.origin} ➔ {trip.to || trip.destination}
                    </p>
                    {trip.boardingPoint && (
                      <p className="text-[11px] font-normal text-slate-500">
                        Boarding: {trip.boardingPoint} (<span className="tabular-nums font-medium">{trip.boardingTime || '17:30'}</span>)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-300">
                      {trip.status || 'Confirmed'}
                    </span>

                    <button
                      onClick={() => handleCancelTrip(trip.pnr || trip.id)}
                      className="p-2 text-slate-400 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                      title="Cancel Booking"
                      aria-label="Cancel this booking"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Ticket Details Strip */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Reserved Seats</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {Array.isArray(trip.seats) ? trip.seats.join(', ') : (trip.assignedSeat || 'Standard Seating')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Total Paid</span>
                    <span className="text-base font-bold text-[#075985] tabular-nums tracking-[-0.01em]">
                      ₹{trip.fareBreakdown?.total ?? trip.totalPrice ?? 25}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold tracking-wider">Travel Date</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {trip.bookingDate || '18 Oct 2026'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/ticket/${trip.pnr || trip.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#075985] hover:bg-[#0C4A6E] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>View E-Ticket</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Passenger Experience Feedback */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#075985]" />
              <span>Rate Your Journey</span>
            </h2>

            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Help us maintain high cleanliness, safety and punctuality standards across Pune public transit.
            </p>

            {feedbackSubmitted && (
              <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Thank you! Your feedback has been recorded.</span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Overall Satisfaction</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
                      aria-label={`${star} star rating`}
                    >
                      <Star className={`w-6 h-6 ${star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Comments or Suggestions</label>
                <textarea
                  rows="3"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us about the driver punctuality, cleanliness or bus comfort..."
                  required
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-[#075985] focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#075985] text-white font-black text-xs rounded-xl hover:bg-[#0C4A6E] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Journey Feedback</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
};
