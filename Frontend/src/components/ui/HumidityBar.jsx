import React, { useState, useEffect } from "react";

export default function HumidityBar({ percentage }) {
    const [fillPercent, setFillPercent] = useState(0)

    useEffect(() => {
        const clamped = Math.min(Math.max(percentage, 0), 100)
        const timeout = setTimeout(() => setFillPercent(clamped), 50)
        return () => clearTimeout(timeout)
    }, [percentage])

    return (
      <div className="flex flex-col items-center gap-5 pt-4">
        <div className="relative w-full h-10 bg-white border border-black overflow-hidden">
          <div
            className="absolute bottom-0 h-full bg-[#0474BA] transition-all duration-700 ease-out"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="w-full flex justify-end">
          <span className="text-xl font-bold text-black">{fillPercent}%</span>
        </div>
      </div>
    );
}