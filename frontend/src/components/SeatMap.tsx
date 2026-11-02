import React from 'react';
import { Seat } from '../types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onToggleSeat: (seatCode: string) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onToggleSeat }) => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const getSeat = (code: string) => {
    return seats.find((s) => s.seatCode.toUpperCase() === code.toUpperCase());
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
      {/* Screen presentation */}
      <div className="mb-8">
        <div className="h-2 w-full max-w-md mx-auto bg-gradient-to-r from-transparent via-brand-400 to-transparent rounded-full shadow-lg shadow-brand-400/50" />
        <p className="text-center text-xs tracking-widest text-slate-400 mt-2 uppercase font-medium">
          All Eyes Toward the Screen
        </p>
      </div>

      {/* Grid */}
      <div className="space-y-3 max-w-md mx-auto">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-between">
            <span className="w-6 text-xs font-bold text-slate-400">{row}</span>
            <div className="flex space-x-2 sm:space-x-3">
              {cols.map((col) => {
                const code = `${row}${col}`;
                const seat = getSeat(code);
                const isBooked = seat?.status === 'BOOKED';
                const isSelected = selectedSeats.includes(code);

                return (
                  <button
                    key={code}
                    disabled={isBooked || !seat}
                    onClick={() => onToggleSeat(code)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                      isBooked
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                        : isSelected
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105 ring-2 ring-emerald-300'
                        : 'bg-slate-700 text-slate-200 hover:bg-brand-500 hover:text-white border border-slate-600'
                    }`}
                    title={
                      isBooked
                        ? `${code} (Booked)`
                        : seat
                        ? `${code} - Rs. ${seat.price} (${seat.seatType})`
                        : `${code} (Unavailable)`
                    }
                  >
                    {col}
                  </button>
                );
              })}
            </div>
            <span className="w-6 text-xs font-bold text-slate-400 text-right">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend & Price Categories */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-around gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-700 border border-slate-600" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-emerald-500 ring-1 ring-emerald-300" />
          <span className="text-slate-300">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700 text-slate-600 flex items-center justify-center font-bold">
            X
          </div>
          <span className="text-slate-400">Booked</span>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-400">
        Rows A-B: <span className="text-slate-200 font-medium">Regular (Rs. 150)</span> | Rows C-D: <span className="text-slate-200 font-medium">Premium (Rs. 250)</span> | Row E: <span className="text-slate-200 font-medium">VIP (Rs. 400)</span>
      </div>
    </div>
  );
};

