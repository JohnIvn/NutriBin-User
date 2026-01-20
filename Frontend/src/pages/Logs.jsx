import React, { useState } from "react";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  History 
} from "lucide-react";

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const logsData = [
    { id: 1, type: "system", level: "success", message: "System startup sequence initiated", timestamp: "2026-01-20 08:00:00" },
    { id: 2, type: "sensor", level: "success", message: "Temperature sensor calibrated", timestamp: "2026-01-20 08:05:00" },
    { id: 3, type: "connection", level: "error", message: "Connection timeout: ESP32_Main", timestamp: "2026-01-20 09:12:00" },
    { id: 4, type: "auth", level: "info", message: "User 'Admin' updated settings", timestamp: "2026-01-20 10:30:00" },
    { id: 5, type: "process", level: "warning", message: "Moisture levels below 10%", timestamp: "2026-01-20 11:00:00" },
    { id: 6, type: "sensor", level: "error", message: "Methane sensor blocked", timestamp: "2026-01-20 11:15:00" },
    { id: 7, type: "system", level: "success", message: "Scheduled maintenance complete", timestamp: "2026-01-20 12:00:00" },
    { id: 8, type: "auth", level: "info", message: "User 'Staff' logged in", timestamp: "2026-01-20 12:45:00" },
  ];

  const filteredLogs = logsData.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.level === filterType;
    return matchesSearch && matchesType;
  });

  const getLevelStyles = (level) => {
    switch (level) {
      case "error": return "bg-red-50 text-red-700 border-red-100";
      case "warning": return "bg-orange-50 text-orange-700 border-orange-100";
      case "success": return "bg-green-50 text-green-700 border-green-100";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "error": return <AlertCircle className="w-3 h-3" />;
      case "success": return <CheckCircle2 className="w-3 h-3" />;
      default: return <Info className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              System Logs
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              History of system events, errors, and user activities.
            </p>
          </div>
          
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm flex items-center gap-2">
            <History className="w-5 h-5 text-[#4F6F52]" />
            <span className="font-bold text-[#3A4D39] text-sm">
              Total Records: {logsData.length}
            </span>
          </div>
        </div>

        {/* controls search and filter */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#3A4D39]/10 flex flex-col md:flex-row gap-4">
          {/* search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4F6F52]" />
            <input 
              type="text"
              placeholder="Search log messages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#4F6F52] focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 text-[#4F6F52] placeholder:text-[#4F6F52]/50 bg-[#FAF9F6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* filter buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-[#739072] mr-1 hidden md:block" />
            {['all', 'error', 'warning', 'success', 'info'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  filterType === type
                    ? "bg-[#3A4D39] text-white shadow-md"
                    : "bg-[#ECE3CE]/30 text-[#4F6F52] hover:bg-[#ECE3CE]/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* the table */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#ECE3CE]">
                  <th className="p-5 text-xs font-bold text-[#739072] uppercase tracking-wider w-[200px]">Timestamp</th>
                  <th className="p-5 text-xs font-bold text-[#739072] uppercase tracking-wider w-[120px]">Level</th>
                  <th className="p-5 text-xs font-bold text-[#739072] uppercase tracking-wider w-[150px]">Source</th>
                  <th className="p-5 text-xs font-bold text-[#739072] uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE3CE]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#ECE3CE]/10 transition-colors group">
                      {/* timestamp */}
                      <td className="p-5 text-sm font-mono text-[#4F6F52] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      
                      {/* level badge */}
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getLevelStyles(log.level)}`}>
                          {getLevelIcon(log.level)}
                          {log.level}
                        </span>
                      </td>

                      {/* source */}
                      <td className="p-5">
                        <span className="text-sm font-bold text-[#3A4D39] bg-[#ECE3CE]/30 px-2 py-1 rounded">
                          {log.type}
                        </span>
                      </td>

                      {/* message */}
                      <td className="p-5 text-sm font-medium text-[#3A4D39]">
                        {log.message}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-10 text-center text-[#739072]">
                      <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  );
}