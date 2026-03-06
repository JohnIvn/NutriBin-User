import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Requests from "../utils/Requests";
import { useUser } from "@/contexts/UserContextHook";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Sparkles,
  ArrowRight,
  Package,
  Shield,
  RefreshCw,
} from "lucide-react";

export default function Firmware() {
  const { selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;

  const [currentVersion, setCurrentVersion] = useState(null);
  const [firmwareVersions, setFirmwareVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStage, setUpdateStage] = useState("");

  // Send progress update to backend
  const sendProgressToBackend = async (progress) => {
    try {
      await Requests({
        url: `/machine/update-progress`,
        method: "POST",
        data: {
          machineId,
          updateProgress: progress.toString(),
        },
      });
    } catch (err) {
      console.error("Failed to send progress update:", err);
    }
  };

  // Complete progress tracking on backend
  const completeProgressOnBackend = async () => {
    try {
      await Requests({
        url: `/machine/complete-progress`,
        method: "POST",
        data: {
          machineId,
        },
      });
    } catch (err) {
      console.error("Failed to complete progress:", err);
    }
  };

  // Mark update as complete on backend
  const completeUpdateOnBackend = async () => {
    try {
      await Requests({
        url: `/machine/complete-update`,
        method: "POST",
        data: {
          machineId,
        },
      });
    } catch (err) {
      console.error("Failed to mark update as complete:", err);
    }
  };

  const simulateUpdateProgress = async () => {
    const progressMap = {
      0: "Initializing update...",
      15: "Downloading firmware package...",
      35: "Verifying package integrity...",
      50: "Preparing installation...",
      65: "Installing firmware...",
      85: "Configuring system...",
      95: "Finalizing update...",
    };

    for (let progress = 0; progress < 100; progress++) {
      setUpdateProgress(progress);

      // Update stage message when hitting milestones
      Object.entries(progressMap).forEach(([milestone, message]) => {
        if (progress === parseInt(milestone)) {
          setUpdateStage(message);
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 50)); // 50ms per increment
      await sendProgressToBackend(progress);
    }
  };

  // Fetch current firmware version
  const fetchCurrentVersion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: `/machine/check-firmware/${machineId}`,
        method: "GET",
      });

      if (response.data.ok) {
        setCurrentVersion(response.data.firmwareVersion);
      } else {
        toast.error(
          response.data.error || "Failed to fetch current firmware version",
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch current firmware version");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  // Fetch available firmware updates
  const fetchAvailableUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Requests({
        url: `/machine/firmware-versions/${machineId}`,
        method: "GET",
      });

      if (response.data.ok) {
        setFirmwareVersions(response.data.versions);
        // Set the latest version as default selected
        if (response.data.versions.length > 0) {
          setSelectedVersion(response.data.versions[0].version);
        }
      } else {
        toast.error(
          response.data.error || "Failed to fetch available firmware versions",
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to fetch available firmware versions");
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  const handleAutomaticUpdate = async () => {
    setUpdating(true);

    try {
      // Step 1: Call firmware-update endpoint
      const updateResponse = await Requests({
        url: `/machine/firmware-update/${machineId}`,
        method: "POST",
      });

      if (!updateResponse.data.ok) {
        toast.error(
          updateResponse.data.error || "Failed to start firmware update",
        );
        setUpdating(false);
        return;
      }

      // Step 2: Simulate progress stages and send each to backend
      await simulateUpdateProgress();

      // Step 3: Complete progress tracking
      setUpdateProgress(100);
      setUpdateStage("Update complete!");
      await completeProgressOnBackend();

      // Step 4: Mark update as complete
      await completeUpdateOnBackend();

      toast.success(
        `Firmware updated successfully to version ${updateResponse.data.latestVersion}`,
      );

      await fetchCurrentVersion();
      await fetchAvailableUpdates();
    } catch (err) {
      toast.error(err.message || "Failed to update firmware");
    }

    setTimeout(() => {
      setUpdating(false);
      setUpdateProgress(0);
      setUpdateStage("");
    }, 1200);
  };

  const handleManualUpdate = async () => {
    if (!selectedVersion) {
      toast.error("Please select a firmware version");
      return;
    }

    setUpdating(true);

    try {
      // Step 1: Call update-firmware endpoint
      const updateResponse = await Requests({
        url: `/machine/update-firmware`,
        method: "POST",
        data: { machineId, version: selectedVersion },
      });

      if (!updateResponse.data.ok) {
        toast.error(
          updateResponse.data.error || "Failed to start firmware update",
        );
        setUpdating(false);
        return;
      }

      // Step 2: Simulate progress stages and send each to backend
      await simulateUpdateProgress();

      // Step 3: Complete progress tracking
      setUpdateProgress(100);
      setUpdateStage("Update complete!");
      await completeProgressOnBackend();

      // Step 4: Mark update as complete
      await completeUpdateOnBackend();

      toast.success(
        `Firmware updated successfully to version ${selectedVersion}`,
      );

      setCurrentVersion(selectedVersion);
      await fetchAvailableUpdates();
    } catch (err) {
      toast.error(err.message || "Failed to update firmware");
    }

    setTimeout(() => {
      setUpdating(false);
      setUpdateProgress(0);
      setUpdateStage("");
    }, 1200);
  };

  useEffect(() => {
    if (machineId) {
      fetchCurrentVersion();
      fetchAvailableUpdates();
    }
  }, [machineId, fetchCurrentVersion, fetchAvailableUpdates]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="border-l-4 border-[#3A4D39] pl-6 py-2">
            <div className="inline-block mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                <Cpu className="w-4 h-4 text-[#4F6F52]" />
                <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                  System Manager
                </span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
              Firmware Manager
            </h1>
            <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
              Keep your machine up-to-date with the latest firmware versions and
              security patches.
            </p>
          </div>
        </Motion.div>

        {/* Update Progress Overlay */}
        <AnimatePresence>
          {updating && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <Motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full border-2 border-[#4F6F52]/30"
              >
                <div className="text-center mb-6">
                  <Motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                    }}
                    className="inline-flex p-4 bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] rounded-2xl shadow-lg mb-4"
                  >
                    <Download className="w-8 h-8 text-white" />
                  </Motion.div>
                  <h3 className="text-2xl font-black text-[#3A4D39] mb-2">
                    Updating Firmware
                  </h3>
                  <p className="text-sm text-[#739072] font-medium">
                    Please do not turn off your device
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#3A4D39]">
                      {updateStage}
                    </span>
                    <span className="text-sm font-black text-[#4F6F52]">
                      {updateProgress}%
                    </span>
                  </div>
                  <div className="h-3 bg-[#ECE3CE] rounded-full overflow-hidden shadow-inner">
                    <Motion.div
                      className="h-full bg-gradient-to-r from-[#4F6F52] via-[#739072] to-[#4F6F52] rounded-full shadow-lg relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${updateProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </Motion.div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Download", threshold: 35 },
                    { label: "Verify", threshold: 50 },
                    { label: "Install", threshold: 85 },
                    { label: "Complete", threshold: 100 },
                  ].map((step, idx) => (
                    <div key={step.label} className="text-center">
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 transition-all duration-300 ${
                          updateProgress >= step.threshold
                            ? "bg-gradient-to-br from-[#4F6F52] to-[#3A4D39] shadow-lg scale-110"
                            : "bg-[#ECE3CE]"
                        }`}
                      >
                        {updateProgress >= step.threshold ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs font-bold text-[#739072]">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#739072]">
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Motion.div>
            </Motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Current Version Section */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#ECE3CE]">
                  <Package className="w-5 h-5 text-[#4F6F52]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#3A4D39]">
                    Current Firmware Version
                  </h2>
                  <p className="text-xs text-[#739072] font-semibold">
                    Installed on this device
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading && !currentVersion ? (
                <div className="flex items-center gap-3 text-[#739072]">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Loading version info...</span>
                </div>
              ) : currentVersion ? (
                <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-[#ECE3CE]/50 to-[#FAF9F6] border-2 border-[#4F6F52]/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-md border border-[#ECE3CE]">
                      <Shield className="w-6 h-6 text-[#4F6F52]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#739072] uppercase tracking-wide block mb-1">
                        Version
                      </span>
                      <span className="font-mono text-2xl font-black text-[#4F6F52]">
                        {currentVersion}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                      Active
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">
                    Unable to fetch current version
                  </span>
                </div>
              )}
            </div>
          </Motion.div>

          {/* Automatic Update Section */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-white to-[#ECE3CE]/30 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#4F6F52]/20 overflow-hidden hover:shadow-2xl hover:border-[#4F6F52]/40 transition-all duration-300"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-[#4F6F52] to-[#3A4D39] border-b-2 border-[#3A4D39]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Automatic Update
                    </h2>
                    <p className="text-xs text-white/90 font-semibold">
                      Recommended for most users
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">SMART</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-[#3A4D39] font-medium mb-6 leading-relaxed">
                Automatically update to the latest stable firmware version with
                all the newest features, security patches, and performance
                improvements.
              </p>

              <button
                onClick={handleAutomaticUpdate}
                disabled={updating}
                className="group w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F6F52] to-[#3A4D39] px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="relative flex items-center justify-center gap-3">
                  {updating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Update to Latest Version</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>
          </Motion.div>

          {/* Manual Update Section */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#ECE3CE]">
                  <Clock className="w-5 h-5 text-[#739072]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#3A4D39]">
                    Manual Version Selection
                  </h2>
                  <p className="text-xs text-[#739072] font-semibold">
                    Choose a specific firmware version
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center gap-3 text-[#739072]">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-medium">
                    Loading available versions...
                  </span>
                </div>
              ) : firmwareVersions.length > 0 ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="version-select"
                      className="text-sm font-bold text-[#3A4D39] block"
                    >
                      Select Firmware Version:
                    </label>
                    <select
                      id="version-select"
                      value={selectedVersion || ""}
                      onChange={(e) => setSelectedVersion(e.target.value)}
                      disabled={updating}
                      className="w-full rounded-xl border-2 border-[#ECE3CE] bg-white px-4 py-3 text-sm font-semibold text-[#3A4D39] focus:border-[#4F6F52] focus:outline-none focus:ring-4 focus:ring-[#4F6F52]/10 disabled:cursor-not-allowed disabled:bg-[#FAF9F6] disabled:opacity-50 transition-all duration-200"
                    >
                      <option value="">-- Choose a version --</option>
                      {firmwareVersions.map((fw, index) => (
                        <option key={index} value={fw.version}>
                          {fw.version} -{" "}
                          {new Date(fw.release_date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display selected version details */}
                  <AnimatePresence mode="wait">
                    {selectedVersion && (
                      <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 rounded-2xl border-2 border-[#ECE3CE] bg-gradient-to-br from-[#FAF9F6] to-[#ECE3CE]/20 p-5 overflow-hidden"
                      >
                        {(() => {
                          const selected = firmwareVersions.find(
                            (fw) => fw.version === selectedVersion,
                          );
                          return selected ? (
                            <>
                              <div className="flex items-center justify-between pb-3 border-b border-[#ECE3CE]">
                                <div>
                                  <span className="text-xs font-bold uppercase text-[#739072] block mb-1">
                                    Version
                                  </span>
                                  <span className="text-lg font-black text-[#3A4D39] font-mono">
                                    {selected.version}
                                  </span>
                                </div>
                                {selected.release_date && (
                                  <div className="text-right">
                                    <span className="text-xs font-bold uppercase text-[#739072] block mb-1">
                                      Released
                                    </span>
                                    <span className="text-sm font-bold text-[#3A4D39]">
                                      {new Date(
                                        selected.release_date,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {selected.release_notes && (
                                <div>
                                  <span className="text-xs font-bold uppercase text-[#739072] block mb-2">
                                    Release Notes
                                  </span>
                                  <div className="max-h-36 overflow-y-auto text-sm leading-relaxed text-[#3A4D39] font-medium bg-white rounded-xl p-4 border border-[#ECE3CE]">
                                    {selected.release_notes}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : null;
                        })()}
                      </Motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleManualUpdate}
                    disabled={updating || !selectedVersion}
                    className="group w-full relative overflow-hidden rounded-2xl bg-[#3A4D39] px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-[#2d3b2c]"
                  >
                    <div className="relative flex items-center justify-center gap-3">
                      {updating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Installing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Install Selected Version</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-[#FAF9F6] border-2 border-[#ECE3CE] rounded-xl">
                  <AlertCircle className="w-5 h-5 text-[#739072]" />
                  <span className="text-sm font-semibold text-[#739072]">
                    No firmware versions available
                  </span>
                </div>
              )}
            </div>
          </Motion.div>
        </div>
      </div>

      {/* Custom shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
