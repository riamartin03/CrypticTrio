import React from 'react';
import { Calendar, X } from 'lucide-react';

export default function CalendarModal({ isOpen, onClose, appointments }) {
  const julyDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const getApptsOnDay = (day) => {
    const dayStr = `2026-07-${day < 10 ? '0' + day : day}`;
    return appointments.filter(appt => appt.date === dayStr);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto font-sans text-silver-dark">
      <div className="w-full max-w-5xl bg-white rounded-[36px] shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Sticky Header with Locked CLOSE button */}
        <div className="sticky top-0 z-50 bg-silver-dark text-white p-6 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase">4. Clinic Calendar</h2>
          </div>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-silver-sos hover:bg-red-800 text-white rounded-xl font-black text-lg transition-all cursor-pointer flex items-center space-x-1"
          >
            <X className="w-6 h-6" />
            <span>CLOSE</span>
          </button>
        </div>

        {/* Content: Calendar Matrix & Sidebar grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-grow">
          
          {/* Left Grid: Actual interactive month-view calendar layout cell */}
          <div className="lg:col-span-8 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b-4 border-silver-accent pb-4">
              <h3 className="text-2xl font-black text-silver-dark uppercase">July 2026</h3>
              <span className="text-sm font-black bg-silver-bg text-silver-dark px-3 py-1 rounded-lg">MONTH VIEW</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center font-black text-sm uppercase text-gray-500 mb-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            {/* Calendar grid cells */}
            <div className="grid grid-cols-7 gap-2">
              {/* Prefill offset slots for July 2026 (Starts Wednesday, offset 3 days) */}
              <div className="min-h-[70px] bg-gray-100 rounded-xl"></div>
              <div className="min-h-[70px] bg-gray-100 rounded-xl"></div>
              <div className="min-h-[70px] bg-gray-100 rounded-xl"></div>
              
              {julyDays.map((day) => {
                const dayAppts = getApptsOnDay(day);
                const isToday = day === 11;
                
                return (
                  <div 
                    key={day} 
                    className={`min-h-[75px] sm:min-h-[90px] border-2 rounded-xl p-1.5 flex flex-col justify-between text-left ${
                      isToday 
                        ? 'border-silver-dark bg-silver-accent font-black shadow-inner' 
                        : 'border-gray-200 bg-silver-bg'
                    }`}
                  >
                    <span className={`text-base ${isToday ? 'text-silver-dark font-black' : 'text-gray-600 font-bold'}`}>
                      {day}
                    </span>

                    {/* Split Indicator indicators (Pill icons removed) */}
                    <div className="flex flex-col gap-1 mt-1">
                      {dayAppts.map(appt => (
                        <div 
                          key={appt.id} 
                          className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-1 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter leading-none flex items-center space-x-1"
                        >
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0"></span>
                          <span className="truncate">{appt.title.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Sidebar: Active Appointments Details Log */}
          <div className="lg:col-span-4 bg-silver-bg p-6 sm:p-8 space-y-6 flex flex-col justify-between border-t-4 lg:border-t-0 lg:border-l-4 border-silver-accent">
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-silver-dark uppercase border-b-4 border-silver-accent pb-3">
                Appointments Ledger
              </h3>
              <div className="space-y-4">
                {appointments.map(appt => (
                  <div key={appt.id} className="bg-white p-5 rounded-2xl shadow-sm space-y-2">
                    <span className="text-xs font-black text-silver-dark uppercase tracking-wider block bg-silver-accent px-2 py-0.5 rounded w-max">
                      {appt.date} @ {appt.time}
                    </span>
                    <h4 className="text-lg font-black text-silver-dark">{appt.title}</h4>
                    <p className="text-sm font-bold text-gray-500 leading-tight">
                      Physician: {appt.doctor}<br />
                      Loc: {appt.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-silver-card p-4 rounded-2xl border-2 border-silver-midtone shadow-inner">
              <p className="text-sm font-bold text-silver-dark leading-snug">
                💡 Tap on date cells to select or add mock clinic appointments (front-end only layout).
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
