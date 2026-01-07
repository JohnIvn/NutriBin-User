import React from "react";

const GAS_STYLES = {
  methane: {
    bg: "bg-green-200",
    pole: "bg-green-500",
    text: "text-green-900",
  },
  hydrogen: {
    bg: "bg-red-200",
    pole: "bg-red-500",
    text: "text-red-900",
  },
  smoke: {
    bg: "bg-purple-200",
    pole: "bg-purple-500",
    text: "text-purple-900",
  },
  benzene: {
    bg: "bg-yellow-200",
    pole: "bg-yellow-500",
    text: "text-yellow-900",
  },
  ammonia: {
    bg: "bg-cyan-200",
    pole: "bg-cyan-500",
    text: "text-cyan-900",
  },
  nitrogen: {
    bg: "bg-orange-200",
    pole: "bg-orange-500",
    text: "text-orange-900",
  },
};

export default function GasFlag({ gas, percentage }) {
  const style = GAS_STYLES[gas?.toLowerCase()] ?? GAS_STYLES.methane;

  return (
    <div className={`relative rounded-md w-50 h-30 ${style.bg} text-center`}>
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-md ${style.pole}`}
      />
      <div className="flex flex-col justify-center h-full px-4 pl-5 animate-slide-from-pole">
        <span className={`text-3xl font-bold ${style.text}`}>{percentage}%</span>
        <span className="text-xl font-medium text-gray-700 capitalize">
          {gas}
        </span>
      </div>
    </div>
  );
}
