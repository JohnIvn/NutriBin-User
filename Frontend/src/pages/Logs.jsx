import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  History,
  ClipboardList,
  RefreshCcw,
  Calendar,
  X,
  Download,
  Filter,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { motion as Motion } from "framer-motion";

const ITEMS_PER_PAGE = 10;

export default function Logs() {
  const { selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
          page: currentPage,
          limit: ITEMS_PER_PAGE,
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
    setCurrentPage(1);
  }, [machineId]);

  // 🔄 Fetch logs when page changes or machine changes
  useEffect(() => {
    fetchLogs();
  }, [currentPage, machineId]);

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

  // Calculate filter stats
  const hasActiveFilters = searchTerm || selectedDate;

  // Generate page numbers with ellipsis
  const generatePageNumbers = () => {
    if (!pagination) return [];

    const { currentPage: current, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, current - 1);
      let end = Math.min(totalPages - 1, current + 1);

      // Adjust if near the start
      if (current <= 3) {
        start = 2;
        end = maxVisible - 1;
      }

      // Adjust if near the end
      if (current >= totalPages - 2) {
        start = totalPages - (maxVisible - 2);
        end = totalPages - 1;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("ellipsis-start");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                  <Database className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Historical Data
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Trash Analysis Logs
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Complete historical record of NPK levels, moisture, and
                environmental readings.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Stats Card */}
              <div className="px-5 py-3 bg-white border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <History className="w-6 h-6 text-[#4F6F52]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#739072] font-medium">
                      Total Records
                    </div>
                    <div className="text-lg font-black text-[#3A4D39]">
                      {pagination?.total ?? logs.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtered Count */}
              {hasActiveFilters && (
                <Motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-800">
                      Showing {filteredLogs.length} filtered result
                      {filteredLogs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Motion.div>
              )}
            </div>
          </div>
        </Motion.div>

        {/* Controls */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-[#3A4D39]/10 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#739072]" />
              <input
                type="text"
                placeholder="Search by Log ID or Date..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#ECE3CE] focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/30 focus:border-[#4F6F52] text-[#3A4D39] placeholder:text-[#739072]/50 bg-[#FAF9F6] font-medium transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#ECE3CE] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-[#739072]" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Date Filter */}
              <div className="relative flex items-center bg-white border-2 border-[#3A4D39]/20 rounded-xl hover:bg-[#FAF9F6] hover:border-[#4F6F52]/40 transition-all duration-200 shadow-sm">
                <div className="pl-4 pointer-events-none">
                  <Calendar className="w-5 h-5 text-[#739072]" />
                </div>
                <input
                  type="date"
                  className="pl-2 pr-3 py-3 bg-transparent text-[#3A4D39] text-sm font-bold outline-none cursor-pointer min-w-[140px]"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="pr-3 text-[#739072] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-6 py-3 bg-[#3A4D39] text-white rounded-xl font-bold hover:bg-[#2d3b2c] active:scale-95 transition-all duration-200 shadow-lg shadow-[#3A4D39]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <RefreshCcw
                  className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-[#ECE3CE]"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                  Active Filters:
                </span>
                {searchTerm && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4F6F52]/10 rounded-lg text-xs font-bold text-[#3A4D39]">
                    <span>Search: "{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4F6F52]/10 rounded-lg text-xs font-bold text-[#3A4D39]">
                    <span>Date: {selectedDate}</span>
                    <button
                      onClick={() => setSelectedDate("")}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDate("");
                  }}
                  className="ml-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </Motion.div>
          )}
        </Motion.div>

        {/* Table */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>Log ID</span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date Created</span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Nitrogen
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Phosphorus
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Potassium
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Moisture
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Humidity
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Temp
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    pH
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-wider text-center">
                    Lid Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="p-0">
                      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <Motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw className="w-12 h-12 text-[#4F6F52]" />
                        </Motion.div>
                        <p className="text-sm font-medium text-[#739072]">
                          Loading logs...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.length ? (
                  filteredLogs.map((log, _index) => (
                    <Motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: _index * 0.02 }}
                      className="border-t border-[#ECE3CE]/50 hover:bg-[#FAF9F6] transition-colors duration-150 group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#4F6F52] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm text-[#4F6F52] font-mono font-medium">
                            {log.id}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {log.date_created}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#4F6F52]/10 text-[#4F6F52] text-sm font-mono font-bold">
                          {log.nitrogen}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#5C8D89]/10 text-[#5C8D89] text-sm font-mono font-bold">
                          {log.phosphorus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#D4A373]/10 text-[#D4A373] text-sm font-mono font-bold">
                          {log.potassium}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-mono font-bold">
                          {log.moisture}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 text-sm font-mono font-bold">
                          {log.humidity}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-sm font-mono font-bold">
                          {log.temperature}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#3A4D39]/10 text-[#3A4D39] text-sm font-bold">
                          {log.ph}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {log.reed_switch == null ? (
                          <span className="text-gray-400 text-sm font-medium">
                            N/A
                          </span>
                        ) : log.reed_switch === true ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-bold">
                            Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-bold">
                            Open
                          </span>
                        )}
                      </td>
                    </Motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="p-0">
                      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="p-6 bg-[#ECE3CE]/40 rounded-2xl">
                          <ClipboardList className="w-12 h-12 text-[#739072]/40" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-[#3A4D39] mb-1">
                            No Logs Found
                          </h3>
                          <p className="text-sm text-[#739072]">
                            {hasActiveFilters
                              ? "Try adjusting your filters to see more results"
                              : "No analysis logs have been recorded yet"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-[#ECE3CE]/50 bg-gradient-to-r from-[#FAF9F6]/50 to-white px-6 py-5"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Page Info */}
                <div className="text-sm text-[#739072] font-medium">
                  Showing{" "}
                  <span className="font-bold text-[#3A4D39]">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-[#3A4D39]">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#3A4D39]">
                    {pagination.total}
                  </span>{" "}
                  records
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-[#3A4D39] hover:bg-[#ECE3CE]/50 active:scale-95"
                    }`}
                    title="First page"
                  >
                    <ChevronsLeft className="w-5 h-5" />
                  </button>

                  {/* Previous Page */}
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-white border-2 border-[#3A4D39]/20 text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white hover:border-[#3A4D39] shadow-sm active:scale-95"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {generatePageNumbers().map((page) => {
                      if (typeof page === "string") {
                        // Render ellipsis
                        return (
                          <div
                            key={page}
                            className="px-2 text-[#739072] font-bold"
                          >
                            •••
                          </div>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                            page === currentPage
                              ? "bg-[#3A4D39] text-white shadow-lg shadow-[#3A4D39]/30 scale-105"
                              : "bg-white border-2 border-[#3A4D39]/20 text-[#3A4D39] hover:bg-[#ECE3CE]/70 hover:border-[#4F6F52]/40 active:scale-95"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                      currentPage === pagination.totalPages
                        ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                        : "bg-white border-2 border-[#3A4D39]/20 text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white hover:border-[#3A4D39] shadow-sm active:scale-95"
                    }`}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    disabled={currentPage === pagination.totalPages}
                    onClick={() => setCurrentPage(pagination.totalPages)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      currentPage === pagination.totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-[#3A4D39] hover:bg-[#ECE3CE]/50 active:scale-95"
                    }`}
                    title="Last page"
                  >
                    <ChevronsRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Motion.div>
          )}
        </Motion.div>
      </div>
    </div>
  );
}
