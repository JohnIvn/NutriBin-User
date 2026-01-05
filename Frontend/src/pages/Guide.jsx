import React from "react";

export default function Guide() {
    return (
        <section className="flex flex-col w-[95vw] h-auto gap-4 justify-between m-5">
            <div>
                <h1 className="text-3xl font-bold text-black">Guide</h1>
                <hr className="border-t-2 border-gray-400 w-full" />
            </div>
            <img
            src="/UserGuide.svg"
            alt="User Guide"
            className="block shadow-2xl"
            />
        </section>
    )
}