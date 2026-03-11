import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Bell,
  Leaf,
  Droplets,
  Thermometer,
  Calendar,
  History,
  Wind,
  FlaskConical,
  Sprout,
  PackageOpen,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { io } from "socket.io-client";
import Requests from "@/utils/Requests";
import { useUser } from "@/contexts/UserContextHook";
import { motion as Motion, AnimatePresence } from "framer-motion";
import getBaseUrl from "@/utils/GetBaseUrl";

// ─── Stat config ──────────────────────────────────────────────────────────────
const STAT_CONFIG = [
  {
    key: "nitrogen",
    label: "Nitrogen (N)",
    icon: Leaf,
    bgClass: "bg-emerald-50",
    iconClass: "text-emerald-600",
    barClass: "bg-emerald-400",
    unit: "mg/kg",
    description: "Available N in compost",
  },
  {
    key: "phosphorus",
    label: "Phosphorus (P)",
    icon: Leaf,
    bgClass: "bg-teal-50",
    iconClass: "text-teal-600",
    barClass: "bg-teal-400",
    unit: "mg/kg",
    description: "Phosphate content",
  },
  {
    key: "potassium",
    label: "Potassium (K)",
    icon: Leaf,
    bgClass: "bg-lime-50",
    iconClass: "text-lime-600",
    barClass: "bg-lime-500",
    unit: "mg/kg",
    description: "Potassium level",
  },
  {
    key: "moisture",
    label: "Moisture",
    icon: Droplets,
    bgClass: "bg-blue-50",
    iconClass: "text-blue-500",
    barClass: "bg-blue-400",
    unit: "%",
    description: "Water content",
  },
  {
    key: "temperature",
    label: "Temperature",
    icon: Thermometer,
    bgClass: "bg-orange-50",
    iconClass: "text-orange-500",
    barClass: "bg-orange-400",
    unit: "°C",
    description: "Core temperature",
  },
  {
    key: "humidity",
    label: "Humidity",
    icon: Wind,
    bgClass: "bg-sky-50",
    iconClass: "text-sky-500",
    barClass: "bg-sky-400",
    unit: "%",
    description: "Ambient humidity",
  },
];

const PRIORITY_STYLES = {
  high: {
    badge: "bg-red-500/20 text-red-200 border-red-500/30",
    dot: "bg-red-400",
  },
  medium: {
    badge: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    dot: "bg-amber-400",
  },
  low: {
    badge: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  info: {
    badge: "bg-blue-500/20 text-blue-200 border-blue-500/30",
    dot: "bg-blue-400",
  },
};

// ─── Announcements Modal ──────────────────────────────────────────────────────
function AnnouncementsModal({ announcements, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <Motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{
          background: "rgba(28, 40, 28, 0.55)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      >
        <Motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-[#2C3E2D] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white">
                  All Announcements
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {announcements.length}{" "}
                  {announcements.length === 1 ? "notice" : "notices"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
            {announcements.map((item, i) => {
              const priority = item.priority?.toLowerCase() ?? "info";
              const styles = PRIORITY_STYLES[priority] || PRIORITY_STYLES.info;
              return (
                <Motion.div
                  key={item.announcement_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`}
                      />
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${styles.badge}`}
                      >
                        {item.priority ?? "info"}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/40 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {new Date(
                        item.date_published ?? item.date_created,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-[15px] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-white/65 leading-relaxed">
                    {item.body}
                  </p>
                </Motion.div>
              );
            })}
          </div>

          {/* Modal footer */}
          <div className="px-7 py-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-[13px] font-semibold text-white/70 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ icon: EmptyIcon, title, message, action }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#EAF0E6] flex items-center justify-center mb-4 border border-[#3A4D39]/10">
        {EmptyIcon && <EmptyIcon className="w-6 h-6 text-[#3A4D39]" />}
      </div>
      <p className="text-[15px] font-bold text-[#2C3E2D] mb-1">{title}</p>
      <p className="text-[13px] text-[#9CA88F] max-w-[220px] leading-relaxed">
        {message}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </Motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ config, value, index }) {
  const {
    label,
    icon: StatIcon,
    bgClass,
    iconClass,
    barClass,
    unit,
    description,
  } = config;
  const hasValue = value !== null && value !== undefined && value !== "--";
  const numVal = parseFloat(value);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group bg-white rounded-2xl border border-[#E4DDD0] p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-[#3A4D39]/6 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${bgClass}`}>
          <StatIcon className={iconClass} style={{ width: 18, height: 18 }} />
        </div>
        {hasValue && (
          <span className="text-[10px] font-bold text-[#3A4D39] bg-[#EAF0E6] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live
          </span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-widest mb-0.5">
          {label}
        </p>
        {hasValue ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-black text-[#2C3E2D] leading-none tabular-nums">
              {value}
            </span>
            <span className="text-sm font-semibold text-[#9CA88F]">{unit}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <div className="h-7 w-16 rounded-lg bg-[#F6F3ED] animate-pulse" />
            <span className="text-[11px] text-[#C4BDB0]">No data</span>
          </div>
        )}
        <p className="text-[11px] text-[#9CA88F] mt-1">{description}</p>
      </div>

      <div className="h-1 w-full rounded-full bg-[#F0EBE3] overflow-hidden">
        <Motion.div
          className={`h-full rounded-full ${hasValue ? barClass : "bg-[#E4DDD0]"}`}
          initial={{ width: 0 }}
          animate={{
            width: hasValue ? `${Math.min(Math.max(numVal, 0), 100)}%` : "15%",
          }}
          transition={{
            delay: index * 0.06 + 0.3,
            duration: 0.6,
            ease: "easeOut",
          }}
        />
      </div>
    </Motion.div>
  );
}

// ─── Announcement Card (sidebar preview) ─────────────────────────────────────
function AnnouncementCard({ item, index }) {
  const priority = item.priority?.toLowerCase() ?? "info";
  const styles = PRIORITY_STYLES[priority] || PRIORITY_STYLES.info;

  return (
    <Motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 + 0.15 }}
      className="p-4 bg-white/5 border border-white/8 rounded-xl hover:bg-white/10 transition-colors cursor-default"
    >
      <div className="flex justify-between items-start mb-2.5">
        <span
          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${styles.badge}`}
        >
          {item.priority ?? "info"}
        </span>
        <span className="text-[10px] text-white/40 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(
            item.date_published ?? item.date_created,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
      <h3 className="font-bold text-white text-[14px] mb-1 leading-snug">
        {item.title}
      </h3>
      <p className="text-[12px] text-white/60 leading-relaxed line-clamp-2">
        {item.body}
      </p>
    </Motion.div>
  );
}

// ─── Log Row ──────────────────────────────────────────────────────────────────
function LogRow({ log, index }) {
  return (
    <Motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 + 0.1 }}
      className="hover:bg-[#F6F3ED]/60 transition-colors"
    >
      <td className="px-5 py-3.5">
        <span className="font-mono text-[11px] font-bold text-[#9CA88F] bg-[#F0EBE3] px-2 py-1 rounded-md">
          #{log.fertilizer_analytics_id.slice(0, 6).toUpperCase()}
        </span>
      </td>
      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#2C3E2D] whitespace-nowrap">
        {new Date(log.date_created).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      {[log.nitrogen, log.phosphorus, log.potassium].map((val, i) => (
        <td key={i} className="px-5 py-3.5">
          <span className="text-[13px] font-mono font-semibold text-emerald-700">
            {val ?? <span className="text-[#C4BDB0]">—</span>}
          </span>
        </td>
      ))}
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-mono font-semibold text-blue-600">
          {log.moisture ?? <span className="text-[#C4BDB0]">—</span>}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-mono font-semibold text-sky-600">
          {log.humidity ?? <span className="text-[#C4BDB0]">—</span>}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-mono font-semibold text-orange-600">
          {log.temperature ?? <span className="text-[#C4BDB0]">—</span>}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#3A4D39]/8 text-[#3A4D39] text-[12px] font-bold">
          {log.ph ?? "—"}
        </span>
      </td>
    </Motion.tr>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useUser();
  const customerId = user?.customer_id;

  const [announcements, setAnnouncements] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachineIndex, setSelectedMachineIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);

  // WebSocket connection for real-time dashboard updates
  useEffect(() => {
    if (!customerId || machines.length === 0) return;

    const baseUrl = getBaseUrl();

    const socket = io(baseUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Dashboard WebSocket connected");
      // Join dashboard rooms for all machines
      machines.forEach((machine) => {
        socket.emit("joinDashboardRoom", { machineId: machine.machine_id });
        console.log(
          `📌 Joined dashboard room for machine: ${machine.machine_id}`,
        );
      });
    });

    socket.on("dashboard_update", (payload) => {
      console.log("📡 Received dashboard update:", payload);
      // Update the machines array with the new data
      setMachines((prevMachines) => {
        const updatedMachines = [...prevMachines];
        const machineIndex = updatedMachines.findIndex(
          (m) => m.machine_id === payload.machineId,
        );
        if (machineIndex !== -1) {
          updatedMachines[machineIndex] = {
            ...updatedMachines[machineIndex],
            latestAnalytics: payload.sensors
              ? {
                  ...payload.sensors,
                  date_created: payload.date_created,
                }
              : null,
          };
        }
        return updatedMachines;
      });
    });

    socket.on("disconnect", () => {
      console.log("⚠️ Dashboard WebSocket disconnected");
    });

    socket.on("error", (error) => {
      console.error("❌ WebSocket error:", error);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("dashboard_update");
      socket.off("disconnect");
      socket.off("error");
      socket.disconnect();
    };
  }, [customerId, machines]);

  // Initial data fetch via HTTP
  useEffect(() => {
    if (!customerId) return;
    async function fetchDashboard() {
      try {
        const res = await Requests({ url: `/dashboard/${customerId}` });
        const data = res.data;
        setAnnouncements(data.announcements || []);
        setMachines(data.machines || []);
        setSelectedMachineIndex(0);
      } catch (err) {
        console.error("Failed to load dashboard", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-[#3A4D39]" />
        </Motion.div>
        <p className="text-sm font-semibold text-[#9CA88F] tracking-wide">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#2C3E2D] mb-1">
            Failed to load dashboard
          </p>
          <p className="text-[13px] text-[#9CA88F]">
            Check your connection and try again.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3A4D39] text-white text-[13px] font-semibold hover:bg-[#2C3E2D] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const hasAnnouncements = announcements.length > 0;
  const currentMachine = machines[selectedMachineIndex];
  const stats = currentMachine?.latestAnalytics || null;
  const trashLogs = currentMachine?.trashLogs || [];
  const dashboardStats = currentMachine?.stats || null;
  const hasStats =
    stats && Object.values(stats).some((v) => v !== null && v !== undefined);
  const hasLogs = trashLogs.length > 0;

  if (machines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <p className="text-[16px] font-bold text-[#2C3E2D] mb-1">
            No machines found
          </p>
          <p className="text-[13px] text-[#9CA88F]">
            You don't have any active machines. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showAnnouncementsModal && (
        <AnnouncementsModal
          announcements={announcements}
          onClose={() => setShowAnnouncementsModal(false)}
        />
      )}

      <div className="min-h-screen w-full bg-[#F6F3ED] pb-24">
        <style>{`.tabular-nums { font-variant-numeric: tabular-nums; }`}</style>

        <section className="max-w-[1440px] mx-auto px-5 md:px-8 pt-8 space-y-7">
          {/* ── Page header ─────────────────────────────────────────────── */}
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
          >
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-[0.18em] mb-1.5">
                Compost Monitor
              </p>
              <h1 className="text-[32px] md:text-[38px] font-black text-[#2C3E2D] tracking-tight leading-none">
                Dashboard
              </h1>
              <p className="text-[14px] text-[#9CA88F] font-medium mt-1.5">
                Overview of your bins' compost status and average stats
              </p>
            </div>
            <div className="flex flex-col sm:flex-col gap-3 items-start sm:items-end">
              {machines.length > 1 && (
                <select
                  value={selectedMachineIndex}
                  onChange={(e) =>
                    setSelectedMachineIndex(Number(e.target.value))
                  }
                  className="px-3 py-2 rounded-lg bg-white border border-[#E4DDD0] text-[13px] font-semibold text-[#2C3E2D] hover:border-[#3A4D39] transition-colors"
                >
                  {machines.map((machine, idx) => (
                    <option key={machine.machine_id} value={idx}>
                      Machine {idx + 1} ({machine.machine_id.substring(0, 6)})
                    </option>
                  ))}
                </select>
              )}
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-widest mb-1">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p className="text-[15px] font-bold text-[#3A4D39]">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Motion.div>

          {/* ── Top grid ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Announcements panel */}
            <Motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 bg-[#2C3E2D] text-[#ECE3CE] rounded-3xl p-6 shadow-xl shadow-[#2C3E2D]/15 flex flex-col"
              style={{ minHeight: 340 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-[15px] font-bold text-white">
                    Announcements
                  </h2>
                </div>
                {hasAnnouncements && (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                      {announcements.length}
                    </span>
                    <button
                      onClick={() => setShowAnnouncementsModal(true)}
                      className="text-[11px] font-bold text-white/50 hover:text-white flex items-center gap-0.5 transition-colors"
                    >
                      View all
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                {hasAnnouncements ? (
                  <>
                    <div className="space-y-3">
                      {announcements.slice(0, 2).map((item, i) => (
                        <AnnouncementCard
                          key={item.announcement_id}
                          item={item}
                          index={i}
                        />
                      ))}
                    </div>
                    {announcements.length > 2 && (
                      <button
                        onClick={() => setShowAnnouncementsModal(true)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-[12px] font-semibold text-white/60 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        {announcements.length - 2} more announcement
                        {announcements.length - 2 !== 1 ? "s" : ""}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/8 flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-white/30" />
                    </div>
                    <p className="text-[14px] font-semibold text-white/60 mb-1">
                      No announcements
                    </p>
                    <p className="text-[12px] text-white/30 max-w-[160px] leading-relaxed">
                      You'll see updates and alerts here when they're posted.
                    </p>
                  </div>
                )}
              </div>
            </Motion.div>

            {/* Stats grid */}
            <div className="lg:col-span-8">
              {hasStats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {STAT_CONFIG.map((cfg, i) => (
                    <StatCard
                      key={cfg.key}
                      config={cfg}
                      value={
                        stats?.[cfg.key] !== null &&
                        stats?.[cfg.key] !== undefined
                          ? Number(stats[cfg.key]).toFixed(2)
                          : "--"
                      }
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div
                  className="bg-white rounded-3xl border border-[#E4DDD0] h-full flex flex-col"
                  style={{ minHeight: 340 }}
                >
                  <EmptyState
                    icon={FlaskConical}
                    title="No sensor data yet"
                    message="Once your bins start reporting, compost analytics will appear here."
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Average Stats ──────────────────────────────────────────────── */}
          {dashboardStats && (
            <Motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-white rounded-3xl border border-[#E4DDD0] p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-[#EAF0E6] rounded-xl">
                  <FlaskConical className="w-4 h-4 text-[#3A4D39]" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#2C3E2D]">
                    Average Analytics
                  </h2>
                  <p className="text-[11px] text-[#9CA88F]">
                    Based on last {dashboardStats.totalTrashLogs} logs
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-widest mb-1">
                    Avg Nitrogen
                  </p>
                  <p className="text-[24px] font-black text-[#2C3E2D] tabular-nums">
                    {dashboardStats.avgNitrogen?.toFixed(2) || "—"}
                  </p>
                  <p className="text-[10px] text-[#9CA88F] mt-1">mg/kg</p>
                </div>
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl">
                  <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-widest mb-1">
                    Avg Phosphorus
                  </p>
                  <p className="text-[24px] font-black text-[#2C3E2D] tabular-nums">
                    {dashboardStats.avgPhosphorus?.toFixed(2) || "—"}
                  </p>
                  <p className="text-[10px] text-[#9CA88F] mt-1">mg/kg</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl sm:col-span-1 col-span-2 sm:col-span-1">
                  <p className="text-[11px] font-bold text-[#9CA88F] uppercase tracking-widest mb-1">
                    Total Logs
                  </p>
                  <p className="text-[24px] font-black text-[#2C3E2D] tabular-nums">
                    {dashboardStats.totalTrashLogs || 0}
                  </p>
                  <p className="text-[10px] text-[#9CA88F] mt-1">records</p>
                </div>
              </div>
            </Motion.div>
          )}

          {/* ── Trash logs table ─────────────────────────────────────────── */}
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="bg-white rounded-3xl border border-[#E4DDD0] overflow-hidden shadow-sm"
          >
            <div className="px-6 py-4 border-b border-[#F0EBE3] bg-[#FAFAF8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#EAF0E6] rounded-xl">
                  <History className="w-4 h-4 text-[#3A4D39]" />
                </div>
                <div>
                  <h2 className="text-[14px] font-bold text-[#2C3E2D]">
                    Recent Trash Logs
                  </h2>
                  {hasLogs && (
                    <p className="text-[11px] text-[#9CA88F]">
                      {trashLogs.length} recent{" "}
                      {trashLogs.length === 1 ? "entry" : "entries"}
                    </p>
                  )}
                </div>
              </div>
              {hasLogs && (
                <Link
                  to="/logs"
                  className="flex items-center gap-1 text-[12px] font-bold text-[#3A4D39] hover:text-[#2C3E2D] transition-colors group"
                >
                  View All
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>

            {hasLogs ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#F0EBE3]">
                      {[
                        "Log ID",
                        "Date",
                        "Nitrogen",
                        "Phosphorus",
                        "Potassium",
                        "Moisture",
                        "Humidity",
                        "Temp",
                        "pH",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[10px] font-bold text-[#9CA88F] uppercase tracking-widest whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F6F3ED]">
                    {trashLogs.map((log, i) => (
                      <LogRow
                        key={log.fertilizer_analytics_id}
                        log={log}
                        index={i}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="No trash logs recorded"
                message="Compost bin activity will be logged here once your bins start reporting data."
                action={
                  <Link to="/logs">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAF0E6] text-[#3A4D39] text-[12px] font-bold hover:bg-[#D6E6D3] transition-colors">
                      <Sprout className="w-3.5 h-3.5" />
                      Go to Logs
                    </button>
                  </Link>
                }
              />
            )}
          </Motion.div>
        </section>
      </div>
    </>
  );
}
