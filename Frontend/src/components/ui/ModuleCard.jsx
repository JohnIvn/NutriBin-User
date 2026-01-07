import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import React from "react";

export default function ModuleCard({ title, offline = false, icon = faGear }) {
  return (
    <div className="group flex justify-start items-center gap-3 h-20 rounded-xl border border-gray-100 hover:border-[#CD5C08] hover:bg-[#CD5C08] transition-all duration-200 shadow-sm overflow-hidden bg-white">
      <div className="ml-5 shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 group-hover:bg-white/20 group-hover:text-white transition-colors">
        <FontAwesomeIcon icon={icon} className="text-lg opacity-70" />
      </div>

      <div className="flex flex-col items-start overflow-hidden text-left">
        <span className="text-sm font-bold text-gray-700 truncate w-full group-hover:text-white">
          {title}
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              offline ? "bg-red-500" : "bg-green-500"
            } group-hover:bg-white`}
          />
          <span
            className={`text-[10px] font-medium uppercase tracking-tighter ${
              offline ? "text-red-600" : "text-gray-400"
            } group-hover:text-white/80`}
          >
            {offline ? "Offline" : "Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
