import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";
import { motion as Motion } from "framer-motion";

export default function Fertilizer() {
  const [tempUnit, setTempUnit] = useState("C");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasData = analytics !== null;

  const { user, selectedMachine } = useUser();
  const customerId = user?.customer_id;
  const machineId = selectedMachine?.machine_id;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const res = await Requests({
          url: `/fertilizer-analytics/${customerId}`,
          params: { machineId },
        });

        if (res.data.ok && res.data.analytics.length > 0) {
          setAnalytics(res.data.analytics[0]);
        } else {
          setAnalytics(null);
        }
      } catch (err) {
        console.error(err);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    if (!customerId || !machineId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    fetchAnalytics();
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

  const total = pieChartData.reduce((sum, entry) => sum + entry.visitors, 0);

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
      <div className="flex items-center justify-center min-h-screen min-w-screen bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6]">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-12 h-12 text-[#4F6F52]" />
        </Motion.div>
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

            <div className="px-5 py-3 bg-white border-2 border-[#4F6F52]/20 rounded-2xl shadow-lg shadow-[#4F6F52]/5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <CheckCircle2 className="w-6 h-6 text-[#4F6F52]" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="font-bold text-[#3A4D39] text-sm sm:text-base">
                  All Systems Optimal
                </span>
              </div>
            </div>
          </div>
        </Motion.div>

        {!hasData && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-[#3A4D39]/20 rounded-3xl p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xl"
          >
            <div className="p-6 bg-gradient-to-br from-[#ECE3CE]/60 to-[#4F6F52]/10 rounded-2xl mb-6">
              <Leaf className="w-12 h-12 text-[#4F6F52]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#3A4D39] mb-3">
              No Fertilizer Data Yet
            </h3>

            <p className="text-[#739072] text-base sm:text-lg max-w-md leading-relaxed">
              This machine hasn't sent any fertilizer or environmental readings
              yet. Once the system starts processing data, analytics will appear
              here automatically.
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm text-[#A1A1AA] font-medium">
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </Motion.div>
              <span>Waiting for sensor input…</span>
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
                  className="lg:col-span-5 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm">
                        <Leaf className="w-5 h-5 text-[#4F6F52]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#3A4D39]">
                          NPK Composition
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Nutrient Distribution
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square max-h-[280px] w-full"
                    >
                      <PieChart>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              className="bg-white border border-[#ECE3CE] shadow-lg rounded-xl"
                            />
                          }
                        />

                        <Pie
                          data={pieChartData}
                          dataKey="visitors"
                          innerRadius={75}
                          outerRadius={105}
                          paddingAngle={4}
                          nameKey="browser"
                          stroke="none"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}

                          <LabelList
                            dataKey="visitors"
                            className="fill-white font-bold"
                            stroke="none"
                            fontSize={14}
                            formatter={(value) =>
                              typeof value === "number" && total > 0
                                ? `${((value / total) * 100).toFixed(0)}%`
                                : ""
                            }
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>

                    <div className="w-full mt-6 space-y-2.5 pt-6 border-t border-[#ECE3CE]">
                      {pieChartData.map((item, idx) => (
                        <Motion.div
                          key={item.browser}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF9F6] transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm font-bold uppercase text-[#3A4D39] tracking-wide">
                              {item.browser}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#3A4D39]">
                              {item.visitors}
                            </span>
                            <span className="text-xs font-medium text-[#739072]">
                              mg/L
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
                  className="sm:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 p-6 sm:p-8 hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm">
                        <ThermometerSun className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#3A4D39]">
                          Temperature
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Current Reading
                        </p>
                      </div>
                    </div>

                    <div className="flex bg-[#ECE3CE]/40 p-1 rounded-xl border border-[#3A4D39]/10 shadow-sm">
                      {["C", "F", "K"].map((unit) => (
                        <button
                          key={unit}
                          onClick={() => setTempUnit(unit)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                            tempUnit === unit
                              ? "bg-white text-[#3A4D39] shadow-sm"
                              : "text-[#739072] hover:text-[#3A4D39]"
                          }`}
                        >
                          °{unit}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <span className="text-7xl sm:text-8xl font-black text-[#3A4D39] tracking-tight">
                        {displayTemp}
                      </span>
                      <span className="text-4xl sm:text-5xl ml-2 text-[#739072] font-bold">
                        °{tempUnit}
                      </span>
                    </div>
                  </div>
                </Motion.div>

                {/* Humidity Card */}
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-[#3A4D39]/10 p-6 hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm">
                        <Wind className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-bold text-[#3A4D39]">
                          Humidity
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Relative
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-[#3A4D39]">
                      {analytics?.humidity ?? 0}
                      <span className="text-base md:text-lg text-[#739072]">
                        %
                      </span>
                    </span>
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
                  className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-[#3A4D39]/10 p-6 hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow-sm">
                        <Droplets className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <h2 className="text-sm md:text-base font-bold text-[#3A4D39]">
                          Moisture
                        </h2>
                        <p className="text-xs text-[#739072] font-medium">
                          Soil Level
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-[#3A4D39]">
                      {analytics?.moisture ?? 0}
                      <span className="text-base md:text-lg text-[#739072]">
                        %
                      </span>
                    </span>
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
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="px-6 py-5 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm">
                    <Zap className="w-5 h-5 text-[#4F6F52]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3A4D39]">
                      Air Quality & Properties
                    </h2>
                    <p className="text-xs text-[#739072] font-medium">
                      Environmental Sensors
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                  {GAS_DATA.map((gas, idx) => (
                    <Motion.div
                      key={gas.type}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + idx * 0.05 }}
                      className="flex justify-center"
                    >
                      <GasFlag gas={gas.type} percentage={gas.percentage} />
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
