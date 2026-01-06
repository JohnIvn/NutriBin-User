import ModuleCard from "@/components/ui/ModuleCard";
import React from "react";

export default function Modules() {
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="px-12 py-2 text-center">
        <h1 className="text-3xl font-bold text-black pt-10 pb-3">Modules</h1>
        <hr className="border-t-2 border-gray-400 w-full pb-4"/>
      </div>
      <div className="flex flex-row justify-between gap-4 px-12 py-2">
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Micro-controllers</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1"/>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Motors</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1"/>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-xl/30 md:w-1/2">
          <h1 className="text-xl font-bold text-black">Sensors</h1>
          <hr className="border-t-2 border-gray-400 w-full" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={false} bgColor="#CD5C08" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
          <ModuleCard title="ESP32 (AP)" isOnline={true} bgColor="#00A7E1" />
        </div>
      </div>
    </section>
  );
}
