import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Video,
  History,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Camera,
  Radio,
  Play,
  RefreshCw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import getBaseUrl from "@/utils/GetBaseUrl";
import { motion as Motion } from "framer-motion";

export default function Cameras() {
  const [loading, setLoading] = useState(true);
  const { user, selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;
  const customerId = user?.customer_id;
  const [data, setData] = useState([]);
  const [page] = useState(1);
  const [frame, setFrame] = useState(null);
  const [feedActive, setFeedActive] = useState(false);

  useEffect(() => {
    if (!machineId || !customerId) return;

    const baseUrl = getBaseUrl();
    const socket = io(`${baseUrl}/videostream`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      auth: {
        machineId,
        customerId,
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to video stream");
      console.log("Auth:", { machineId, customerId });
      setFeedActive(true);
    });

    socket.on("stream", (data) => {
      console.log(
        "📹 Received stream frame, size:",
        data?.byteLength || data?.length || "unknown",
      );
      const blob = new Blob([data], { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);

      setFrame((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return url;
      });
      setFeedActive(true);
    });

    socket.on("detection-update", (detection) => {
      console.log("Live detection received:", detection);
      setData((prev) => [
        {
          id: Date.now().toString(),
          classification: detection.content,
          date_created: detection.timestamp,
          details: `Confidence: ${Math.round(detection.confidence * 100)}%`,
        },
        ...prev.slice(0, 9), // Keep last 10
      ]);
    });

    socket.on("stream-status", ({ active }) => {
      console.log(
        "📡 Stream status update:",
        active ? "ACTIVE ✅" : "OFFLINE ❌",
      );
      setFeedActive(active);
      if (!active) {
        setFrame((prev) => {
          if (prev && prev.startsWith("blob:")) {
            URL.revokeObjectURL(prev);
          }
          return null;
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from video stream");
      setFeedActive(false);
      setFrame((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    });

    return () => {
      socket.disconnect();
      setFrame((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
    };
  }, [machineId, customerId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!customerId) return;

    const fetchLogs = async () => {
      try {
        const res = await Requests({
          url: `/camera-logs/${customerId}`,
          method: "GET",
          params: {
            machineId: machineId,
          },
        });

        if (res.data?.ok) {
          setData(res.data.logs || []);
          console.log(res.data.logs);
        } else {
          throw new Error("Failed to load camera logs");
        }
      } catch (err) {
        console.error("Camera logs error:", err);
      }
    };

    fetchLogs();
  }, [customerId, page]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
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
                  <Camera className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Live Monitoring
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Camera Feeds
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Real-time internal machine monitoring and AI-powered anomaly
                detection system.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* Recording Status */}
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
                    <Activity className="w-6 h-6 text-green-600" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </Motion.div>
                  <span className="font-bold text-[#3A4D39] text-sm sm:text-base">
                    System Recording
                  </span>
                </div>
              </div>

              {/* Connection Status */}
              <div
                className={`px-4 py-2 rounded-xl border-2 transition-colors duration-300 ${
                  feedActive
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {feedActive ? (
                    <>
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-800">
                        Feed Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-bold text-red-800">
                        Feed Disconnected
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Main Content */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Camera Card */}
          <div className="flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {/* Card Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <Video className="w-5 h-5 text-[#4F6F52]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3A4D39]">
                      Internal Cam 01
                    </h2>
                    <p className="text-xs text-[#739072] font-medium">
                      Sorting Chamber • Real-time Analysis
                    </p>
                  </div>
                </div>

                {/* Stream Info */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white rounded-lg border border-[#ECE3CE] flex items-center gap-2">
                    <Radio
                      className={`w-3.5 h-3.5 ${feedActive ? "text-green-600" : "text-gray-400"}`}
                    />
                    <span className="text-xs font-bold text-[#3A4D39]">
                      {feedActive ? "Streaming" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black group">
              {!feedActive ? (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white"
                >
                  <div className="flex flex-col items-center gap-6 text-center p-8">
                    <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                      <WifiOff className="w-16 h-16 text-white/40" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight">
                        Feed Offline
                      </h3>
                      <p className="text-sm text-white/50 max-w-md">
                        The camera is currently disconnected or not transmitting
                        data. Please check the connection.
                      </p>
                    </div>
                  </div>
                </Motion.div>
              ) : !frame ? (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw className="w-10 h-10 text-white/60" />
                    </Motion.div>
                    <span className="text-sm font-bold tracking-widest uppercase text-white/70">
                      Initializing Stream...
                    </span>
                    <p className="text-xs text-white/40">
                      Establishing connection to camera
                    </p>
                  </div>
                </Motion.div>
              ) : (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <img
                    src={frame}
                    alt="Camera Stream"
                    className="w-full h-full object-contain bg-black"
                  />

                  {/* Live Badge */}
                  <Motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 left-4 px-4 py-2 bg-red-600/95 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2.5 shadow-xl backdrop-blur-sm border border-red-500"
                  >
                    <Motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-white"
                    />
                    Live Feed
                  </Motion.div>

                  {/* Connection Quality */}
                  <Motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 right-4 flex gap-2"
                  >
                    <div className="px-4 py-2 bg-black/60 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 backdrop-blur-md border border-white/10">
                      <Wifi className="w-4 h-4 text-green-400" />
                      <span>Stable</span>
                    </div>
                  </Motion.div>

                  {/* Bottom Overlay Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Live Stream Active
                        </span>
                      </div>
                      <span className="text-xs font-mono text-white/60">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </Motion.div>
              )}
            </div>

            {/* Detection Logs */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#4F6F52]/10 rounded-xl">
                    <History className="w-5 h-5 text-[#4F6F52]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#3A4D39] uppercase tracking-wide">
                      Detection Log
                    </h3>
                    <p className="text-xs text-[#739072] font-medium">
                      AI-powered anomaly tracking
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-[#ECE3CE]/60 border border-[#3A4D39]/10 rounded-full">
                  <span className="text-xs font-black text-[#739072]">
                    {data.length} Records
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#3A4D39]/10 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-[#3A4D39] to-[#4F6F52]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="text-white font-black text-xs uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-white font-black text-xs uppercase tracking-wider">
                        Time
                      </TableHead>
                      <TableHead className="text-white font-black text-xs uppercase tracking-wider">
                        Detection Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <Motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                              }}
                            >
                              <RefreshCw className="w-8 h-8 text-[#4F6F52]" />
                            </Motion.div>
                            <span className="text-sm text-[#739072] font-medium">
                              Loading detection logs...
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="p-6 bg-[#ECE3CE]/40 rounded-2xl">
                              <History className="w-10 h-10 text-[#739072]/40" />
                            </div>
                            <div className="text-center">
                              <h4 className="text-base font-bold text-[#3A4D39] mb-1">
                                No Detection Logs
                              </h4>
                              <p className="text-sm text-[#739072]">
                                No anomalies or detections have been recorded
                                yet
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((log, index) => {
                        const date = new Date(log.date_created);

                        return (
                          <Motion.tr
                            key={log.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="hover:bg-[#FAF9F6] border-b border-[#ECE3CE]/50 transition-colors group"
                          >
                            <TableCell className="font-mono text-sm text-[#4F6F52] font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#4F6F52] opacity-0 group-hover:opacity-100 transition-opacity" />
                                {date.toISOString().split("T")[0]}
                              </div>
                            </TableCell>

                            <TableCell className="font-mono text-sm text-[#4F6F52] font-medium">
                              {date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </TableCell>

                            <TableCell>
                              {log.details ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold border-2 border-orange-200">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  {log.details}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border-2 border-green-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  No Anomaly Detected
                                </span>
                              )}
                            </TableCell>
                          </Motion.tr>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
