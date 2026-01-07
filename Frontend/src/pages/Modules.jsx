import ModuleCard from "@/components/ui/ModuleCard";
import React from "react";

export default function Modules() {
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="px-12 pt-4">
        <h1 className="text-3xl font-bold text-black">Modules</h1>
        <h1 className="text-m text-gray-600 pb-4 pt-2">
          Checking of modules inside the machine.
        </h1>
        <hr className="border-t-2 border-gray-400 w-full pb-4" />
      </div>
      <div className="flex flex-row justify-between gap-4 px-12 py-2">
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Micro-controllers</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <div className="flex flex-col gap-3 pt-4">
            <ModuleCard title="Arduino Q" />
            <ModuleCard title="ESP32 Filter" />
            <ModuleCard title="ESP32 Chute" />
            <ModuleCard title="ESP32 Grinder" />
            <ModuleCard title="ESP32 Exhaust" />
          </div>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Motors</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <div className="flex flex-col gap-3 pt-4">
            <ModuleCard title="Stepper Motor" offline={true} />
            <ModuleCard title="Heating Pad" offline={true} />
            <ModuleCard title="Exhaust Fan" />
            <ModuleCard title="DC Motor" />
            <ModuleCard title="Power Supply" />
            <ModuleCard title="Grinder Motor" />
            <ModuleCard title="Servo Motor" />
          </div>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Sensors</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <div className="flex flex-col gap-3 pt-4">
            <ModuleCard title="Camera A" offline={true} />
            <ModuleCard title="Camera B" offline={true} />
            <ModuleCard title="Humidity" />
            <ModuleCard title="Temperature" />
            <ModuleCard title="Gas (Methane)" />
            <ModuleCard title="Gas (Nitrogen)" />
            <ModuleCard title="Water" />
            <ModuleCard title="NPK Sensor" />
            <ModuleCard title="Moisture" />
          </div>
        </div>
      </div>
    </section>
  );
}
