import React, { useRef } from 'react';
import { TrendingUp, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * 4. Popular Routes with Compact Vector Pills (No Large Photos)
 * Horizontal chip/pill carousel featuring route pin icon, bold route text, fare badge,
 * and animated arrow sliding 3px to the right on hover.
 */
export const PopularRoutesStrip = ({ onSelectRoute }) => {
  const { announce } = useAccessibility();
  const scrollContainerRef = useRef(null);

  const routes = [
    { 
      fromTitle: 'Swargate', 
      toTitle: 'Pune Station', 
      from: 'Swargate, Pune', 
      to: 'Railway Station, Pune', 
      fare: 'from ₹172', 
      time: '20 mins' 
    },
    { 
      fromTitle: 'Mumbai', 
      toTitle: 'Pune', 
      from: 'Dadar, Mumbai', 
      to: 'Railway Station, Pune', 
      fare: 'from ₹340', 
      time: '3h 30m' 
    },
    { 
      fromTitle: 'Pune Station', 
      toTitle: 'Hinjawadi', 
      from: 'Railway Station, Pune', 
      to: 'Hinjawadi Phase 1, Pune', 
      fare: 'from ₹45', 
      time: '45 mins' 
    },
    { 
      fromTitle: 'Shivajinagar', 
      toTitle: 'Wakad', 
      from: 'Shivajinagar, Pune', 
      to: 'Hinjawadi Phase 1, Pune', 
      fare: 'from ₹35', 
      time: '35 mins' 
    },
    { 
      fromTitle: 'Swargate', 
      toTitle: 'Katraj', 
      from: 'Swargate, Pune', 
      to: 'Katraj, Pune', 
      fare: 'from ₹20', 
      time: '15 mins' 
    },
    { 
      fromTitle: 'IIIT Pune', 
      toTitle: 'Talegaon', 
      from: 'IIIT Pune Campus', 
      to: 'Talegaon Railway Station', 
      fare: 'Free Shuttle', 
      time: '25 mins' 
    },
    { 
      fromTitle: 'Vimannagar', 
      toTitle: 'Pune Station', 
      from: 'Vimannagar / Airport, Pune', 
      to: 'Railway Station, Pune', 
      fare: 'from ₹25', 
      time: '20 mins' 
    },
    { 
      fromTitle: 'Hadapsar', 
      toTitle: 'Swargate', 
      from: 'Hadapsar Gadital, Pune', 
      to: 'Swargate, Pune', 
      fare: 'from ₹25', 
      time: '30 mins' 
    },
  ];

  const handleRouteClick = (r) => {
    announce(`Selected route ${r.fromTitle} to ${r.toTitle}`);
    if (onSelectRoute) {
      onSelectRoute(r.from, r.to);
    }
  };

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto space-y-3.5" aria-label="Popular Commuter Routes">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#075985]" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Popular Commuter Routes
          </h2>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#075985] transition-colors shadow-2xs"
            aria-label="Scroll popular routes left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#075985] transition-colors shadow-2xs"
            aria-label="Scroll popular routes right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modern Horizontal Chip/Pill Carousel (No Large Stock Photos) */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth focus:outline-none"
        tabIndex={0}
        role="region"
        aria-label="Popular routes carousel"
      >
        {routes.map((route, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleRouteClick(route)}
            className="group relative shrink-0 inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50/70 border border-slate-200/90 hover:border-sky-300 shadow-2xs hover:shadow-md transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#075985] cursor-pointer"
            title={`Select ${route.fromTitle} to ${route.toTitle}`}
          >
            {/* Small Route Pin Icon with Subtle Accent Badge */}
            <div className="w-7 h-7 rounded-xl bg-sky-100/70 text-[#075985] group-hover:bg-[#075985] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            </div>

            {/* Bold Route Text */}
            <div className="text-left whitespace-nowrap">
              <div className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-900 flex items-center gap-1.5">
                <span>{route.fromTitle}</span>
                <span className="text-slate-400 font-normal">➔</span>
                <span>{route.toTitle}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 block leading-tight">
                {route.time}
              </span>
            </div>

            {/* Subtle Fare Badge */}
            <span className="ml-1 text-[11px] font-semibold text-[#075985] bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200/80 group-hover:bg-sky-100/80 group-hover:border-sky-300 transition-colors whitespace-nowrap tabular-nums">
              {route.fare}
            </span>

            {/* Gentle Hover Highlight with Animated Right Arrow (slides 3px right on hover) */}
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#075985] group-hover:translate-x-1 transition-transform duration-200 shrink-0 ml-0.5" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
};

