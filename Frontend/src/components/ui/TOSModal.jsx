import React from "react";
import { Check, X } from "lucide-react";
import Tos from "@/pages/TOS";

export default function TOSModal({ open, onClose, onAccept }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white shadow hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* scrollable content */}
        <div className="overflow-y-auto">
          <Tos />
        </div>

        {/* sticky action bar */}
        <div className="border-t border-[#ECE3CE] p-6 flex flex-col sm:flex-row justify-center gap-6 bg-white">
          <button
            onClick={onAccept}
            className="bg-[#3A4D39] hover:bg-[#4F6F52] text-white h-14 px-12 text-lg rounded-full font-bold shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center"
          >
            <Check className="mr-2 h-6 w-6" /> I Accept the Terms
          </button>

          <button
            onClick={onClose}
            className="border-2 border-[#ECE3CE] text-[#739072] hover:text-[#3A4D39] hover:border-[#3A4D39] hover:bg-[#ECE3CE]/20 h-14 px-12 text-lg rounded-full font-bold transition-all flex items-center justify-center"
          >
            Decline
          </button>
        </div>

      </div>
    </div>
  );
}
