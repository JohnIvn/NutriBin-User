import React from "react";
import ModuleCard from "@/components/ui/ModuleCard";
import { 
  Cpu, 
  Fan, 
  Eye, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Zap, 
  Cog, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";

export default function Modules() {
  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-400 mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              System Modules
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Real-time hardware status and diagnostics.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#4F6F52] animate-pulse" />
              <span className="font-bold text-[#3A4D39] text-sm">
                System Diagnostic Running
              </span>
            </div>
          </div>
        </div>

        {/* main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          
          {/* micro-controllers */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
               <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                  <Cpu className="w-5 h-5" />
               </div>
               <h2 className="text-xl font-bold text-[#3A4D39]">Controllers</h2>
               <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">5 Units</span>
            </div>
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard title="Arduino Q" icon={Cpu} subtext="Main Logic Unit" />
              <ModuleCard title="ESP32 Filter" icon={Wifi} subtext="Air Filtration" />
              <ModuleCard title="ESP32 Chute" icon={Wifi} subtext="Waste Intake" />
              <ModuleCard title="ESP32 Grinder" icon={Wifi} subtext="Processing Unit" />
              <ModuleCard title="ESP32 Exhaust" icon={Wifi} subtext="Ventilation Control" />
            </div>
          </div>

          {/* motors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
               <div className="p-2 bg-orange-50 rounded-lg text-orange-700">
                  <Cog className="w-5 h-5" />
               </div>
               <h2 className="text-xl font-bold text-[#3A4D39]">Actuators</h2>
               <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">7 Units</span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard title="Stepper Motor" icon={Cog} offline={true} subtext="Conveyor Belt" />
              <ModuleCard title="Heating Pad" icon={Zap} offline={true} subtext="Thermal Unit" />
              <ModuleCard title="Exhaust Fan" icon={Fan} subtext="Cooling System" />
              <ModuleCard title="DC Motor" icon={Cog} subtext="Mixer A" />
              <ModuleCard title="Power Supply" icon={Zap} subtext="Main 12V Rail" />
              <ModuleCard title="Grinder Motor" icon={Cog} subtext="High Torque" />
              <ModuleCard title="Servo Motor" icon={Cog} subtext="Valve Control" />
            </div>
          </div>

          {/* sensors column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2 px-1">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Eye className="w-5 h-5" />
               </div>
               <h2 className="text-xl font-bold text-[#3A4D39]">Sensors</h2>
               <span className="ml-auto text-xs font-bold bg-[#ECE3CE] text-[#739072] px-2 py-1 rounded-full">9 Units</span>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#3A4D39]/10 space-y-3">
              <ModuleCard title="Camera A" icon={Eye} offline={true} subtext="Feed Input" />
              <ModuleCard title="Camera B" icon={Eye} offline={true} subtext="Processing Bay" />
              <ModuleCard title="Humidity" icon={Droplets} subtext="DHT22 Sensor" />
              <ModuleCard title="Temperature" icon={Thermometer} subtext="Internal Probe" />
              <ModuleCard title="Gas (Methane)" icon={Wind} subtext="MQ-4 Sensor" />
              <ModuleCard title="Gas (Nitrogen)" icon={Wind} subtext="Chemical Sniffer" />
              <ModuleCard title="Water Level" icon={Droplets} subtext="Tank A" />
              <ModuleCard title="NPK Sensor" icon={Activity} subtext="Soil Probe" />
              <ModuleCard title="Moisture" icon={Droplets} subtext="Capacitive Sensor" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}