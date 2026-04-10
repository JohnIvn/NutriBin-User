import React, { useEffect, useState, useRef } from "react";
import ModuleCard from "@/components/ui/ModuleCard";
import { toast } from "sonner";
import {
  RefreshCw,
  Cpu,
  Fan,
  Eye,
  Droplets,
  Wind,
  Activity,
  Flame,
  Cog,
  CheckCircle2,
  AlertTriangle,
  Server,
  Wrench,
  Wifi,
  X,
  Upload,
  RotateCcw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import getBaseUrl from "@/utils/GetBaseUrl";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "info", label: "Machine Info & Settings", icon: Server },
  { id: "modules", label: "Module Diagnostics", icon: Cpu },
];

export default function Modules() {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [isRestartLoading, setIsRestartLoading] = useState(false);
  const { user, selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;
  const customerId = user?.customer_id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const socketRef = useRef(null);

  // ─────────────────────────────
  // Fetch modules initially
  // ─────────────────────────────
  useEffect(() => {
    if (!machineId) return;
    async function fetchModules() {
      try {
        const res = await Requests({ url: `/module-analytics/${machineId}` });
        const data = res.data;
        if (data.ok) {
          setModules(data.data.modules);
          console.log(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, [machineId]);

  // ─────────────────────────────
  // WebSocket
  // ─────────────────────────────
  useEffect(() => {
    if (!machineId) return;
    const socket = io(getBaseUrl(), { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("joinModuleRoom", { machineId });
    socket.on("module_analytics_update", (payload) =>
      setModules(payload.modules),
    );
    socket.on("connect_error", (err) => console.error("Socket error:", err));
    return () => socket.disconnect();
  }, [machineId]);

  // ─────────────────────────────
  // Restart Machine
  // ─────────────────────────────
  const restartMachine = async () => {
    try {
      setIsRestartLoading(true);
      const espSensorsIp = "192.168.1.184";
      const espServoIp = "192.168.1.185";

      const results = await Promise.allSettled(
        [`http://${espSensorsIp}/restart`, `http://${espServoIp}/restart`].map(
          (url) =>
            fetch(url, { method: "GET" })
              .then((res) => ({ status: res.status, ok: res.status === 200 }))
              .catch((err) => ({ status: 408, ok: false, error: err.message })),
        ),
      );

      const atLeastOneOk = results.some(
        (r) => r.status === "fulfilled" && r.value.ok === true,
      );

      if (atLeastOneOk) {
        toast.success("Restart command sent (skipped offline nodes)");
      } else {
        toast.error("All nodes offline. Check your Wi-Fi.");
      }
    } catch (err) {
      toast.error("Connection failed: Ensure you're on the same Wi-Fi");
      console.error("Restart error:", err);
    } finally {
      setIsRestartLoading(false);
    }
  };

  const handleCardClick = (moduleName) => {
    setActiveModule(moduleName);
    setIsModalOpen(true);
  };

  const confirmRepair = async () => {
    if (!machineId || !customerId || !activeModule) return;
    setIsSubmitting(true);
    try {
      const res = await Requests({
        method: "POST",
        url: "/module-analytics/repair",
        data: { machineId, customerId, module: activeModule },
      });
      if (res.data?.ok) {
        toast.success(`Repair request for ${activeModule} submitted`);
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to request repair");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModuleStats = () => {
    if (!modules) return { total: 0, online: 0, offline: 0 };
    const moduleValues = Object.values(modules);
    const total = moduleValues.length - 5;
    const offline = moduleValues.filter(
      (val) => val === true || val === 1,
    ).length;
    return { total, online: total - offline, offline };
  };

  const stats = getModuleStats();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      {/* ─── Repair Confirmation Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#3A4D39]/40 backdrop-blur-sm"
            />
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-[#3A4D39]/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-amber-100 rounded-2xl">
                  <Wrench className="w-6 h-6 text-amber-700" />
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <h3 className="text-2xl font-black text-[#3A4D39] mb-2">
                Confirm Repair
              </h3>
              <p className="text-[#739072] mb-6">
                Are you sure you want to request a repair for{" "}
                <span className="font-bold text-[#4F6F52] underline">
                  {activeModule}
                </span>
                ? This will alert the maintenance team immediately.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  disabled={isSubmitting}
                  onClick={confirmRepair}
                  className="w-full py-4 bg-[#3A4D39] text-white font-bold rounded-2xl hover:bg-[#4F6F52] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3A4D39]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Confirm Request"
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ─── Page Header ─── */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                  <Server className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Hardware Diagnostics
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Bin Status and Settings
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl mb-3">
                Real-time hardware status and settings.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">
                  Click any offline module to submit a repair request
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="px-5 py-3 bg-white border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5">
                <div className="flex items-center gap-2.5">
                  <Motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <Activity className="w-6 h-6 text-[#4F6F52]" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </Motion.div>
                  <span className="font-bold text-[#3A4D39] text-sm sm:text-base">
                    Diagnostic Running
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-white border border-[#4F6F52]/20 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Online
                  </div>
                  <div className="text-lg font-black text-green-600">
                    {stats.online}
                  </div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white border border-red-200 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Offline
                  </div>
                  <div className="text-lg font-black text-red-600">
                    {stats.offline}
                  </div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white border border-[#3A4D39]/20 rounded-xl">
                  <div className="text-xs text-[#739072] font-medium">
                    Total
                  </div>
                  <div className="text-lg font-black text-[#3A4D39]">
                    {stats.total}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/80 backdrop-blur-sm border border-[#3A4D39]/10 rounded-2xl shadow-sm w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-lg shadow-[#3A4D39]/20"
                    : "text-[#739072] hover:text-[#3A4D39] hover:bg-[#ECE3CE]/40"
                }`}
              >
                {isActive && (
                  <Motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#3A4D39] to-[#4F6F52] rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Loading State (inline, body-scoped) ─── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-[#4F6F52]" />
            </Motion.div>
            <p className="text-sm font-semibold text-[#739072] animate-pulse">
              Loading module data...
            </p>
          </div>
        )}

        {/* ─── Tab Panels ─── */}
        {!loading && (
          <AnimatePresence mode="wait">
            {/* ══ Machine Info & Settings ══ */}
            {activeTab === "info" && (
              <Motion.div
                key="info"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Machine Info Card */}
                <div className="bg-white/90 backdrop-blur-md border border-[#3A4D39]/10 rounded-3xl p-6 shadow-lg">
                  <h2 className="text-2xl font-black text-[#3A4D39] mb-4">
                    Machine Info
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100/60 rounded-xl border border-purple-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Server className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Machine ID
                        </p>
                        <p className="text-xs font-medium text-[#739072] truncate">
                          {modules?.id || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/60 rounded-xl border border-green-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Status
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/60 rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Server className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Firmware
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.firmware_version || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-xl border border-amber-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Cog className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Target FW
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.target_firmware_version || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100/60 rounded-xl border border-pink-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Activity className="w-5 h-5 text-pink-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Update Status
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.update_status || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/60 rounded-xl border border-cyan-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <RefreshCw className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Last Update
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.last_update_attempt
                            ? new Date(
                                modules.last_update_attempt,
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100/60 rounded-xl border border-orange-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Eye className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          Last Seen
                        </p>
                        <p className="text-xs font-medium text-[#739072]">
                          {modules?.last_seen
                            ? new Date(modules.last_seen).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-sky-50 to-sky-100/60 rounded-xl border border-sky-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Wifi className="w-5 h-5 text-sky-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          WiFi SSID
                        </p>
                        <p className="text-xs font-medium text-[#739072] truncate">
                          {modules?.wifi_ssid || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-teal-100/60 rounded-xl border border-teal-200 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                      <Wifi className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-black text-[#3A4D39]">
                          IP Address
                        </p>
                        <p className="text-xs font-medium text-[#739072] font-mono">
                          {modules?.ip_address || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Machine Settings Card ─── */}
                <div className="bg-white/90 backdrop-blur-md border border-[#3A4D39]/10 rounded-3xl p-6 shadow-lg">
                  <h2 className="text-2xl font-black text-[#3A4D39] mb-2">
                    Machine Settings
                  </h2>
                  <p className="text-sm text-[#739072] font-medium mb-6">
                    Manage firmware updates and machine operations.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Firmware Update Button */}
                    <Motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/firmware")}
                      className="group flex items-center gap-4 p-5 bg-gradient-to-br from-[#3A4D39]/5 to-[#4F6F52]/10 border-2 border-[#3A4D39]/15 rounded-2xl hover:border-[#4F6F52]/40 hover:shadow-xl hover:shadow-[#3A4D39]/10 transition-all duration-300"
                    >
                      <div className="p-3 bg-gradient-to-br from-[#3A4D39] to-[#4F6F52] rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 shrink-0">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-[#3A4D39] group-hover:text-[#4F6F52] transition-colors">
                          Firmware Update
                        </p>
                        <p className="text-xs text-[#739072] font-medium mt-0.5">
                          Upload & manage versions
                        </p>
                      </div>
                    </Motion.button>

                    {/* Restart Machine Button */}
                    <Motion.button
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={restartMachine}
                      disabled={isRestartLoading}
                      className="group flex items-center gap-4 p-5 bg-gradient-to-br from-red-50 to-red-100/60 border-2 border-red-200/60 rounded-2xl hover:border-red-300 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 shrink-0">
                        {isRestartLoading ? (
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <RotateCcw className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-red-700 group-hover:text-red-800 transition-colors">
                          {isRestartLoading
                            ? "Restarting..."
                            : "Restart Machine"}
                        </p>
                        <p className="text-xs text-red-500 font-medium mt-0.5">
                          Restart the machine safely
                        </p>
                      </div>
                    </Motion.button>
                  </div>
                </div>
              </Motion.div>
            )}

            {/* ══ Module Diagnostics ══ */}
            {activeTab === "modules" && (
              <Motion.div
                key="modules"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {/* ── Controllers ── */}
                <Motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-[#3A4D39]/10 to-[#4F6F52]/10 rounded-xl shadow-sm">
                        <Cpu className="w-5 h-5 text-[#3A4D39]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Controllers
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Processing Units
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                      <span className="text-xs font-black text-[#739072]">
                        4 Units
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
                    <ModuleCard
                      title="Arduino Q"
                      icon={Cpu}
                      offline={modules?.arduino_q}
                      subtext="Main Logic Unit"
                      onClick={() =>
                        handleCardClick("Repair need for Arduino Q")
                      }
                    />
                    <ModuleCard
                      title="ESP32 Filter"
                      icon={Cpu}
                      offline={modules?.esp32_filter}
                      subtext="Filterings"
                      onClick={() =>
                        handleCardClick("Repair need for ESP32 Filter")
                      }
                    />
                    <ModuleCard
                      title="ESP32 Sensors"
                      icon={Cpu}
                      offline={modules?.esp32_sensors}
                      subtext="Processing Unit"
                      onClick={() =>
                        handleCardClick("Repair need for ESP32 sensors")
                      }
                    />
                    <ModuleCard
                      title="ESP32 Servo"
                      icon={Cpu}
                      offline={modules?.esp32_servo}
                      subtext="Ventilation Control"
                      onClick={() =>
                        handleCardClick("Repair need for ESP32 Servo")
                      }
                    />
                  </div>
                </Motion.div>

                {/* ── Actuators ── */}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm">
                        <Cog className="w-5 h-5 text-orange-700" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Actuators
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Mechanical Systems
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                      <span className="text-xs font-black text-[#739072]">
                        5 Units
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
                    <ModuleCard
                      title="Servo A"
                      icon={Cog}
                      offline={modules?.servo_a}
                      subtext="Gate Control"
                      onClick={() => handleCardClick("Repair need for Servo A")}
                    />
                    <ModuleCard
                      title="Servo B"
                      icon={Cog}
                      offline={modules?.servo_b}
                      subtext="Valve Control"
                      onClick={() => handleCardClick("Repair need for Servo B")}
                    />
                    <ModuleCard
                      title="Servo Diverter"
                      icon={Cog}
                      offline={modules?.servo_mixer}
                      subtext="Mixing of materials"
                      onClick={() =>
                        handleCardClick("Repair need for Servo Mixer")
                      }
                    />
                    <ModuleCard
                      title="Grinder Motor"
                      icon={Cog}
                      offline={modules?.grinder}
                      subtext="High Torque Grinder"
                      onClick={() => handleCardClick("Repair need for Grinder")}
                    />
                    <ModuleCard
                      title="Exhaust Fan"
                      icon={Fan}
                      offline={modules?.exhaust}
                      subtext="Air Out"
                      onClick={() =>
                        handleCardClick("Repair need for Exhaust Fan")
                      }
                    />
                  </div>
                </Motion.div>

                {/* ── Sensors ── */}
                <Motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                        <Eye className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#3A4D39]">
                          Sensors
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Data Collection
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                      <span className="text-xs font-black text-[#739072]">
                        11 Units
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-xl border border-[#3A4D39]/10 space-y-3 hover:shadow-2xl transition-shadow duration-300">
                    <ModuleCard
                      title="Camera"
                      icon={Eye}
                      offline={modules?.camera}
                      subtext="Input Monitoring"
                      onClick={() => handleCardClick("Repair need for Camera")}
                    />
                    <ModuleCard
                      title="Humidity Sensor"
                      icon={Droplets}
                      offline={modules?.humidity}
                      subtext="DHT22"
                      onClick={() =>
                        handleCardClick("Repair need for Humidity Sensor")
                      }
                    />
                    <ModuleCard
                      title="Methane Sensor"
                      icon={Wind}
                      offline={modules?.methane}
                      subtext="MQ-4 Gas Sensor"
                      onClick={() =>
                        handleCardClick("Repair need for Methane Sensor")
                      }
                    />
                    <ModuleCard
                      title="Carbon Monoxide"
                      icon={AlertTriangle}
                      offline={modules?.carbon_monoxide}
                      subtext="MQ-7 CO Sensor"
                      onClick={() =>
                        handleCardClick(
                          "Repair need for Carbon Monoxide Sensor",
                        )
                      }
                    />
                    <ModuleCard
                      title="Air Quality"
                      icon={Wind}
                      offline={modules?.air_quality}
                      subtext="MQ-135"
                      onClick={() =>
                        handleCardClick("Repair need for Air Quality Sensor")
                      }
                    />
                    <ModuleCard
                      title="Combustible Gas"
                      icon={Flame}
                      offline={modules?.combustible_gasses}
                      subtext="MQ-2 Sensor"
                      onClick={() =>
                        handleCardClick(
                          "Repair need for Combustible Gassses Sensor",
                        )
                      }
                    />
                    <ModuleCard
                      title="NPK Sensor"
                      icon={Activity}
                      offline={modules?.npk}
                      subtext="Soil Analysis"
                      onClick={() =>
                        handleCardClick("Repair need for NPK Sensor")
                      }
                    />
                    <ModuleCard
                      title="Moisture Sensor"
                      icon={Droplets}
                      offline={modules?.moisture}
                      subtext="Capacitive Probe"
                      onClick={() =>
                        handleCardClick("Repair need for Moisture Sensor")
                      }
                    />
                    <ModuleCard
                      title="Reed Switch"
                      icon={CheckCircle2}
                      offline={modules?.reed}
                      subtext="Door / Lid Detection"
                      onClick={() =>
                        handleCardClick("Repair need for Reed Switch Sensor")
                      }
                    />
                    <ModuleCard
                      title="Ultrasonic"
                      icon={Activity}
                      offline={modules?.ultrasonic}
                      subtext="Distance Measurement"
                      onClick={() =>
                        handleCardClick("Repair need for Ultrasonic Sensor")
                      }
                    />
                    <ModuleCard
                      title="Weight Sensor"
                      icon={Activity}
                      offline={modules?.weight}
                      subtext="Load Cell"
                      onClick={() =>
                        handleCardClick("Repair need for Weight Sensor")
                      }
                    />
                  </div>
                </Motion.div>
              </Motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
