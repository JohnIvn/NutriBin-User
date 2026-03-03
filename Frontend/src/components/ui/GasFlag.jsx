import React from "react";
import {
  Flame,
  Wind,
  Droplet,
  Scale,
  Activity,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

const GAS_STYLES = {
  methane: {
    bg: "bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-100",
    pole: "bg-gradient-to-b from-emerald-600 to-emerald-500",
    text: "text-emerald-900",
    glow: "shadow-emerald-200/50",
    icon: Flame,
  },
  "air quality": {
    bg: "bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100",
    pole: "bg-gradient-to-b from-sky-600 to-sky-500",
    text: "text-sky-900",
    glow: "shadow-sky-200/50",
    icon: Wind,
  },
  "carbon monoxide": {
    bg: "bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100",
    pole: "bg-gradient-to-b from-purple-600 to-purple-500",
    text: "text-purple-900",
    glow: "shadow-purple-200/50",
    icon: Activity,
  },
  "combustible gases": {
    bg: "bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100",
    pole: "bg-gradient-to-b from-amber-600 to-amber-500",
    text: "text-amber-900",
    glow: "shadow-amber-200/50",
    icon: Flame,
  },
  "ph level": {
    bg: "bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100",
    pole: "bg-gradient-to-b from-rose-600 to-rose-500",
    text: "text-rose-900",
    glow: "shadow-rose-200/50",
    icon: Droplet,
  },
  weight: {
    bg: "bg-gradient-to-br from-cyan-100 via-teal-50 to-cyan-100",
    pole: "bg-gradient-to-b from-cyan-600 to-cyan-500",
    text: "text-cyan-900",
    glow: "shadow-cyan-200/50",
    icon: Scale,
  },
  reed: {
    bg: "bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100",
    pole: "bg-gradient-to-b from-orange-600 to-orange-500",
    text: "text-orange-900",
    glow: "shadow-orange-200/50",
    icon: DoorOpen,
  },
};

export default function GasFlag({ gas, percentage }) {
  const gasKey = gas?.toLowerCase();
  const style = GAS_STYLES[gasKey] ?? GAS_STYLES.methane;
  const IconComponent = style.icon;

  let displayValue;
  let unit = "";

  if (gasKey === "reed") {
    displayValue = percentage === 1 ? "Open" : "Closed";
    unit = "";
  } else if (gasKey === "weight") {
    displayValue = percentage !== undefined ? percentage : "0";
    unit = "kg";
  } else if (gasKey === "ph level") {
    displayValue = percentage !== undefined ? percentage : "0";
    unit = "pH";
  } else {
    displayValue = percentage ?? 0;
    unit = "%";
  }

  return (
    <div className="group relative w-full h-full">
      <div
        className={`relative rounded-2xl overflow-hidden ${style.bg} border-2 border-white/50 shadow-lg ${style.glow} hover:shadow-xl transition-all duration-300 hover:scale-105`}
      >
        {/* Animated pole */}
        <div
          className={`absolute left-0 top-0 h-full w-1.5 ${style.pole} shadow-lg transition-all duration-300 group-hover:w-2`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center items-center h-full w-full px-4 py-4 pl-6">
          {/* Icon */}
          <div
            className={`mb-2 p-2 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm`}
          >
            <IconComponent className={`w-5 h-5 ${style.text}`} />
          </div>

          {/* Value */}
          <div className="flex items-baseline gap-1 mb-1">
            <span
              className={`text-3xl font-black ${style.text} tracking-tight`}
            >
              {displayValue}
            </span>
            {unit && (
              <span className={`text-sm font-bold ${style.text} opacity-70`}>
                {unit}
              </span>
            )}
          </div>

          {/* Label */}
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide text-center leading-tight">
            {gas}
          </span>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
