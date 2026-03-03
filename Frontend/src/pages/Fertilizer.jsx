import React, { useEffect, useState, useRef } from "react";
import { LabelList, Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import HumidityBar from "@/components/ui/HumidityBar";
import MoistureBar from "@/components/ui/MoistureBar";
import GasFlag from "@/components/ui/GasFlag";
import {
  Wind,
  Droplets,
  ThermometerSun,
  Leaf,
  CheckCircle2,
  Zap,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { io } from "socket.io-client";
import { motion as Motion } from "framer-motion";
import getBaseUrl from "@/utils/GetBaseUrl";

export default function Fertilizer() {
  const [tempUnit, setTempUnit] = useState("C");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasData = analytics !== null;

  const { user, selectedMachine } = useUser();
  const customerId = user?.customer_id;
  const machineId = selectedMachine?.machine_id;
  const socketRef = useRef(null);

  useEffect(() => {
    if (!customerId || !machineId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchInitialAnalytics = async () => {
      try {
        setLoading(true);

        const res = await Requests({
          url: `/fertilizer-analytics/${customerId}`,
          params: { machineId },
        });

        if (isMounted && res.data.ok && res.data.analytics.length > 0) {
          setAnalytics(res.data.analytics[0]);
        } else if (isMounted) {
          setAnalytics(null);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setAnalytics(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialAnalytics();

    const baseUrl = getBaseUrl();

    const socket = io(baseUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to fertilizer realtime");

      socket.emit("joinFertilizerRoom", {
        customerId,
        machineId,
      });
    });

    socket.on("fertilizer_analytics_update", (data) => {
      console.log("📡 New realtime fertilizer data:", data);

      setAnalytics((prev) => ({
        ...prev,
        ...data,
      }));
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from realtime");
    });

    return () => {
      isMounted = false;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [customerId, machineId]);

  const convertTemp = (celsius, unit) => {
    if (!celsius) return "-";
    const temp = parseFloat(celsius);
    if (unit === "F") return ((temp * 9) / 5 + 32).toFixed(1);
    if (unit === "K") return (temp + 273.15).toFixed(1);
    return temp.toFixed(1);
  };

  const displayTemp = analytics
    ? convertTemp(analytics.temperature, tempUnit)
    : "-";

  const pieChartData = analytics
    ? [
        {
          browser: "nitrogen",
          visitors: parseFloat(analytics.nitrogen || 0),
          fill: "#4F6F52",
        },
        {
          browser: "phosphorus",
          visitors: parseFloat(analytics.phosphorus || 0),
          fill: "#5C8D89",
        },
        {
          browser: "potassium",
          visitors: parseFloat(analytics.potassium || 0),
          fill: "#D4A373",
        },
      ]
    : [];

  const total = Number(
    pieChartData.reduce((sum, entry) => sum + entry.visitors, 0).toFixed(1),
  );

  const chartConfig = {
    nitrogen: { label: "Nitrogen", color: "#4F6F52" },
    phosphorus: { label: "Phosphorus", color: "#5C8D89" },
    potassium: { label: "Potassium", color: "#D4A373" },
  };

  const GAS_DATA = analytics
    ? [
        {
          type: "methane",
          percentage: parseFloat(analytics.methane || 0),
        },
        {
          type: "air quality",
          percentage: parseFloat(analytics.air_quality || 0),
        },
        {
          type: "carbon monoxide",
          percentage: parseFloat(analytics.carbon_monoxide || 0),
        },
        {
          type: "combustible gases",
          percentage: parseFloat(analytics.combustible_gases || 0),
        },
        {
          type: "ph level",
          percentage: parseFloat(analytics.ph || 0),
        },
        {
          type: "weight",
          percentage: parseFloat(analytics.weight_kg || 0),
        },
        {
          type: "reed",
          percentage: parseFloat(analytics.reed_switch || 0),
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] gap-4">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-[#4F6F52]" />
        </Motion.div>
        <p className="text-sm font-semibold text-[#739072]">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
                  <Leaf className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Live Analytics
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                Fertilizer Analytics
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Real-time nutrient composition and environmental monitoring for
                optimal soil health.
              </p>
            </div>

            {hasData && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="px-5 py-3 bg-white border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <CheckCircle2 className="w-6 h-6 text-[#4F6F52]" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <span className="font-bold text-[#3A4D39] text-sm sm:text-base">
                    All Systems Optimal
                  </span>
                </div>
              </Motion.div>
            )}
          </div>
        </Motion.div>

        {!hasData && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-[#3A4D39]/20 rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <Motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
              className="p-6 bg-gradient-to-br from-[#ECE3CE]/60 to-[#4F6F52]/10 rounded-2xl mb-6"
            >
              <Leaf className="w-12 h-12 text-[#4F6F52]" />
            </Motion.div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#3A4D39] mb-3">
              No Fertilizer Data Yet
            </h3>

            <p className="text-[#739072] text-base sm:text-lg max-w-md leading-relaxed mb-6">
              This machine hasn't sent any fertilizer or environmental readings
              yet. Once the system starts processing data, analytics will appear
              here automatically.
            </p>

            <div className="flex items-center gap-2 px-4 py-2 bg-[#ECE3CE]/30 rounded-full">
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-[#739072]" />
              </Motion.div>
              <span className="text-sm text-[#739072] font-semibold">
                Waiting for sensor input…
              </span>
            </div>
          </Motion.div>
        )}

        {hasData && (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* NPK Pie Chart */}
              {analytics && (
                <Motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:col-span-5 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl hover:border-[#4F6F52]/30 transition-all duration-300"
                >
                  <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#ECE3CE]">
                          <Leaf className="w-5 h-5 text-[#4F6F52]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-[#3A4D39]">
                            NPK Composition
                          </h2>
                          <p className="text-xs text-[#739072] font-semibold">
                            Nutrient Distribution
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F6F52]/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-[#4F6F52]" />
                        <span className="text-xs font-bold text-[#4F6F52]">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="relative">
                      <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[280px] w-full"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                hideLabel
                                className="bg-white border-2 border-[#ECE3CE] shadow-xl rounded-xl"
                              />
                            }
                          />

                          <Pie
                            data={pieChartData}
                            dataKey="visitors"
                            innerRadius={75}
                            outerRadius={105}
                            paddingAngle={6}
                            nameKey="browser"
                            stroke="white"
                            strokeWidth={3}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}

                            <LabelList
                              dataKey="visitors"
                              className="fill-white font-black drop-shadow-lg"
                              stroke="none"
                              fontSize={16}
                              formatter={(value) =>
                                typeof value === "number" && total > 0
                                  ? `${((value / total) * 100).toFixed(0)}%`
                                  : ""
                              }
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>

                      {/* Center label */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-3xl font-black text-[#3A4D39]">
                            {total}
                          </div>
                          <div className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                            Total PPM
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-6 space-y-2 pt-6 border-t-2 border-[#ECE3CE]">
                      {pieChartData.map((item, idx) => (
                        <Motion.div
                          key={item.browser}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF9F6]/50 hover:bg-[#FAF9F6] border-2 border-transparent hover:border-[#ECE3CE] transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full shadow-md group-hover:scale-125 transition-transform duration-200 border-2 border-white"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm font-black uppercase text-[#3A4D39] tracking-wider">
                              {item.browser}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1.5 px-3 py-1 bg-white rounded-lg shadow-sm">
                            <span className="text-xl font-black text-[#3A4D39]">
                              {item.visitors}
                            </span>
                            <span className="text-xs font-bold text-[#739072] uppercase">
                              ppm
                            </span>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  </div>
                </Motion.div>
              )}

              {/* Environmental Metrics Column */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Temperature */}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="sm:col-span-2 bg-gradient-to-br from-white/90 to-orange-50/30 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-orange-200/30 p-6 sm:p-8 hover:shadow-2xl hover:border-orange-300/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg">
                        <ThermometerSun className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#3A4D39]">
                          Temperature
                        </h2>
                        <p className="text-xs text-[#739072] font-semibold flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Live Reading
                        </p>
                      </div>
                    </div>

                    <div className="flex bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border-2 border-orange-200/50 shadow-md">
                      {["C", "F", "K"].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setTempUnit(unit)}
                          className={`px-3 py-2 text-xs font-black rounded-lg transition-all duration-200 ${
                            tempUnit === unit
                              ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md scale-105"
                              : "text-[#739072] hover:text-[#3A4D39] hover:bg-orange-50"
                          }`}
                        >
                          °{unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl" />
                    <div className="text-center relative">
                      <div className="flex items-start justify-center">
                        <span className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#3A4D39] to-orange-600 tracking-tight">
                          {displayTemp}
                        </span>
                        <span className="text-4xl sm:text-5xl ml-2 text-orange-500 font-black">
                          °{tempUnit}
                        </span>
                      </div>
                      <div className="mt-3 inline-block px-4 py-1.5 bg-orange-100 rounded-full">
                        <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">
                          Optimal Range
                        </span>
                      </div>
                    </div>
                  </div>
                </Motion.div>

                {/* Humidity Card */}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="bg-gradient-to-br from-white/90 to-blue-50/30 backdrop-blur-md rounded-3xl shadow-xl border-2 border-blue-200/30 p-6 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl shadow-lg">
                        <Wind className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-black text-[#3A4D39]">
                          Humidity
                        </h2>
                        <p className="text-xs text-[#739072] font-semibold">
                          Relative Air
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-[#3A4D39]">
                          {analytics?.humidity ?? 0}
                        </span>
                        <span className="text-lg font-bold text-blue-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar */}
                  <HumidityBar
                    percentage={parseFloat(analytics?.humidity || 0)}
                  />
                </Motion.div>

                {/* Moisture Card */}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="bg-gradient-to-br from-white/90 to-cyan-50/30 backdrop-blur-md rounded-3xl shadow-xl border-2 border-cyan-200/30 p-6 hover:shadow-2xl hover:border-cyan-300/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-2xl shadow-lg">
                        <Droplets className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-black text-[#3A4D39]">
                          Moisture
                        </h2>
                        <p className="text-xs text-[#739072] font-semibold">
                          Soil Content
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-[#3A4D39]">
                          {analytics?.moisture ?? 0}
                        </span>
                        <span className="text-lg font-bold text-cyan-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bar */}
                  <MoistureBar
                    percentage={parseFloat(analytics?.moisture || 0)}
                  />
                </Motion.div>
              </div>
            </div>

            {/* Gas Data */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl hover:border-[#4F6F52]/30 transition-all duration-300"
            >
              <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b-2 border-[#ECE3CE]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-[#ECE3CE]">
                    <Zap className="w-5 h-5 text-[#4F6F52]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#3A4D39]">
                      Air Quality & Properties
                    </h2>
                    <p className="text-xs text-[#739072] font-semibold">
                      Environmental Sensors
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 sm:gap-5">
                  {GAS_DATA.map((gas, idx) => (
                    <Motion.div
                      key={gas.type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + idx * 0.05,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex justify-center"
                    >
                      <div className="w-32 h-32 sm:w-36 sm:h-36">
                        <GasFlag gas={gas.type} percentage={gas.percentage} />
                      </div>
                    </Motion.div>
                  ))}
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </div>
    </div>
  );
}
