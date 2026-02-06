import { Button } from "@/components/ui/Button";
import React from "react";
import { Link } from "react-router-dom";
import { Network, Clock, LineChart, BookOpen, Lightbulb } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full font-sans">
      {/* hero */}
      <section className="relative flex-col gap-5 items-center flex justify-center bg-[url('/Homepage.png')] bg-cover bg-center h-screen w-full">
        {/* dark overlay to ensure text is readable on any image */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-6xl mx-auto space-y-8 mt-10">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-black tracking-tighter leading-none drop-shadow-lg">
              TURN FOOD WASTE INTO
            </h1>
            <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-black tracking-tighter leading-none drop-shadow-lg">
              NUTRIENT RICH-GOLD
            </h1>
          </div>

          <div className="max-w-4xl space-y-2 pt-4">
            <p className="text-lg md:text-2xl text-white/95 font-medium leading-relaxed drop-shadow-md">
              A smart, IoT-powered solution designed to convert small-scale food
              waste into nutrient-dense fertilizer. Monitor the entire
              decomposition process and track real-time NPK levels through our
              integrated hardware and software monitoring system.
            </p>
          </div>
        </div>
      </section>

      {/* content body- */}
      <div className="bg-[#ECE3CE]/30 w-full py-20 px-6">
        <div className="max-w-350 mx-auto space-y-24">
          {/* key features */}
          <section className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#3A4D39] pl-2 border-l-4 border-[#3A4D39]">
              Key Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* f1 */}
              <div className="group bg-[#739072] rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[320px] justify-center">
                <div className="p-4 rounded-2xl border-2 border-white/20 mb-6 text-white group-hover:scale-110 transition-transform">
                  <Network className="w-14 h-14" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Automated Processing
                </h3>
                <p className="text-white/80 font-medium text-lg">
                  Optimized waste conversion
                </p>
              </div>

              {/* f2 */}
              <div className="group bg-[#739072] rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[320px] justify-center">
                <div className="p-5 rounded-full bg-white/10 mb-6 text-white group-hover:rotate-12 transition-transform">
                  <Clock className="w-14 h-14" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Real-Time Monitoring
                </h3>
                <p className="text-white/80 font-medium text-lg">
                  Track NPK, pH & Temp levels
                </p>
              </div>

              {/* f3 */}
              <div className="group bg-[#739072] rounded-3xl p-10 flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-all duration-300 min-h-[320px] justify-center">
                <div className="p-4 rounded-2xl border-2 border-white/20 mb-6 text-white group-hover:scale-110 transition-transform">
                  <LineChart className="w-14 h-14" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Nutrient Analysis
                </h3>
                <p className="text-white/80 font-medium text-lg">
                  Know your fertilizer's quality
                </p>
              </div>
            </div>
          </section>

          {/* about us */}
          <section className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-black text-[#3A4D39] pl-2 border-l-4 border-[#3A4D39]">
              About Us
            </h2>
            <div className="flex flex-col lg:flex-row gap-12 items-stretch">
              {/* image container */}
              <div className="w-full lg:w-1/2 min-h-[350px] rounded-3xl overflow-hidden shadow-xl bg-gray-200">
                <img
                  src="/image.jpg"
                  alt="Seedlings growing in rich soil"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* content */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
                <p className="text-2xl md:text-2xl text-[#3A4D39] leading-relaxed font-medium text-justify">
                  NutriBin is a smart, technologically advanced method for
                  producing organic fertilizer and managing trash in a
                  sustainable manner. Our system is made to handle soft and tiny
                  biodegradable food waste in an ethical manner by using
                  regulated mixing and drying to speed up natural breakdown.
                </p>
                <p className="text-2xl md:text-2xl text-[#3A4D39] leading-relaxed font-medium text-justify">
                  NutriBin guarantees the safety, efficacy, and environmental
                  friendliness of the final fertilizer by including real-time
                  monitoring of critical compost characteristics, such as NPK
                  levels, pH, temperature, moisture, and gas emissions.
                </p>
              </div>
            </div>
          </section>

          {/* cta's */}
          <section className="bg-[#E8E4D3] border border-[#3A4D39]/10 rounded-[2rem] p-10 md:p-14 shadow-lg shadow-[#3A4D39]/5">
            <div className="max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-black text-[#3A4D39] mb-4 tracking-tight">
                Want to explore more about NutriBin?
              </h2>
              <p className="text-[#739072] text-xl mb-10 font-medium">
                Find setup instructions, user manuals, and advanced guides to
                get started.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/guide">
                  <Button className="bg-[#739072] hover:bg-[#4F6F52] text-white px-8 py-7 rounded-xl text-lg font-bold flex items-center justify-center gap-3 w-full sm:w-auto shadow-md transition-all cursor-pointer">
                    <BookOpen className="w-6 h-6" />
                    View User Guides
                  </Button>
                </Link>

                <Link to="/studies">
                  <Button
                    variant="ghost"
                    className="bg-white border-2 border-[#739072]/20 text-[#3A4D39] hover:bg-[#ECE3CE]/50 px-8 py-7 rounded-xl text-lg font-bold flex items-center justify-center gap-3 w-full sm:w-auto shadow-sm transition-all cursor-pointer"
                  >
                    <Lightbulb className="w-6 h-6 text-[#739072]" />
                    Browse Related Studies
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
