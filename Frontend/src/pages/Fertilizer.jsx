import React, { useState } from "react";
import { LabelList, Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import TempBar from "@/components/ui/TemperatureBar";
import HumidityBar from "@/components/ui/HumidityBar";
import MoistureBar from "@/components/ui/MoistureBar";
import GasFlag from "@/components/ui/GasFlag";
import {
  Sprout,
  Wind,
  Droplets,
  ThermometerSun,
  Activity,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap,
  Leaf,
  Info,
} from "lucide-react";

export default function Fertilizer() {
  const [activeTab, setActiveTab] = useState("overview");

  const GAS_DATA = [
    { type: "methane", percentage: 32 },
    { type: "hydrogen", percentage: 2.2 },
    { type: "smoke", percentage: 2.2 },
    { type: "benzene", percentage: 2.2 },
    { type: "ammonia", percentage: 20 },
    { type: "nitrogen", percentage: 34 },
  ];

  const pieChartData = [
    { browser: "nitrogen", visitors: 275, fill: "#4F6F52" },
    { browser: "phosphorus", visitors: 200, fill: "#5C8D89" },
    { browser: "potassium", visitors: 187, fill: "#D4A373" },
  ];

  const total = pieChartData.reduce((sum, entry) => sum + entry.visitors, 0);

  const chartConfig = {
    nitrogen: { label: "Nitrogen", color: "#4F6F52" },
    phosphorus: { label: "Phosphorus", color: "#5C8D89" },
    potassium: { label: "Potassium", color: "#D4A373" },
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/20 via-white to-[#ECE3CE]/10 font-sans pb-20">
      <section className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        {/* header*/}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <h1 className="text-4xl md:text-5xl font-black text-[#3A4D39] tracking-tight">
                Fertilizer & Growth Analytics
              </h1>
              <p className="text-[#4F6F52] font-medium mt-2 text-lg">
                Monitor nutrient composition, environmental conditions, and air
                quality in real-time.
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-700 text-sm">
                  All Systems Optimal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* NPK Chart Card */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl shadow-lg shadow-[#3A4D39]/5 border border-[#3A4D39]/10 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="px-6 py-5 border-b border-[#ECE3CE] bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/20 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#3A4D39]/10 to-[#4F6F52]/10 rounded-xl text-[#3A4D39]">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-[#3A4D39]">
                  NPK Composition
                </h2>
                <p className="text-xs text-[#739072] font-medium">
                  Essential plant macronutrients
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#3A4D39] uppercase">
                  Balanced
                </p>
                <p className="text-xs text-[#739072]">All levels optimal</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[350px]">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[280px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        className="bg-white border-[#ECE3CE]"
                      />
                    }
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="visitors"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    nameKey="browser"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="visitors"
                      className="fill-white font-bold"
                      stroke="none"
                      fontSize={12}
                      formatter={(value) =>
                        typeof value === "number"
                          ? `${((value / total) * 100).toFixed(0)}%`
                          : ""
                      }
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* detailed info */}
              <div className="w-full mt-6 space-y-3 border-t border-[#ECE3CE] pt-6">
                {pieChartData.map((item) => (
                  <div
                    key={item.browser}
                    className="flex items-center justify-between p-2 bg-[#FAF9F6] rounded-lg hover:bg-[#ECE3CE]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-bold uppercase text-[#3A4D39]">
                        {item.browser}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-[#3A4D39]">
                        {item.visitors}mg/L
                      </span>
                      <span className="text-xs text-[#739072] ml-2">
                        ({((item.visitors / total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Metrics Column */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TEMPERATURE CARD */}
            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-3xl shadow-lg shadow-orange-200/20 border border-orange-200/30 p-8 flex flex-col justify-between h-full relative overflow-hidden group hover:shadow-xl transition-all">
              {/* bg */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100/20 rounded-bl-full -mr-8 -mt-8 opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-50/10 pointer-events-none" />

              {/* card header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl text-orange-600 shadow-md">
                    <ThermometerSun className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#3A4D39]">
                      Temperature
                    </h2>
                    <p className="text-xs text-[#739072] font-semibold uppercase tracking-wider">
                      Real-time Monitor
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Active
                </span>
              </div>

              {/* main value display */}
              <div className="flex-1 flex flex-col items-center justify-center py-8 relative z-10">
                <div className="text-center space-y-3">
                  <span className="text-8xl font-black text-[#3A4D39] tracking-tighter leading-none">
                    30
                    <span className="text-4xl text-orange-600 align-top relative top-1">
                      °
                    </span>
                  </span>
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide shadow-sm">
                      <CheckCircle2 className="w-4 h-4" /> Optimal Range
                    </span>
                    <p className="text-xs text-[#739072] font-medium">
                      Ideal for most plants: 25-35°C
                    </p>
                  </div>
                </div>
              </div>

              {/* progress bar */}
              <div className="w-full relative z-10 space-y-3">
                <div className="flex justify-between text-xs font-bold text-[#739072]">
                  <span className="bg-blue-50 px-2 py-1 rounded">0°C</span>
                  <span className="text-[#3A4D39]">Current: 30°C</span>
                  <span className="bg-red-50 px-2 py-1 rounded">100°C</span>
                </div>
              </div>
            </div>

            {/* Stacked Humidity & Moisture*/}
            <div className="flex flex-col gap-6">
              {/* humidity */}
              <div className="flex-1 bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-lg shadow-blue-200/20 border border-blue-200/30 p-6 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Humidity
                      </h2>
                      <p className="text-xs text-[#739072] font-medium">
                        Air moisture level
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#3A4D39]">
                      60<span className="text-lg text-[#739072]">%</span>
                    </span>
                    <p className="text-xs text-orange-600 font-bold">Low</p>
                  </div>
                </div>
                <HumidityBar percentage={60} />
              </div>

              {/* moisture */}
              <div className="flex-1 bg-gradient-to-br from-white to-cyan-50/30 rounded-3xl shadow-lg shadow-cyan-200/20 border border-cyan-200/30 p-6 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl text-cyan-600 group-hover:scale-110 transition-transform">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Soil Moisture
                      </h2>
                      <p className="text-xs text-[#739072] font-medium">
                        Ground water content
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#3A4D39]">
                      80<span className="text-lg text-[#739072]">%</span>
                    </span>
                    <p className="text-xs text-green-600 font-bold">Good</p>
                  </div>
                </div>
                <MoistureBar percentage={80} />
              </div>
            </div>
          </div>
        </div>

        {/* air quality */}
        <div className="bg-white rounded-3xl shadow-lg shadow-[#3A4D39]/5 border border-[#3A4D39]/10 overflow-hidden hover:shadow-xl transition-all">
          <div className="px-8 py-6 border-b border-[#ECE3CE] bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#739072]/10 to-[#4F6F52]/10 rounded-xl text-[#3A4D39]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#3A4D39]">
                  Air Quality & Gas Analysis
                </h2>
                <p className="text-xs text-[#739072] font-medium">
                  6 Key atmospheric compounds
                </p>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
              Healthy
            </span>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {GAS_DATA.map((gas) => (
                <div
                  key={gas.type}
                  className="flex justify-center transform hover:scale-105 transition-transform"
                >
                  <GasFlag gas={gas.type} percentage={gas.percentage} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-[#3A4D39]/10 pt-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <p className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                Last Update
              </p>
              <p className="text-sm font-bold text-[#3A4D39] mt-1">Just now</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                System Status
              </p>
              <p className="text-sm font-bold text-green-600 mt-1">
                All Sensors Active
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#739072] uppercase tracking-wide">
                Next Check
              </p>
              <p className="text-sm font-bold text-[#3A4D39] mt-1">
                In 5 minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
