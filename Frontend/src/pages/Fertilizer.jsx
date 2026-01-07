import React from "react";
import { LabelList, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";
import TempBar from "@/components/ui/TemperatureBar";
import HumidityBar from "@/components/ui/HumidityBar";
import MoistureBar from "@/components/ui/MoistureBar";

export default function Fertilizer() {
  const pieChartData = [
    { browser: "nitrogen", visitors: 275, fill: "#4CAF50" },
    { browser: "phosphorus", visitors: 200, fill: "#2196F3" },
    { browser: "potassium", visitors: 187, fill: "#FF9800" },
  ];
  const total = pieChartData.reduce((sum, entry) => sum + entry.visitors, 0);
  const chartConfig = {
    nitrogen: {
      label: "Nitrogen",
      color: "#fffcfc",
    },
    phosphorus: {
      label: "Phosphorus",
      color: "#00A7E1",
    },
    potassium: {
      label: "Potassium",
      color: "#CD5C08",
    },
  };
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="px-12 pt-4">
        <h1 className="text-3xl font-bold text-black">Fertilizers</h1>
        <h1 className="text-m text-gray-600 pb-4">
          Stats for the fertilization of compostables.
        </h1>
        <hr className="border-t-2 border-gray-400 w-full pb-4" />
      </div>
      <div className="flex flex-col justify-between gap-4 px-12 py-2">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/3">
            <h1 className="text-xl font-bold text-black">NPK RATIO</h1>
            <hr className="border-t-2 border-gray-400 w-full" />
            <div className="h-62.5 w-full pt-3">
              <ChartContainer
                config={chartConfig}
                className="[&_.recharts-pie-label-text]:fill-gray-800 font-bold mx-auto aspect-square h-64 pb-0"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieChartData}
                    dataKey="visitors"
                    label
                    nameKey="browser"
                  >
                    <LabelList
                      dataKey="visitors"
                      className="fill-white font-bold"
                      stroke="none"
                      fontSize={12}
                      formatter={(value) =>
                        typeof value === "number"
                          ? `${((value / total) * 100).toFixed(1)}%`
                          : ""
                      }
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>
          <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/7">
            <h1 className="text-xl font-bold text-black">Temperature</h1>
            <hr className="border-t-2 border-gray-400 w-full" />
            <TempBar temperature={30} maxTemp={100} />
          </div>
          <div className="flex flex-col gap-4 md:w-1/2">
            <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:h-1/2">
              <h1 className="text-xl font-bold text-black">Humidity</h1>
              <hr className="border-t-2 border-gray-400 w-full" />
              <HumidityBar percentage={60} />
            </div>
            <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:h-1/2">
              <h1 className="text-xl font-bold text-black">Moisture</h1>
              <hr className="border-t-2 border-gray-400 w-full" />
              <MoistureBar percentage={80} />
            </div>
          </div>
        </div>
        <div className="flex flex-col px-10 py-8 bg-[#FFF5E4] shadow-xl/30">
          <h1 className="text-xl font-bold text-black pb-2">Air Quality</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          
        </div>
      </div>
    </section>
  );
}
