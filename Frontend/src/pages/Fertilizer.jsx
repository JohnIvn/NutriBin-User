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
} from "lucide-react";
import { useUser } from "@/contexts/UserContextHook";
import Requests from "@/utils/Requests";

export default function Fertilizer() {
  // temp unit converter
  const [tempUnit, setTempUnit] = useState("C");
  const [analytics, setAnalytics] = useState(null);
  const hasData = analytics !== null;

  const { user, selectedMachine } = useUser();
  const customerId = user?.customer_id;
  const machineId = selectedMachine?.machine_id;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await Requests({
          url: `/fertilizer-analytics/${customerId}`,
          params: {
            machineId: machineId,
          },
        });

        console.log(res.data.analytics);

        if (res.data.ok && res.data.analytics.length > 0) {
          setAnalytics(res.data.analytics[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAnalytics();
  }, [customerId]);

  // temperature converter
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

  // pie chart data
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

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-400 mx-auto px-6 pt-8 space-y-8">
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

        {!hasData && (
          <div className="bg-white border border-dashed border-[#3A4D39]/30 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="p-4 bg-[#ECE3CE]/40 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-[#739072]" />
            </div>

            <h3 className="text-xl font-black text-[#3A4D39] mb-2">
              No Fertilizer Data Yet
            </h3>

            <p className="text-[#739072] max-w-md">
              This machine hasn’t sent any fertilizer or environmental readings
              yet. Once the system starts processing data, analytics will appear
              here automatically.
            </p>

            <div className="mt-6 text-sm text-[#A1A1AA] font-medium">
              Waiting for sensor input…
            </div>
          </div>
        )}

        {hasData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* NPK Pie Chart */}
              {analytics && (
                <div className="lg:col-span-5 lg:row-span-2 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10">
                  {/* NPK content */}
                  <div className="px-6 py-5 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center gap-3">
                    <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-[#3A4D39]">
                      NPK Composition
                    </h2>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square h-65 w-full"
                    >
                      <PieChart>
                        {/* Tooltip */}
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              className="bg-white border border-[#ECE3CE]"
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
                            <Cell key={index} fill={entry.fill} />
                          ))}

                          {/* Slice percentage labels */}
                          <LabelList
                            dataKey="visitors"
                            className="fill-white font-bold"
                            stroke="none"
                            fontSize={12}
                            formatter={(value) =>
                              typeof value === "number" && total > 0
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
              )}

              {/* Environmental metrics */}
              <div className="lg:col-span-4 lg:row-span-2 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6 flex flex-col justify-between">
                {/* header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600">
                      <ThermometerSun className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-[#3A4D39]">
                      Temperature
                    </h2>
                  </div>

                  <div className="flex bg-[#ECE3CE]/30 p-1 rounded-lg">
                    {["C", "F", "K"].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setTempUnit(unit)}
                        className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          tempUnit === unit
                            ? "bg-white text-[#3A4D39]"
                            : "text-[#739072]"
                        }`}
                      >
                        °{unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* value */}
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-7xl font-black text-[#3A4D39]">
                    {displayTemp}
                    <span className="text-3xl ml-1 text-[#739072]">
                      °{tempUnit}
                    </span>
                  </span>
                </div>
              </div>

              {/* Humidity + Moisture — stacked in SAME column */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Humidity */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Wind className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Humidity
                      </h2>
                    </div>
                    <span className="text-2xl font-black text-[#3A4D39]">
                      {analytics?.humidity ?? 0}%
                    </span>
                  </div>

                  <HumidityBar
                    percentage={parseFloat(analytics?.humidity || 0)}
                  />
                </div>

                {/* Moisture */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-bold text-[#3A4D39]">
                        Moisture
                      </h2>
                    </div>
                    <span className="text-2xl font-black text-[#3A4D39]">
                      {analytics?.moisture ?? 0}%
                    </span>
                  </div>

                  <MoistureBar
                    percentage={parseFloat(analytics?.moisture || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Gas Data */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#3A4D39]/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center gap-3">
                <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[#3A4D39]">
                  Air Quality & Properties
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
          </>
        )}
      </section>
    </div>
  );
}
