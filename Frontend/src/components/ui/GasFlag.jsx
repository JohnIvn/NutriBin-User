import React from "react";

const GAS_STYLES = {
  methane: { bg: "bg-green-200", pole: "bg-green-500", text: "text-green-900" },
  "air quality": {
    bg: "bg-blue-200",
    pole: "bg-blue-500",
    text: "text-blue-900",
  },
  "carbon monoxide": {
    bg: "bg-purple-200",
    pole: "bg-purple-500",
    text: "text-purple-900",
  },
  "combustible gases": {
    bg: "bg-yellow-200",
    pole: "bg-yellow-500",
    text: "text-yellow-900",
  },
  weight: { bg: "bg-cyan-200", pole: "bg-cyan-500", text: "text-cyan-900" },
  reed: { bg: "bg-orange-200", pole: "bg-orange-500", text: "text-orange-900" },
};

export default function GasFlag({ gas, percentage }) {
  const gasKey = gas?.toLowerCase();
  const style = GAS_STYLES[gasKey] ?? GAS_STYLES.methane;

  let displayValue;
  if (gasKey === "reed") {
    displayValue = percentage === 1 ? "Open" : "Closed"; 
  } else if (gasKey === "weight") {
    displayValue = percentage !== undefined ? `${percentage} kg` : "0 kg";
  } else {
    displayValue = `${percentage ?? 0}%`;
  }

  return (
    <div className={`relative rounded-md w-50 h-30 ${style.bg} text-center`}>
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-md ${style.pole}`}
      />
      <div className="flex flex-col justify-center h-full px-4 pl-5 animate-slide-from-pole">
        <span className={`text-3xl font-bold ${style.text}`}>
          {displayValue}
        </span>
        <span className="text-xl font-medium text-gray-700 capitalize">
          {gas}
        </span>
      </div>
    </div>
  );
}
