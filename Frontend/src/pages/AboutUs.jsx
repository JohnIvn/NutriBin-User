import React from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Leaf,
  Cpu,
  Box,
  Flame,
  Activity,
  Sprout,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pb-12 font-sans text-[#3A4D39] overflow-x-hidden">
      {/* header */}
      <header className="pt-30 pb-32 px-10 text-center text-white relative">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center mb-6">
            <div className="bg-[#3A4D39]/10 p-4 rounded-full backdrop-blur-sm shadow-inner border border-white/20">
              <Leaf className="w-10 h-10 text-[#3A4D39]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm text-[#4F6F52]">
            About NutriBin
          </h1>
          <p className="text-[#4F6F52]/60 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Revolutionizing waste management through intelligent IoT composting.
          </p>
        </div>
      </header>

      {/* main container */}
      <main className="max-w-7xl mx-auto -mt-24 px-4 sm:px-6 relative z-10">
        <Card className="bg-white shadow-2xl border-none overflow-hidden rounded-2xl">
          <CardContent className="p-8 md:p-12 space-y-16">
            {/* introduction */}
            <div className="text-center space-y-6 max-w-4xl mx-auto border-b pb-10 border-[#ECE3CE]">
              <div className="inline-block px-4 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-sm tracking-wider uppercase mb-2">
                Our Mission
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-[#3A4D39] leading-tight">
                Bridging the gap between household waste and sustainable
                agriculture.
              </h2>
              <p className="text-lg text-[#739072] leading-relaxed">
                NutriBin is an intelligent IoT ecosystem that transforms organic
                food scraps into nutrient-rich fertilizer using high‑performance
                mechanical processing and real‑time data analytics.
              </p>
            </div>

            {/* key features grid */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-2 bg-[#3A4D39] rounded-full" />
                <h3 className="text-3xl font-bold text-[#3A4D39]">
                  Key Features
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureItem
                  icon={<Cpu />}
                  title="Automated Thermal Processing"
                  desc="Rapidly converts food scraps into stable fertilizer using a controlled cycle of mechanical mixing and optimized heating."
                />
                <FeatureItem
                  icon={<Activity />}
                  title="Smart NPK Profiling"
                  desc="Integrated sensors analyze Nitrogen, Phosphorus, and Potassium levels, providing a digital Nutrient Card for every batch."
                />
                <FeatureItem
                  icon={<Box />}
                  title="Real‑time Monitoring"
                  desc="Live tracking of machine health, including temperature and motor status, via ESP32‑powered web dashboards."
                />
                <FeatureItem
                  icon={<Flame />}
                  title="Safety & Gas Sensing"
                  desc="MQ‑series sensors detect Ammonia and Methane levels, ensuring a safe and odor‑controlled environment."
                />
                <FeatureItem
                  icon={<Leaf />}
                  title="Batch History"
                  desc="Automatically logs every cycle so you can track nutrient quality and system performance remotely."
                />
              </div>
            </div>

            {/* process flow */}
            <div className="bg-[#FAF9F6] rounded-2xl p-8 border border-[#ECE3CE]">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-[#3A4D39]">
                  Input, Process & Output
                </h3>
                <p className="text-[#739072]">How the magic happens</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* arrow connectors */}
                <div className="hidden md:block absolute top-12 left-[30%] right-[30%] h-0.5 bg-gradient-to-r from-[#3A4D39]/20 via-[#3A4D39] to-[#3A4D39]/20 -z-0" />

                <ProcessStep
                  number="01"
                  title="Input"
                  desc="Soft biodegradable food scraps"
                />
                <ProcessStep
                  number="02"
                  title="Process"
                  desc="Mechanical mixing, thermal drying, & analysis"
                />
                <ProcessStep
                  number="03"
                  title="Output"
                  desc="Organic fertilizer with nutrient report"
                />
              </div>
            </div>

            {/* 4. guidelines */}
            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* usage guidelines */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#3A4D39] flex items-center gap-3">
                  <CheckCircle2 className="text-[#4F6F52]" />
                  Optimal Usage
                </h3>
                <div className="bg-[#4F6F52]/5 border border-[#4F6F52]/20 rounded-xl p-6">
                  <p className="text-[#4F6F52] mb-4">
                    For the best quality fertilizer, ensure you are inputting
                    the correct materials.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-bold text-[#3A4D39]">
                      <Sprout className="w-4 h-4" /> Fruit & Veggie Peels
                    </li>
                    <li className="flex items-center gap-2 text-sm font-bold text-[#3A4D39]">
                      <Sprout className="w-4 h-4" /> Leftover Rice/Bread
                    </li>
                    <li className="flex items-center gap-2 text-sm font-bold text-[#3A4D39]">
                      <Sprout className="w-4 h-4" /> Garden Trimmings
                    </li>
                  </ul>
                </div>
              </div>

              {/* warnings */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#3A4D39] flex items-center gap-3">
                  <AlertTriangle className="text-red-600" />
                  Safety Guidelines
                </h3>
                <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-sm text-red-800 font-medium">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                      No hard solids (bones, large seeds, fruit pits).
                    </li>
                    <li className="flex items-start gap-2 text-sm text-red-800 font-medium">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                      No plastics, metals, or glass materials.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-red-800 font-medium">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                      Avoid liquids such as soups or oils.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-8 border-t border-[#ECE3CE]">
              <div className="bg-[#3A4D39] rounded-2xl p-8 md:p-12 text-center text-white shadow-xl shadow-[#3A4D39]/20 relative overflow-hidden">
                {/* bg pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ECE3CE_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative z-10 space-y-6">
                  <h2 className="text-3xl md:text-4xl font-black">
                    Ready to turn your waste into life?
                  </h2>
                  <p className="text-[#ECE3CE]/80 text-lg max-w-xl mx-auto">
                    Create an account to connect your hardware, monitor batches,
                    and join a community dedicated to science‑backed
                    sustainability.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                    <Button className="bg-[#ECE3CE] text-[#3A4D39] hover:bg-white hover:scale-105 transition-all font-bold h-12 px-8 rounded-full cursor-pointer">
                      Join Now
                    </Button>
                    <Button
                      variant="outline"
                      className="border-2 border-[#ECE3CE] text-[#ECE3CE] hover:text-[white] hover:bg-[#ECE3CE]/5 bg-transparent h-12 px-8 rounded-full cursor-pointer hover:border-[white]"
                    >
                      Browse Guides <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* footer */}
      <footer className="text-center text-[#739072] text-sm mt-12 pb-8 font-medium">
        &copy; 2026 NutriBin System. All rights reserved.
      </footer>
    </div>
  );
}

// --- inline components ---

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="group p-6 rounded-xl border border-[#ECE3CE] bg-white hover:shadow-lg hover:border-[#3A4D39]/30 transition-all duration-300">
      <div className="h-12 w-12 rounded-lg bg-[#3A4D39] flex items-center justify-center text-[#ECE3CE] mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-[#3A4D39]/20">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#3A4D39] mb-2">{title}</h3>
      <p className="text-sm text-[#739072] leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-white border-4 border-[#3A4D39] flex flex-col items-center justify-center shadow-xl mb-4">
        <span className="text-xs font-bold text-[#739072] uppercase">Step</span>
        <span className="text-3xl font-black text-[#3A4D39]">{number}</span>
      </div>
      <h4 className="text-xl font-bold text-[#3A4D39] mb-2">{title}</h4>
      <p className="text-sm text-[#739072] max-w-[200px]">{desc}</p>
    </div>
  );
}
