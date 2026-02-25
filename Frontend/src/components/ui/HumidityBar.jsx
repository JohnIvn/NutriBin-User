import React from "react";
import { Thermometer, Droplet, Waves } from "lucide-react";

export default function HumidityBar({ percentage }) {
  // Clamp the percentage between 0 and 100
  const fillPercent = Math.min(Math.max(percentage, 0), 100);

  // Determine gradient color based on humidity
  const getColor = () => {
    if (fillPercent < 30) return "from-yellow-400 to-yellow-500"; // Dry
    if (fillPercent < 70) return "from-blue-400 to-blue-600"; // Normal
    return "from-indigo-500 to-indigo-700"; // Humid
  };

  // Status icon based on humidity
  const getStatus = () => {
    if (fillPercent < 30)
      return <Thermometer className="w-4 h-4 text-yellow-500" />;
    if (fillPercent < 70) return <Droplet className="w-4 h-4 text-blue-500" />;
    return <Waves className="w-4 h-4 text-indigo-600" />;
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      {/* Threshold labels */}
      <div className="flex justify-between text-xs font-medium text-gray-500">
        <span>Dry</span>
        <span>Normal</span>
        <span>Humid</span>
      </div>

      {/* Humidity bar */}
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
