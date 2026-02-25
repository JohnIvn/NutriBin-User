import React from "react";
import { Thermometer, Droplet, Waves } from "lucide-react";

export default function MoistureBar({ percentage }) {
  // Clamp percentage between 0 and 100
  const fillPercent = Math.min(Math.max(percentage, 0), 100);

  // Determine gradient color
  const getColor = () => {
    if (fillPercent < 30) return "from-red-400 to-red-600"; // Too dry
    if (fillPercent < 70) return "from-cyan-400 to-blue-500"; // Ideal
    return "from-blue-600 to-indigo-700"; // Very wet
  };

  // Status icon based on fillPercent
  const getStatus = () => {
    if (fillPercent < 30)
      return <Thermometer className="w-4 h-4 text-red-500" />;
    if (fillPercent < 70) return <Droplet className="w-4 h-4 text-cyan-500" />;
    return <Waves className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      {/* Threshold labels */}
      <div className="flex justify-between text-xs font-medium text-gray-500">
        <span>Dry</span>
        <span>Ideal</span>
        <span>Wet</span>
      </div>

      {/* Moisture bar */}
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {/* Status icon */}
      <div className="flex justify-end text-sm font-medium text-gray-600">
        {getStatus()}
      </div>
    </div>
  );
}
