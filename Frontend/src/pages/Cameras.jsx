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
  MoreVertical,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import getBaseUrl from "@/utils/GetBaseUrl";

export default function Cameras() {
  const [ loading, setLoading ] = useState(true);
  const { user, selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;
  const customerId = user?.customer_id;
  const [data, setData] = useState([]);
  const [page] = useState(1);
  const [frame, setFrame] = useState(null);
  const [feedActive, setFeedActive] = useState(false);

  useEffect(() => {
    const baseUrl = getBaseUrl();
    const socket = io(`${baseUrl}/videostream`, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Connected to video stream");
      setFeedActive(true);
    });

    socket.on("stream", (data) => {
      console.log("Received stream frame");
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

    socket.on("stream-status", ({ active }) => {
      console.log("Stream status update:", active);
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
  }, []);

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
            machineId: machineId
          }
        });

        if (res.data?.ok) {
          setData(res.data.logs || []);
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
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-400 mx-auto px-6 pt-8 space-y-8">
        {/* header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              Camera Feeds
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Internal machine monitoring and anomaly detection logs.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600 animate-pulse" />
              <span className="font-bold text-[#3A4D39] text-sm">
                System Recording
              </span>
            </div>
          </div>
        </div>

        {/* main grid content */}
        <div className="grid grid-cols-1 gap-8 pb-20">
          {/* camera 1 */}
          <div className="flex flex-col bg-white rounded-3xl shadow-lg shadow-[#3A4D39]/5 border border-[#3A4D39]/10 overflow-hidden">
            {/* card header */}
            <div className="px-6 py-4 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#3A4D39]">
                    Internal Cam 01
                  </h2>
                  <p className="text-xs text-[#739072]">Sorting Chamber</p>
                </div>
              </div>
            </div>

            {/* video player */}
            <div className="relative w-full aspect-video bg-black group font-sans">
              {!feedActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-[#ECE3CE]/50 gap-3">
                  <div className="flex flex-col items-center gap-4">
                    <WifiOff className="w-10 h-10 text-[#ECE3CE]/30" />
                    <span className="text-sm font-mono tracking-widest uppercase">
                      Feed Offline
                    </span>
                    <p className="text-xs text-[#ECE3CE]/20 max-w-50 text-center">
                      The camera is currently disconnected or not transmitting
                      data.
                    </p>
                  </div>
                </div>
              ) : !frame ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-[#ECE3CE]/50 gap-3">
                  <div className="w-8 h-8 border-2 border-[#ECE3CE]/30 border-t-[#ECE3CE] rounded-full animate-spin" />
                  <span className="text-sm font-mono tracking-widest uppercase">
                    Initializing Stream...
                  </span>
                </div>
              ) : (
                <>
                  <img
                    src={frame}
                    alt="Camera Stream"
                    className="w-full h-full object-contain bg-black"
                  />
                  {/* live Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-2 shadow-lg backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />{" "}
                    Live Feed
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-2 backdrop-blur-sm">
                      <Wifi className="w-3 h-3 text-green-400" />
                      Stable
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* logs table */}
            <div className="flex-1 p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-[#739072]" />
                <h3 className="text-sm font-bold text-[#3A4D39] uppercase tracking-wide">
                  Detection Log
                </h3>
              </div>

              <div className="rounded-xl border border-[#ECE3CE] overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#3A4D39]">
                    <TableRow className="hover:bg-[#3A4D39] border-none">
                      <TableHead className="text-[#ECE3CE] font-bold w-30">
                        Date
                      </TableHead>
                      <TableHead className="text-[#ECE3CE] font-bold w-25">
                        Time
                      </TableHead>
                      <TableHead className="text-[#ECE3CE] font-bold">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <div className="flex items-center justify-center py-10">
                            <div className="w-6 h-6 border-2 border-[#3A4D39]/30 border-t-[#3A4D39] rounded-full animate-spin" />
                            <span className="ml-3 text-sm text-[#739072] font-medium">
                              Loading logs...
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : data.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-10 text-[#739072]"
                        >
                          No camera logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((log) => {
                        const date = new Date(log.date_created);

                        return (
                          <TableRow
                            key={log.id}
                            className="hover:bg-[#FAF9F6] border-b border-[#ECE3CE]"
                          >
                            <TableCell className="font-mono text-sm text-[#4F6F52]">
                              {date.toISOString().split("T")[0]}
                            </TableCell>

                            <TableCell className="font-mono text-sm text-[#4F6F52]">
                              {date.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>

                            <TableCell>
                              {log.classification ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                                  <AlertCircle className="w-3 h-3" />
                                  {log.classification}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                  <CheckCircle2 className="w-3 h-3" />
                                  No Anomaly
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
