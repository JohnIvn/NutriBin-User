import React from "react";
import { Button } from "@/components/ui/Button";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  ArrowDownCircle,
} from "lucide-react";

export default function DownloadApp() {
  return (
    <div className="flex flex-col w-full font-sans bg-[#F8F6EF]">
      {/* Header Section */}
      <section className="w-full py-24 px-6 bg-gradient-to-br from-[#739072] to-[#4F6F52] text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight">
                NutriBin Mobile App
              </h1>
              <p className="text-xl text-white/90 mt-6">
                Control, monitor, and optimize your composting system from
                anywhere. Real-time NPK tracking, temperature monitoring, and
                system analytics — all in one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-white/90 text-lg">
              <span className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Android 8.0+
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Secure APK
              </span>
            </div>

            <a
              href="https://www.mediafire.com/file/zf8fuha27ysyfuf/app-release_3.apk/file"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-[#3A4D39] hover:bg-[#ECE3CE] px-10 py-6 rounded-xl text-lg font-bold flex items-center gap-3 shadow-xl">
                <ArrowDownCircle className="w-6 h-6" />
                Download APK (v2.4.1)
              </Button>
            </a>
          </div>

          {/* Right Mockup */}
          <div className="flex justify-center">
            <div className="w-[280px] h-[560px] bg-black rounded-[2.5rem] p-3 shadow-2xl">
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-gray-200">
                <img
                  src="/app-preview.png"
                  alt="NutriBin App Preview"
                  className="w-full h-full "
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Details Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* What's Inside */}
          <div>
            <h2 className="text-4xl font-black text-[#3A4D39] mb-12 text-center">
              What You Get
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white rounded-2xl p-10 shadow-md">
                <CheckCircle className="w-10 h-10 text-[#739072] mb-4" />
                <h3 className="text-2xl font-bold text-[#3A4D39] mb-3">
                  Real-Time Monitoring
                </h3>
                <p className="text-[#3A4D39]/80 text-lg">
                  Live tracking of NPK levels, pH balance, and internal
                  temperature.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 shadow-md">
                <CheckCircle className="w-10 h-10 text-[#739072] mb-4" />
                <h3 className="text-2xl font-bold text-[#3A4D39] mb-3">
                  Smart Alerts
                </h3>
                <p className="text-[#3A4D39]/80 text-lg">
                  Get notified when compost levels require attention.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-10 shadow-md">
                <CheckCircle className="w-10 h-10 text-[#739072] mb-4" />
                <h3 className="text-2xl font-bold text-[#3A4D39] mb-3">
                  Performance Insights
                </h3>
                <p className="text-[#3A4D39]/80 text-lg">
                  Visual analytics to improve fertilizer quality and efficiency.
                </p>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="bg-[#ECE3CE] rounded-3xl p-16 shadow-inner">
            <h2 className="text-4xl font-black text-[#3A4D39] mb-10 text-center">
              How to Install
            </h2>

            <div className="grid md:grid-cols-3 gap-10 text-lg text-[#3A4D39]">
              <div>
                <span className="text-5xl font-black text-[#739072]">01</span>
                <p className="mt-4 font-medium">
                  Download the APK file using the button above.
                </p>
              </div>

              <div>
                <span className="text-5xl font-black text-[#739072]">02</span>
                <p className="mt-4 font-medium">
                  Enable “Install from Unknown Sources” in your Android security
                  settings.
                </p>
              </div>

              <div>
                <span className="text-5xl font-black text-[#739072]">03</span>
                <p className="mt-4 font-medium">
                  Open the downloaded file and follow the installation prompts.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-black text-[#3A4D39]">
              Ready to Upgrade Your Composting Experience?
            </h3>

            <a
              href="https://www.mediafire.com/file/p8t2lg3f25wm8r7/app-release.apk/file"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-[#739072] hover:bg-[#4F6F52] text-white px-12 py-6 rounded-xl text-lg font-bold flex items-center gap-3 mx-auto shadow-lg">
                <Download className="w-6 h-6" />
                Download Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
