import { Button } from "@/components/ui/Button";
import React from "react";

export default function Home() {
  return (
    <section className="flex flex-col w-full justify-between">
      <div className="flex-col gap-5 items-center hidden md:flex justify-center bg-[url('/Homepage.png')] bg-cover bg-center h-[100vh]">
        <div className="my-10">
          <h1 className="text-8xl text-white font-bold">
            TURN FOOD WASTE INTO
          </h1>
          <h1 className="text-8xl text-white font-bold">NUTRIENT RICH-GOLD</h1>
        </div>
        <div>
          <h3 className="text-2xl text-white font-normal ">
            A smart, IoT-powered solution designed to convert small-scale food
            waste into nutrient-
          </h3>
          <h3 className="text-2xl text-white font-normal ">
            dense fertilizer. Monitor the entire decomposition process and track
            real-time NPK levels
          </h3>
          <h3 className="text-2xl text-white font-normal ">
            A smart, IoT-powered solution designed to convert small-scale food
            waste into nutrient-
          </h3>
        </div>
        <Button className="bg-[#4F6F52] hover:bg-[#739072] font-bold w-80 h-15 cursor-pointer text-xl rounded-xl">
          Join Now
        </Button>
      </div>
      <div></div>
    </section>
  );
}
