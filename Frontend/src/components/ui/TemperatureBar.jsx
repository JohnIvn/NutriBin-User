import React, { useEffect, useState } from "react";

export default function TempBar({ temperature, maxTemp }) {
    const [fillPercent, setFillPercent] = useState(0)

    useEffect(() => {
        const percentage = Math.min((temperature / maxTemp) * 100, 100)
        const timeout = setTimeout(() => setFillPercent(percentage), 50)
        return () => clearTimeout(timeout)
    }, [temperature, maxTemp])

    return (
        <div className="flex items-center gap-5 pt-4">
            <div className="relative w-10 h-64 bg-white border border-black overflow-hidden">
                <div className="absolute bottom-0 w-full bg-orange-500  transition-all duration-700 ease-out"
                    style={{height: `${fillPercent}%`}} />
            </div>
            <div className="flex flex-col text-center">
                <h1 className="font-bold text-black text-3xl">{temperature}°C</h1>
                <h1 className="font-bold text-black text-3xl">86°F</h1>
            </div>
        </div>
    )
}