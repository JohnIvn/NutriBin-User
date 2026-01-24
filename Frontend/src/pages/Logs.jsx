import React, { useState } from "react";
import { 
  Search, 
  History, 
  ClipboardList,
  RefreshCcw, 
  Calendar,
  X
} from "lucide-react";

export default function Logs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // State for Date Filter
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- Mock Data ---
  const trashLogs = [
    {
      log_id: "a1b2",
      nitrogen: "120 mg/kg",
      phosphorus: "45 mg/kg",
      potassium: "200 mg/kg",
      moisture: "65%",
      humidity: "55%",
      temperature: "30°C",
      ph: "6.8",
      date_created: "2026-01-20 10:30 AM"
    },
    {
      log_id: "e5f6",
      nitrogen: "118 mg/kg",
      phosphorus: "42 mg/kg",
      potassium: "195 mg/kg",
      moisture: "62%",
      humidity: "54%",
      temperature: "31°C",
      ph: "6.7",
      date_created: "2026-01-20 09:15 AM"
    },
    {
      log_id: "i9j0",
      nitrogen: "125 mg/kg",
      phosphorus: "50 mg/kg",
      potassium: "210 mg/kg",
      moisture: "70%",
      humidity: "60%",
      temperature: "29°C",
      ph: "7.0",
      date_created: "2026-01-19 04:45 PM"
    },
    {
      log_id: "m3n4",
      nitrogen: "122 mg/kg",
      phosphorus: "48 mg/kg",
      potassium: "205 mg/kg",
      moisture: "68%",
      humidity: "58%",
      temperature: "29.5°C",
      ph: "6.9",
      date_created: "2026-01-19 02:30 PM"
    },
    {
      log_id: "q7r8",
      nitrogen: "115 mg/kg",
      phosphorus: "40 mg/kg",
      potassium: "190 mg/kg",
      moisture: "60%",
      humidity: "52%",
      temperature: "32°C",
      ph: "6.5",
      date_created: "2026-01-18 11:00 AM"
    },
  ];

  // --- Filter Logic ---
  const filteredLogs = trashLogs.filter((log) => {
    // 1. Check Search Term
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      log.date_created.toLowerCase().includes(term) ||
      log.log_id.toLowerCase().includes(term);

    // 2. Check Date Filter
    const matchesDate = selectedDate 
      ? log.date_created.includes(selectedDate) 
      : true;

    return matchesSearch && matchesDate;
  });

  // --- Handle Refresh ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              Trash Analysis Logs
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Historical record of NPK levels, moisture, and environmental data.
            </p>
          </div>
          
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm flex items-center gap-2">
            <History className="w-5 h-5 text-[#4F6F52]" />
            <span className="font-bold text-[#3A4D39] text-sm">
              Total Records: {trashLogs.length}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#3A4D39]/10 flex flex-col md:flex-row gap-4 items-center">
          
          {/* search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#739072]" />
            <input 
              type="text"
              placeholder="Search by Log ID or Date..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECE3CE] focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/20 text-[#3A4D39] placeholder:text-[#739072]/50 bg-[#FAF9F6]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* action buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
             
             {/* date filter */}
             <div className="relative flex items-center bg-white border border-[#3A4D39]/20 rounded-xl hover:bg-[#FAF9F6] transition-colors shadow-sm flex-1 md:flex-none">
                <div className="pl-4 pointer-events-none">
                  <Calendar className="w-4 h-4 text-[#739072]" />
                </div>
                <input 
                  type="date"
                  className="pl-2 pr-4 py-2.5 bg-transparent text-[#3A4D39] text-xs sm:text-sm font-bold uppercase outline-none cursor-pointer" // cursor-pointer added
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {/* clear date X */}
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate("")}
                    className="pr-2 text-[#739072] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
             </div>

             {/* refresh */}
             <button 
                onClick={handleRefresh}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#3A4D39] text-[#ECE3CE] rounded-xl font-bold hover:bg-[#2d3b2c] transition-colors shadow-lg shadow-[#3A4D39]/20 flex-1 md:flex-none whitespace-nowrap cursor-pointer" // cursor-pointer added
             >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh</span>
             </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#ECE3CE]">
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider w-[120px]">Log ID</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider w-[180px]">Date Created</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Nitrogen</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Phosphorus</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Potassium</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Moisture</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Humidity</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">Temp</th>
                    <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">pH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE3CE]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-[#ECE3CE]/10 transition-colors group">
                        
                        {/* Log ID Cell */}
                        <td className="p-4">
                            <span className="font-mono text-xs font-bold text-[#739072] bg-[#ECE3CE]/30 px-2 py-1 rounded select-all">
                                {log.log_id}
                            </span>
                        </td>

                        <td className="p-4 text-sm font-bold text-[#3A4D39] whitespace-nowrap">
                            {log.date_created}
                        </td>
                        <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.nitrogen}</td>
                        <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.phosphorus}</td>
                        <td className="p-4 text-sm text-[#4F6F52] font-mono">{log.potassium}</td>
                        <td className="p-4 text-sm font-mono font-medium text-blue-600">{log.moisture}</td>
                        <td className="p-4 text-sm font-mono text-[#4F6F52]">{log.humidity}</td>
                        <td className="p-4 text-sm font-mono text-orange-600 font-medium">{log.temperature}</td>
                        <td className="p-4">
                            <span className="inline-block px-2 py-1 rounded bg-[#3A4D39]/10 text-[#3A4D39] text-xs font-bold">
                                {log.ph}
                            </span>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-10 text-center text-[#739072]">
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