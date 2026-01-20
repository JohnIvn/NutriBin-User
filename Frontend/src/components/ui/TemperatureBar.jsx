import React, { useEffect, useState } from "react";

export default function TempBar({ temperature, maxTemp = 100 }) {
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    const percentage = Math.min(Math.max((temperature / maxTemp) * 100, 0), 100);
    const timeout = setTimeout(() => setFillPercent(percentage), 100);
    return () => clearTimeout(timeout);
  }, [temperature, maxTemp]);

  const fahrenheit = ((temperature * 9) / 5 + 32).toFixed(1);

  return (
    <div className="flex items-end justify-center gap-6 h-full py-4 w-full">
      
      {/* Visual Thermometer */}
      <div className="relative flex flex-col items-center h-40 w-12">
        {/* Glass Tube */}
        <div className="w-4 h-full bg-gray-100 rounded-t-full border border-gray-200 relative overflow-hidden">
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-yellow-400 transition-all duration-1000 ease-out"
            style={{ height: `${fillPercent}%` }}
          />
        </div>
        
        {/* Bulb */}
        <div className="w-10 h-10 -mt-2 bg-orange-500 rounded-full border-4 border-white shadow-sm z-10" />

        {/* Scale Ticks */}
        <div className="absolute right-[-12px] top-0 bottom-8 flex flex-col justify-between h-full text-[10px] text-gray-400 font-mono select-none">
            <span>{maxTemp}°</span>
            <span>-</span>
            <span>0°</span>
        </div>
      </div>

      {/* Numeric Display */}
      <div className="flex flex-col justify-end gap-1 mb-2 min-w-[80px]">
        <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black text-[#3A4D39] tracking-tighter">
            {temperature}
            </span>
            <span className="text-xl font-bold text-[#739072]">°C</span>
        </div>
        <div className="h-px w-full bg-[#ECE3CE]" />
        <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#739072]">
            {fahrenheit}
            </span>
            <span className="text-xs font-medium text-[#739072]/60">°F</span>
        </div>
      </div>
    </div>
  );
}