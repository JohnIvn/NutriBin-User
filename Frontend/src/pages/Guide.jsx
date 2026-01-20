import React from "react";
import { 
  BookOpen, 
  Download, 
  Printer, 
  Share2, 
  Search, 
  HelpCircle,
  FileText 
} from "lucide-react";

export default function Guide() {
  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section className="max-w-5xl mx-auto px-6 pt-8 space-y-8">
        
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#3A4D39]/10 pb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#3A4D39]/10 rounded-lg text-[#3A4D39]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-bold text-[#739072] uppercase tracking-wider">
                Documentation
              </h2>
            </div>
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              User Guide
            </h1>
            <p className="text-[#4F6F52] font-medium mt-2 text-lg max-w-2xl">
              Complete instructions on how to operate the NutriBin machine, manage sensors, and troubleshoot common issues.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3A4D39]/20 rounded-xl font-bold text-[#3A4D39] hover:bg-[#FAF9F6] transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        {/* document viewer */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#3A4D39]/5 border border-[#3A4D39]/10 overflow-hidden">
          
          {/* toolbar */}
          <div className="px-6 py-3 bg-[#FAF9F6] border-b border-[#ECE3CE] flex items-center justify-between">
            <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-[#739072]" />
               <span className="text-xs font-bold text-[#3A4D39] uppercase">UserGuide.svg</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="h-4 w-px bg-[#ECE3CE]" />
               <button className="p-2 text-[#739072] hover:bg-[#ECE3CE]/50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
               </button>
            </div>
          </div>

          {/* image content */}
          <div className="p-8 md:p-12 bg-[#808080]/5 flex justify-center min-h-[600px]">
            <div className="relative shadow-2xl shadow-black/10 rounded-lg overflow-hidden bg-white max-w-full">
                <img
                    src="/UserGuide.svg"
                    alt="NutriBin User Manual"
                    className="block w-full h-auto max-w-[800px]"
                />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}