import React from "react";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export default function ModuleCard({ title, icon: Icon, offline = false, subtext = "Hardware Module" }) {
  const DisplayIcon = Icon || HelpCircle;

  return (
    <div className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
        offline 
        ? "bg-red-50/50 border-red-100 hover:border-red-200" 
        : "bg-white border-[#ECE3CE] hover:border-[#3A4D39] hover:shadow-md hover:shadow-[#3A4D39]/5"
    }`}>
      
      {/* icon and text container */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            offline 
            ? "bg-red-100 text-red-500" 
            : "bg-[#ECE3CE]/40 text-[#3A4D39] group-hover:bg-[#3A4D39] group-hover:text-white"
        }`}>
          <DisplayIcon className="w-5 h-5" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-bold truncate transition-colors ${
              offline ? "text-red-700" : "text-[#3A4D39]"
          }`}>
            {title}
          </span>
          <span className="text-[10px] text-gray-400 font-medium truncate">
            {subtext}
          </span>
        </div>
      </div>

      {/* status badge */}
      <div className="shrink-0 pl-2">
        {offline ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md border border-red-100 shadow-sm">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-bold uppercase text-red-600 tracking-wide">Offline</span>
            </div>
        ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#4F6F52]/5 rounded-md border border-[#4F6F52]/10 group-hover:bg-[#4F6F52] group-hover:border-[#4F6F52] transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F6F52] animate-pulse group-hover:bg-white" />
                <span className="text-[10px] font-bold uppercase text-[#4F6F52] tracking-wide group-hover:text-white">Active</span>
            </div>
        )}
      </div>

    </div>
  );
}