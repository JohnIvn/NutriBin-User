import React, { useState, useEffect } from "react";
import {
  Search,
  History,
  ClipboardList,
  RefreshCcw,
  Calendar,
  X,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";

export default function Logs() {
  const { selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch logs from backend
  const fetchLogs = async () => {
    if (!machineId) return;

    setLoading(true);
    try {
      const res = await Requests({
        url: `/trash-logs/${machineId}`,
        method: "GET",
        params: {
          page: 1,
          limit: 50,
        },
      });

      setLogs(res.data.logs || []);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to fetch trash logs", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 🚀 Initial load & machine change
  useEffect(() => {
    fetchLogs();
  }, [machineId]);

  // 🔍 Client-side filters
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.id.toLowerCase().includes(term) ||
      log.date_created.toLowerCase().includes(term);

    const matchesDate = selectedDate
      ? log.date_created.startsWith(selectedDate)
      : true;

    return matchesSearch && matchesDate;
  });

  // 🔁 Refresh button
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs();
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
              Total Records: {pagination?.total ?? logs.length}
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
              <RefreshCcw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
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
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider w-[120px]">
                    Log ID
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider w-[180px]">
                    Date Created
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Nitrogen
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Phosphorus
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Potassium
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Moisture
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Humidity
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    Temp
                  </th>
                  <th className="p-4 text-xs font-bold text-[#739072] uppercase tracking-wider">
                    pH
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-10 text-center">
                      Loading logs…
                    </td>
                  </tr>
                ) : filteredLogs.length ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-[#ECE3CE]/10">
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.id}
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.date_created}
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.nitrogen}
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.phosphorus}
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.potassium}
                      </td>
                      <td className="p-4 text-sm font-mono font-medium text-blue-600">
                        {log.moisture}
                      </td>
                      <td className="p-4 text-sm font-mono text-[#4F6F52]">
                        {log.humidity}
                      </td>
                      <td className="p-4 text-sm font-mono text-orange-600 font-medium">
                        {log.temperature}
                      </td>
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
                      No logs found.
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
