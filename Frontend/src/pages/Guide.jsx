import React from "react";
import { Download, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContextHook";

export default function Guide() {
  const { user } = useUser();

  const handleShare = async () => {
    const shareData = {
      title: "NutriBin User Guide",
      text: "Check out the NutriBin User Guide",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);

        // optional success feedback after native share
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(shareData.url);

        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      // IMPORTANT: ignore cancel action (not an error)
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
  };

  return (
    <div className="min-h-screen w-full bg-[#ECE3CE]/20 font-sans pb-20">
      <section
        className={`max-w-5xl mx-auto px-6 space-y-8 ${user ? "pt-8" : "pt-32"}`}
      >
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 border-l-4 border-[#3A4D39] pl-6 py-2">
            <h1 className="text-4xl font-black text-[#3A4D39] tracking-tight">
              User Guide
            </h1>
            <p className="text-[#4F6F52] font-medium mt-1 text-lg max-w-2xl">
              Complete instructions on how to operate the NutriBin machine,
              manage sensors, and troubleshoot common issues.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3A4D39]/20 rounded-xl font-bold text-[#3A4D39] hover:bg-[#FAF9F6] transition-colors shadow-sm"
            >
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
              <span className="text-xs font-bold text-[#3A4D39] uppercase">
                UserGuide.svg
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-px bg-[#ECE3CE]" />
              <button
                onClick={handleShare}
                className="p-2 text-[#739072] hover:bg-[#ECE3CE]/50 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* image */}
          <div className="p-8 md:p-12 bg-[#808080]/5 flex justify-center min-h-150">
            <div className="relative shadow-2xl shadow-black/10 rounded-lg overflow-hidden bg-white max-w-full">
              <img
                src="/UserGuide.svg"
                alt="NutriBin User Manual"
                className="block w-full h-auto max-w-200"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
