import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { 
  Video, 
  History, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical 
} from "lucide-react";

export default function Cameras() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        
        {/* header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              Camera Feeds
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg">
              Internal machine monitoring and anomaly detection logs.
            </p>
          </div>
          <div className="px-4 py-2 bg-white border border-[#3A4D39]/10 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600 animate-pulse" />
              <span className="font-bold text-[#3A4D39] text-sm">
                System Recording
              </span>
            </div>
          </div>
        </div>

        {/* main grid content */}
        <div className="grid grid-cols-1 gap-8 pb-20">
          
          {/* camera 1 */}
          <div className="flex flex-col bg-white rounded-3xl shadow-lg shadow-[#3A4D39]/5 border border-[#3A4D39]/10 overflow-hidden">
            {/* card header */}
            <div className="px-6 py-4 border-b border-[#ECE3CE] bg-[#FAF9F6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                   <h2 className="text-base font-bold text-[#3A4D39]">Internal Cam 01</h2>
                   <p className="text-xs text-[#739072]">Sorting Chamber</p>
                </div>
              </div>
            </div>

            {/* video player */}
            <div className="relative w-full aspect-video bg-black group">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a] text-[#ECE3CE]/50 gap-3">
                  <div className="w-8 h-8 border-2 border-[#ECE3CE]/30 border-t-[#ECE3CE] rounded-full animate-spin" />
                  <span className="text-sm font-mono tracking-widest uppercase">Connecting Feed...</span>
                </div>
              ) : (
                <>
                  <video controls autoPlay muted loop className="w-full h-full object-cover">
                     {/* placeholder src - ensure you have a valid path or use a placeholder image for design testing */}
                    <source src="/video.mp4" type="video/mp4" />
                  </video>
                  {/* live Badge */}
                  <div className="absolute top-4 left-4 px-2 py-1 bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 shadow-sm backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                  </div>
                </>
              )}
            </div>

            {/* logs table */}
            <div className="flex-1 p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-[#739072]" />
                <h3 className="text-sm font-bold text-[#3A4D39] uppercase tracking-wide">Detection Log</h3>
              </div>
              
              <div className="rounded-xl border border-[#ECE3CE] overflow-hidden">
                <Table>
                  <TableHeader className="bg-[#3A4D39]">
                    <TableRow className="hover:bg-[#3A4D39] border-none">
                      <TableHead className="text-[#ECE3CE] font-bold w-[120px]">Date</TableHead>
                      <TableHead className="text-[#ECE3CE] font-bold w-[100px]">Time</TableHead>
                      <TableHead className="text-[#ECE3CE] font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {[1, 2, 3].map((_, i) => (
                      <TableRow key={i} className="hover:bg-[#FAF9F6] border-b border-[#ECE3CE]">
                        <TableCell className="font-mono text-sm text-[#4F6F52]">2025-09-12</TableCell>
                        <TableCell className="font-mono text-sm text-[#4F6F52]">09:0{i} AM</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                            <CheckCircle2 className="w-3 h-3" /> No Anomaly
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* anomaly row */}
                    <TableRow className="hover:bg-[#FAF9F6] border-b border-[#ECE3CE]">
                        <TableCell className="font-mono text-sm text-[#4F6F52]">2025-09-12</TableCell>
                        <TableCell className="font-mono text-sm text-[#4F6F52]">09:15 AM</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                            <AlertCircle className="w-3 h-3" /> Foreign Object
                          </span>
                        </TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
}