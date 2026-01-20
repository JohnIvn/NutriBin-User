import React, { useState } from "react";
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
} from "lucide-react";

export default function Fertilizer() {
  // temp unit converter
  const [tempUnit, setTempUnit] = useState("C");
  const rawTemp = 30; // Base temperature

  // helper to convert temperature
  const convertTemp = (celsius, unit) => {
    if (unit === "F") return ((celsius * 9) / 5 + 32).toFixed(1);
    if (unit === "K") return (celsius + 273.15).toFixed(1);
    return celsius;
  };

  const displayTemp = convertTemp(rawTemp, tempUnit);

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
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              Fertilizer Analytics
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Real-time nutrient composition and environmental monitoring.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4F6F52]" />
              <span className="font-bold text-[#3A4D39] text-sm">
                All Systems Optimal
              </span>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* NPK Chart Card */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center gap-3">
              <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#3A4D39]">
                  NPK Composition
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#3A4D39] uppercase bg-[#ECE3CE] px-2 py-1 rounded">
                  Balanced
                </p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-[260px] w-full"
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
                    outerRadius={100}
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

              <div className="w-full mt-4 space-y-2 border-t border-[#ECE3CE] pt-4">
                {pieChartData.map((item) => (
                  <div
                    key={item.browser}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#FAF9F6] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm font-bold uppercase text-[#3A4D39]">
                        {item.browser}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-medium text-[#739072]">
                      {item.visitors} mg/L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* environmental metrics column */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* temperature card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6 flex flex-col justify-between h-full relative overflow-hidden">
              
              {/* header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                    <ThermometerSun className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#3A4D39]">
                      Temperature
                    </h2>
                    <p className="text-xs text-[#739072]">Internal Sensor</p>
                  </div>
                </div>

                {/* unit switcher */}
                <div className="flex bg-[#ECE3CE]/30 p-1 rounded-lg border border-[#3A4D39]/5">
                  {['C', 'F', 'K'].map((unit) => (
                    <button
                      key={unit}
                      onClick={() => setTempUnit(unit)}
                      className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                        tempUnit === unit
                          ? "bg-white text-[#3A4D39] shadow-sm"
                          : "text-[#739072] hover:bg-[#ECE3CE]/50"
                      }`}
                    >
                      °{unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* main value */}
              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <span className="text-7xl font-black text-[#3A4D39] tracking-tighter">
                  {displayTemp}
                  <span className="text-3xl text-[#739072] ml-1 align-top">°{tempUnit}</span>
                </span>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase border border-green-100">
                   <CheckCircle2 className="w-3 h-3" /> Optimal Range
                </div>
              </div>

              {/* simple native progress bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-[#739072] uppercase">
                   <span>Min</span>
                   <span>Max</span>
                </div>
                {/* visual bar */}
                <div className="h-3 w-full bg-[#ECE3CE]/30 rounded-full overflow-hidden border border-[#ECE3CE]">
                   <div 
                     className="h-full bg-gradient-to-r from-orange-300 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${Math.min((rawTemp / 100) * 100, 100)}%` }}
                   />
                </div>
              </div>
            </div>

            {/* stacked humidity & moisture */}
            <div className="flex flex-col gap-6">
              
              {/* humidity */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Humidity
                      </h2>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-[#3A4D39]">60%</span>
                </div>
                <HumidityBar percentage={60} />
              </div>

              {/* moisture */}
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Moisture
                      </h2>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-[#3A4D39]">80%</span>
                </div>
                <MoistureBar percentage={80} />
              </div>
            </div>
          </div>
        </div>

        {/* air quality */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center gap-3">
            <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#3A4D39]">
              Air Quality & Gas Analysis
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {GAS_DATA.map((gas) => (
                <div key={gas.type} className="flex justify-center">
                  <GasFlag gas={gas.type} percentage={gas.percentage} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}