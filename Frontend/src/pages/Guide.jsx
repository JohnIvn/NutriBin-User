import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Share2,
  FileText,
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContextHook";
import { motion as Motion } from "framer-motion";

export default function Guide() {
  const { user } = useUser();
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "NutriBin User Guide",
      text: "Check out the NutriBin User Guide",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Share failed:", err);
        toast.error("Failed to share link");
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/UserGuide.svg";
    link.download = "NutriBin_User_Guide.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6] font-sans">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${user ? "py-8 sm:py-12" : "pt-32 pb-20"}`}
      >
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
              <div className="inline-block mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#4F6F52]/10 rounded-full">
                  <BookOpen className="w-4 h-4 text-[#4F6F52]" />
                  <span className="text-xs font-bold text-[#4F6F52] uppercase tracking-wide">
                    Documentation
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[#3A4D39] tracking-tight mb-2">
                User Guide
              </h1>
              <p className="text-[#739072] font-medium text-base sm:text-lg max-w-2xl">
                Complete instructions on how to operate the NutriBin machine,
                manage sensors, and troubleshoot common issues.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#3A4D39]/20 rounded-xl font-bold text-[#3A4D39] hover:bg-[#FAF9F6] hover:border-[#4F6F52]/40 active:scale-95 transition-all duration-200 shadow-sm"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-3 bg-[#4F6F52] border-2 border-[#4F6F52] rounded-xl font-bold text-white hover:bg-[#3A4D39] hover:border-[#3A4D39] active:scale-95 transition-all duration-200 shadow-lg shadow-[#4F6F52]/20"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </Motion.div>

        {/* Document Viewer */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3A4D39]/10 overflow-hidden ${
            isFullscreen ? "fixed inset-4 z-50" : ""
          }`}
        >
          {/* Toolbar */}
          <div className="px-6 py-4 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-[#4F6F52]" />
                </div>
                <div>
                  <span className="text-sm font-bold text-[#3A4D39]">
                    UserGuide.svg
                  </span>
                  <p className="text-xs text-[#739072] font-medium">
                    Official NutriBin Documentation
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white border border-[#ECE3CE] rounded-lg">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    className="p-1.5 text-[#739072] hover:bg-[#ECE3CE]/50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-bold text-[#3A4D39] min-w-[50px] text-center">
                    {zoom}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                    className="p-1.5 text-[#739072] hover:bg-[#ECE3CE]/50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-8 w-px bg-[#ECE3CE]" />

                {/* Fullscreen Toggle */}
                <button
                  onClick={handleFullscreen}
                  className="p-2 text-[#739072] hover:bg-[#ECE3CE]/50 rounded-lg transition-colors"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Image Viewer */}
          <div
            className={`bg-gradient-to-br from-[#ECE3CE]/20 to-[#FAF9F6]/50 flex justify-center items-center ${
              isFullscreen
                ? "h-[calc(100%-80px)] overflow-auto"
                : "min-h-[600px] p-8 md:p-12"
            }`}
          >
            <div className="relative shadow-2xl rounded-2xl overflow-hidden bg-white border-2 border-[#3A4D39]/10">
              <Motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src="/UserGuide.svg"
                alt="NutriBin User Manual"
                className="block w-auto h-auto"
                style={{
                  maxWidth: isFullscreen ? "none" : "100%",
                  width: `${zoom}%`,
                  imageRendering: "crisp-edges",
                }}
              />
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="px-6 py-3 bg-gradient-to-r from-[#FAF9F6] to-[#ECE3CE]/50 border-t border-[#3A4D39]/10">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#739072]">
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-medium">Latest Version</span>
                </div>
                <div className="h-3 w-px bg-[#ECE3CE]" />
                <span className="text-[#739072] font-medium">
                  Last Updated: {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[#739072]">
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="font-medium">Quick Access Guide</span>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Quick Actions Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Getting Started → /about */}
          <Link to="/about">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-[#3A4D39]/10 hover:border-[#4F6F52]/40 transition-all duration-200 hover:shadow-lg group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#4F6F52]/10 rounded-xl group-hover:bg-[#4F6F52]/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-[#4F6F52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3A4D39] text-sm mb-1">
                    Getting Started
                  </h3>
                  <p className="text-xs text-[#739072]">
                    Learn the basics of NutriBin operation
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Troubleshooting → /faqs */}
          <Link to="/faqs">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-[#3A4D39]/10 hover:border-[#4F6F52]/40 transition-all duration-200 hover:shadow-lg group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#4F6F52]/10 rounded-xl group-hover:bg-[#4F6F52]/20 transition-colors">
                  <FileText className="w-5 h-5 text-[#4F6F52]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#3A4D39] text-sm mb-1">
                    Troubleshooting
                  </h3>
                  <p className="text-xs text-[#739072]">
                    Common issues and solutions
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Maintenance Guide (no link change) */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-[#3A4D39]/10 hover:border-[#4F6F52]/40 transition-all duration-200 hover:shadow-lg group cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#4F6F52]/10 rounded-xl group-hover:bg-[#4F6F52]/20 transition-colors">
                <Download className="w-5 h-5 text-[#4F6F52]" />
              </div>
              <div>
                <h3 className="font-bold text-[#3A4D39] text-sm mb-1">
                  Maintenance Guide
                </h3>
                <p className="text-xs text-[#739072]">
                  Keep your system running smoothly
                </p>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
