import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Search,
  Wrench,
  ClipboardList,
  RefreshCcw,
  Calendar,
  X,
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

export default function Repairs() {
  const { user } = useUser();
  const userId = user?.id || user?.customer_id;

  const [repairs, setRepairs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🔄 Fetch repairs from backend
  const fetchRepairs = async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const res = await Requests({
        url: `/module-analytics/${userId}/all-repairs`,
        method: "GET",
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        },
      });

      // Handle different response wrapping formats
      let logsData = null;
      let paginationData = null;

      if (res?.data?.logs) {
        logsData = res.data.logs;
        paginationData = res.data.pagination;
      } else if (res?.logs) {
        logsData = res.logs;
        paginationData = res.pagination;
      }

      if (logsData && Array.isArray(logsData)) {
        setRepairs(logsData);
        setPagination(paginationData);
      } else {
        setRepairs([]);
      }
    } catch (err) {
      setRepairs([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 🚀 Initial load & user change
  useEffect(() => {
    setCurrentPage(1);
  }, [userId]);

  // 🔄 Fetch repairs when page changes or user changes
  useEffect(() => {
    fetchRepairs();
  }, [currentPage, userId]);

  // 🔍 Client-side filters
  const filteredRepairs = repairs.filter((repair) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      repair.id.toLowerCase().includes(term) ||
      repair.machine_id.toLowerCase().includes(term) ||
      (repair.description && repair.description.toLowerCase().includes(term));

    const matchesStatus = selectedStatus
      ? repair.repair_status === selectedStatus
      : true;

    return matchesSearch && matchesStatus;
  });

  // 🔁 Refresh button
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRepairs();
  };

  // Calculate filter stats
  const hasActiveFilters = searchTerm || selectedStatus;

  // Get unique statuses for filter dropdown
  const uniqueStatuses = [
    ...new Set(repairs.map((r) => r.repair_status)),
  ].filter(Boolean);

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handle direct page input
  const handlePageInput = (value) => {
    if (!pagination) return;
    const pageNum = parseInt(value, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.totalPages) {
      setCurrentPage(pageNum);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/40 via-white to-[#FAF9F6] font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
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
                  <Wrench className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Maintenance
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Repair Requests
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Track and manage all machine repair requests and maintenance
                activities.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Stats Card */}
              <Motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="px-6 py-4 bg-gradient-to-br from-white to-[#FAF9F6] border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5 hover:shadow-xl hover:border-[#4F6F52]/40 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div className="relative p-2 bg-[#4F6F52]/10 rounded-xl group-hover:bg-[#4F6F52]/20 transition-colors">
                    <Wrench className="w-5 h-5 text-[#4F6F52] group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="text-xs text-[#739072] font-bold uppercase tracking-wide">
                      Total Requests
                    </div>
                    <div className="text-2xl font-black text-[#3A4D39]">
                      {pagination?.total ?? repairs.length}
                    </div>
                  </div>
                </div>
              </Motion.div>

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
                      Showing {filteredRepairs.length} filtered result
                      {filteredRepairs.length !== 1 ? "s" : ""}
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
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-[#3A4D39]/10 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#739072] group-hover:text-[#4F6F52] transition-colors" />
              <input
                type="text"
                placeholder="Search by Repair ID, Machine ID, or Description..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-[#ECE3CE] hover:border-[#4F6F52]/40 focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/40 focus:border-[#4F6F52] focus:shadow-lg text-[#3A4D39] placeholder:text-[#739072]/60 bg-[#FAF9F6] font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-100 rounded-lg transition-all hover:text-red-600"
                >
                  <X className="w-4 h-4 text-[#739072]" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter */}
              <div className="relative flex items-center bg-white border-2 border-[#3A4D39]/20 rounded-xl hover:border-[#4F6F52]/40 transition-all duration-200 shadow-sm hover:shadow-md group">
                <div className="pl-4 pointer-events-none">
                  <Filter className="w-5 h-5 text-[#739072] group-hover:text-[#4F6F52] transition-colors" />
                </div>
                <select
                  className="pl-2 pr-3 py-3.5 bg-transparent text-[#3A4D39] text-sm font-bold outline-none cursor-pointer min-w-[140px] hover:bg-[#FAF9F6]/70 focus:bg-[#FAF9F6] transition-colors appearance-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {selectedStatus && (
                  <button
                    onClick={() => setSelectedStatus("")}
                    className="pr-3 text-[#739072] hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#3A4D39] to-[#2d3b2c] text-white rounded-xl font-bold hover:shadow-xl hover:from-[#2d3b2c] hover:to-[#1f2822] transition-all duration-300 shadow-lg shadow-[#3A4D39]/25 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap group"
              >
                <RefreshCcw
                  className={`w-5 h-5 transition-transform ${isRefreshing ? "animate-spin" : "group-hover:rotate-180"}`}
                />
                <span>Refresh</span>
              </Motion.button>
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
                {selectedStatus && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#4F6F52]/10 rounded-lg text-xs font-bold text-[#3A4D39]">
                    <span>Status: {selectedStatus}</span>
                    <button
                      onClick={() => setSelectedStatus("")}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("");
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
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span>Repair ID</span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span>Machine ID</span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Description</span>
                    </div>
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="p-4 text-xs font-black text-[#739072] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Date Created</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-0">
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
                          Loading repairs...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRepairs.length ? (
                  filteredRepairs.map((repair, _index) => (
                    <Motion.tr
                      key={repair.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: _index * 0.02 }}
                      className="border-t border-[#ECE3CE]/50 hover:bg-[#FAF9F6] transition-colors duration-150 group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#4F6F52] opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-sm text-[#4F6F52] font-mono font-medium">
                            {repair.id}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[#4F6F52] font-mono font-medium">
                          {repair.machine_id}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#739072] font-medium">
                        {repair.description || "—"}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-300 ${getStatusColor(
                            repair.repair_status,
                          )}`}
                        >
                          {repair.repair_status || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#4F6F52] font-mono">
                        {repair.date_created}
                      </td>
                    </Motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-0">
                      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                        <div className="p-6 bg-[#ECE3CE]/40 rounded-2xl">
                          <ClipboardList className="w-12 h-12 text-[#739072]/40" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-[#3A4D39] mb-1">
                            No Repairs Found
                          </h3>
                          <p className="text-sm text-[#739072]">
                            {hasActiveFilters
                              ? "Try adjusting your filters to see more results"
                              : "No repair requests have been made yet"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination with Page Input */}
          {pagination && pagination.totalPages > 1 && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-[#ECE3CE]/50 bg-gradient-to-r from-[#FAF9F6]/50 to-white px-6 py-6"
            >
              <div className="space-y-4">
                {/* Top Row: Page Info */}
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

                {/* Bottom Row: Controls */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  {/* Sequential Navigation */}
                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <Motion.button
                      whileHover={currentPage !== 1 ? { scale: 1.08 } : {}}
                      whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className={`p-2.5 rounded-lg transition-all duration-200 tooltip ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed bg-gray-50/50"
                          : "text-[#3A4D39] hover:bg-[#ECE3CE]/70 active:scale-95 hover:shadow-md hover:text-[#2d3b2c]"
                      }`}
                      title="First page"
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </Motion.button>

                    {/* Previous Page */}
                    <Motion.button
                      whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                      whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        currentPage === 1
                          ? "bg-gray-100/50 text-gray-300 cursor-not-allowed"
                          : "bg-white border-2 border-[#3A4D39]/20 text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white hover:border-[#3A4D39] hover:shadow-lg active:scale-95"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </Motion.button>

                    {/* Next Page */}
                    <Motion.button
                      whileHover={
                        currentPage !== pagination.totalPages
                          ? { scale: 1.05 }
                          : {}
                      }
                      whileTap={
                        currentPage !== pagination.totalPages
                          ? { scale: 0.95 }
                          : {}
                      }
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                        currentPage === pagination.totalPages
                          ? "bg-gray-100/50 text-gray-300 cursor-not-allowed"
                          : "bg-white border-2 border-[#3A4D39]/20 text-[#3A4D39] hover:bg-[#3A4D39] hover:text-white hover:border-[#3A4D39] hover:shadow-lg active:scale-95"
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Motion.button>

                    {/* Last Page */}
                    <Motion.button
                      whileHover={
                        currentPage !== pagination.totalPages
                          ? { scale: 1.08 }
                          : {}
                      }
                      whileTap={
                        currentPage !== pagination.totalPages
                          ? { scale: 0.95 }
                          : {}
                      }
                      disabled={currentPage === pagination.totalPages}
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        currentPage === pagination.totalPages
                          ? "text-gray-300 cursor-not-allowed bg-gray-50/50"
                          : "text-[#3A4D39] hover:bg-[#ECE3CE]/70 active:scale-95 hover:shadow-md hover:text-[#2d3b2c]"
                      }`}
                      title="Last page"
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </Motion.button>
                  </div>

                  {/* Page Input - Center/Right */}
                  <div className="flex items-center justify-end lg:justify-center gap-3">
                    <span className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                      Jump to page:
                    </span>
                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-[#4F6F52]/30 rounded-lg shadow-md hover:shadow-lg hover:border-[#4F6F52]/50 transition-all duration-200">
                      <input
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        value={currentPage}
                        onChange={(e) => handlePageInput(e.target.value)}
                        className="w-16 px-2 py-1.5 border-0 text-center text-base font-bold text-[#3A4D39] bg-[#FAF9F6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4F6F52]/50 focus:bg-white hover:bg-white transition-all duration-200"
                      />
                      <span className="text-sm font-bold text-[#3A4D39] ml-1">
                        of {pagination.totalPages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </Motion.div>
      </div>
    </div>
  );
}
