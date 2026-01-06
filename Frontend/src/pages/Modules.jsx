import React from "react";

export default function Modules() {
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="px-12 py-2 text-center">
        <h1 className="text-3xl font-bold text-black py-10">Modules</h1>
        <hr className="border-t-2 border-gray-400 w-full" />
      </div>
      <div className="flex flex-row justify-between gap-4 px-12 py-2">
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-2xl md:w-1/2">
          <h1 className="text-2xl font-bold text-black">Micro-controllers</h1>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-2xl md:w-1/2">
          <h1 className="text-2xl font-bold text-black">Micro-controllers</h1>
        </div>
        <div className="flex flex-col px-4 py-4 bg-[#FFF5E4] shadow-2xl md:w-1/2">
          <h1 className="text-2xl font-bold text-black">Micro-controllers</h1>
        </div>
      </div>
    </section>
  );
}
