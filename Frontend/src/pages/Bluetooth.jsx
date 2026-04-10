import React, { useState, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";

const BluetoothIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
  </svg>
);

const WifiIcon = ({ size = 24, color = "currentColor" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill={color} />
  </svg>
);

const CheckCircleIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LockIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SendIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LeafIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const CpuIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

// Eye icons for password toggle
const EyeIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const steps = [
  {
    number: "01",
    title: "Power On Device",
    desc: "Ensure your NutriBin Arduino is plugged in and the status LED is blinking.",
  },
  {
    number: "02",
    title: "Enable Bluetooth",
    desc: "Use Google Chrome or Edge — Web Bluetooth is not supported in Firefox or Safari.",
  },
  {
    number: "03",
    title: "Scan & Connect",
    desc: "Tap the button below. A browser popup will appear — select your device from the list.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.35 } },
};

export default function Bluetooth() {
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const characteristicRef = useRef(null);

  const connectBluetooth = async () => {
    setConnecting(true);
    try {
      const dev = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
      });
      const server = await dev.gatt.connect();
      const service = await server.getPrimaryService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
      );
      const char = await service.getCharacteristic(
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
      );
      characteristicRef.current = char;
      setDevice(dev);
      setConnected(true);
    } catch (err) {
      console.error("Bluetooth connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const sendWifiCredentials = async () => {
    if (!characteristicRef.current) return;
    const data = JSON.stringify({ ssid, password });
    const encoder = new TextEncoder();
    await characteristicRef.current.writeValue(encoder.encode(data));
    setSent(true);
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center font-sans text-[#3A4D39] pb-12 overflow-x-hidden bg-gradient-to-br from-[#ECE3CE]/30 via-white to-[#FAF9F6]">
      {/* Header */}
      <header className="w-full pt-16 pb-24 text-center bg-transparent relative">
        <Motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-5"
        >
          <div className="bg-[#3A4D39]/[0.08] rounded-full p-4 border border-[#3A4D39]/15">
            <BluetoothIcon size={36} color="#4F6F52" />
          </div>
        </Motion.div>
        <Motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-5xl md:text-6xl font-black text-[#4F6F52] tracking-tight mb-3"
        >
          Device Setup
        </Motion.h1>
        <Motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="text-[#4F6F52]/60 text-lg font-medium"
        >
          Connect your NutriBin hardware over Bluetooth.
        </Motion.p>
      </header>

      {/* Card */}
      <main className="w-full max-w-4xl -mt-16 px-4 sm:px-6 relative z-10">
        <Motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-[#3A4D39]/15 overflow-hidden border border-white/40"
        >
          <AnimatePresence mode="wait">
            {!connected ? (
              <Motion.div
                key="setup"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 md:p-12"
              >
                {/* Badge + title */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={0}
                  className="text-center mb-10"
                >
                  <span className="inline-block px-4 py-1 rounded-full bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xs tracking-widest uppercase mb-3">
                    Setup Guide
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#3A4D39] leading-snug">
                    Before you connect, follow these steps.
                  </h2>
                </Motion.div>

                {/* Steps grid */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={1}
                  className="bg-gradient-to-br from-[#FAF9F6] to-[#ECE3CE]/20 border border-[#ECE3CE] rounded-2xl p-8 mb-8 relative shadow-sm"
                >
                  <div className="hidden md:block absolute top-[68px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-0.5 bg-gradient-to-r from-[#3A4D39]/15 via-[#3A4D39] to-[#3A4D39]/15" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((s, i) => (
                      <Motion.div
                        key={s.number}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={i * 0.5 + 2}
                        className="relative z-10 flex flex-col items-center text-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-white border-[3px] border-[#3A4D39] flex flex-col items-center justify-center shadow-lg shadow-[#3A4D39]/15 mb-4">
                          <span className="text-[9px] font-bold text-[#739072] uppercase leading-none">
                            Step
                          </span>
                          <span className="text-2xl font-black text-[#3A4D39] leading-tight">
                            {s.number}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#3A4D39] mb-1">
                          {s.title}
                        </p>
                        <p className="text-xs text-[#739072] leading-relaxed max-w-[160px]">
                          {s.desc}
                        </p>
                      </Motion.div>
                    ))}
                  </div>
                </Motion.div>

                {/* Info banner */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={4}
                  className="flex items-start gap-3 p-4 bg-[#4F6F52]/5 border border-[#4F6F52]/15 rounded-xl mb-8"
                >
                  <span className="text-[#4F6F52] mt-0.5 shrink-0">
                    <CpuIcon size={16} />
                  </span>
                  <p className="text-sm text-[#739072] leading-relaxed">
                    Make sure your device firmware supports BLE with service
                    UUID{" "}
                    <code className="bg-[#ECE3CE] text-[#3A4D39] px-1.5 py-0.5 rounded text-xs font-mono">
                      4fafc201-…-914b
                    </code>
                    . The device must be in pairing mode before scanning.
                  </p>
                </Motion.div>

                {/* Connect button */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={5}
                >
                  <Motion.button
                    onClick={connectBluetooth}
                    disabled={connecting}
                    whileHover={!connecting ? { scale: 1.02 } : {}}
                    whileTap={!connecting ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-full py-4 rounded-full font-bold text-base text-[#ECE3CE] flex items-center justify-center gap-3 transition-colors duration-200 disabled:cursor-not-allowed"
                    style={{
                      background: connecting ? "#739072" : "#3A4D39",
                      boxShadow: connecting
                        ? "none"
                        : "0 8px 24px rgba(58,77,57,0.25)",
                    }}
                  >
                    {connecting ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-[#ECE3CE]/30 border-t-[#ECE3CE] animate-spin" />
                        Scanning for devices…
                      </>
                    ) : (
                      <>
                        <BluetoothIcon size={20} color="#ECE3CE" />
                        Scan &amp; Connect
                      </>
                    )}
                  </Motion.button>
                </Motion.div>
              </Motion.div>
            ) : (
              <Motion.div
                key="connected"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 md:p-12"
              >
                {/* Connected status bar */}
                <Motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  custom={0}
                  className="flex items-center gap-3 px-4 py-3 bg-[#4F6F52]/8 border border-[#4F6F52]/20 rounded-xl mb-8"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#4F6F52] shadow-[0_0_8px_rgba(79,111,82,0.6)] shrink-0 animate-pulse" />
                  <span className="text-sm text-[#4F6F52] font-semibold">
                    Connected to {device?.name || "NutriBin Arduino"}
                  </span>
                </Motion.div>

                <Motion.hr
                  variants={fadeIn}
                  initial="hidden"
                  animate="show"
                  className="border-[#ECE3CE] mb-8"
                />

                <AnimatePresence mode="wait">
                  {!sent ? (
                    <Motion.div
                      key="form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-10"
                    >
                      {/* Left — intro & tips */}
                      <div className="space-y-6">
                        <Motion.div
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          custom={0}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-1.5 h-7 bg-[#3A4D39] rounded-full" />
                            <h3 className="text-xl font-bold text-[#3A4D39]">
                              Wi-Fi Credentials
                            </h3>
                          </div>
                          <p className="text-sm text-[#739072] leading-relaxed">
                            Enter your Wi-Fi details. These will be sent
                            securely to your NutriBin device via Bluetooth and
                            used to connect it to your local network.
                          </p>
                        </Motion.div>

                        <Motion.div
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          custom={1}
                          className="bg-gradient-to-br from-[#FAF9F6] to-[#ECE3CE]/20 border-2 border-[#ECE3CE] rounded-xl p-5 space-y-3 shadow-sm"
                        >
                          <p className="text-xs font-bold text-[#3A4D39] uppercase tracking-widest mb-1">
                            Tips
                          </p>
                          {[
                            "Use a 2.4 GHz network — the Arduino does not support 5 GHz.",
                            "Ensure you're within range of your router during setup.",
                            "Double-check your password before sending.",
                          ].map((tip, i) => (
                            <Motion.div
                              key={i}
                              variants={fadeUp}
                              initial="hidden"
                              animate="show"
                              custom={i * 0.3 + 2}
                              className="flex items-start gap-2"
                            >
                              <LeafIcon size={13} />
                              <p className="text-xs text-[#739072] leading-relaxed">
                                {tip}
                              </p>
                            </Motion.div>
                          ))}
                        </Motion.div>

                        <Motion.div
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          custom={4}
                          className="flex gap-3 p-4 bg-[#4F6F52]/5 border border-[#4F6F52]/15 rounded-xl"
                        >
                          <span className="text-[#4F6F52] shrink-0 mt-0.5">
                            <LeafIcon size={14} />
                          </span>
                          <p className="text-xs text-[#739072] leading-relaxed">
                            Your credentials are transmitted locally via
                            Bluetooth and are never stored on any server.
                          </p>
                        </Motion.div>
                      </div>

                      {/* Right — form */}
                      <Motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="flex flex-col justify-center space-y-5"
                      >
                        {/* SSID */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#3A4D39] uppercase tracking-widest mb-2.5">
                            Network Name (SSID)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#739072]">
                              <WifiIcon size={16} />
                            </span>
                            <input
                              type="text"
                              placeholder="e.g. HomeNetwork_2.4G"
                              value={ssid}
                              onChange={(e) => setSsid(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border-2 border-[#ECE3CE] rounded-xl text-sm text-[#3A4D39] placeholder-[#C5B99A] outline-none transition-all duration-200 focus:border-[#4F6F52] focus:bg-white focus:shadow-md shadow-sm"
                            />
                          </div>
                        </div>

                        {/* Password with eye toggle */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#3A4D39] uppercase tracking-widest mb-2.5">
                            Password
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#739072]">
                              <LockIcon size={16} />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter Wi-Fi password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-11 py-3 bg-[#FAF9F6] border-2 border-[#ECE3CE] rounded-xl text-sm text-[#3A4D39] placeholder-[#C5B99A] outline-none transition-all duration-200 focus:border-[#4F6F52] focus:bg-white focus:shadow-md shadow-sm"
                            />
                            <Motion.button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 17,
                              }}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#739072] hover:text-[#4F6F52] transition-colors duration-150 focus:outline-none"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {showPassword ? (
                                  <Motion.span
                                    key="eye-off"
                                    initial={{ opacity: 0, rotate: -15 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 15 }}
                                    transition={{ duration: 0.18 }}
                                    style={{ display: "flex" }}
                                  >
                                    <EyeOffIcon size={16} />
                                  </Motion.span>
                                ) : (
                                  <Motion.span
                                    key="eye-on"
                                    initial={{ opacity: 0, rotate: 15 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -15 }}
                                    transition={{ duration: 0.18 }}
                                    style={{ display: "flex" }}
                                  >
                                    <EyeIcon size={16} />
                                  </Motion.span>
                                )}
                              </AnimatePresence>
                            </Motion.button>
                          </div>
                        </div>

                        {/* Send button */}
                        <Motion.button
                          onClick={sendWifiCredentials}
                          disabled={!ssid || !password}
                          whileHover={ssid && password ? { scale: 1.02 } : {}}
                          whileTap={ssid && password ? { scale: 0.97 } : {}}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 mt-2"
                          style={{
                            background:
                              !ssid || !password ? "#ECE3CE" : "#3A4D39",
                            color: !ssid || !password ? "#739072" : "#ECE3CE",
                            cursor:
                              !ssid || !password ? "not-allowed" : "pointer",
                            boxShadow:
                              !ssid || !password
                                ? "none"
                                : "0 8px 24px rgba(58,77,57,0.25)",
                          }}
                        >
                          <SendIcon size={17} />
                          Send to NutriBin
                        </Motion.button>
                      </Motion.div>
                    </Motion.div>
                  ) : (
                    <Motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="text-center py-10 max-w-md mx-auto"
                    >
                      <Motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                          delay: 0.1,
                        }}
                        className="w-20 h-20 rounded-full bg-[#4F6F52]/10 border-2 border-[#4F6F52]/30 flex items-center justify-center text-[#4F6F52] mx-auto mb-6"
                      >
                        <CheckCircleIcon size={36} />
                      </Motion.div>
                      <Motion.h4
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="text-2xl font-black text-[#3A4D39] mb-3"
                      >
                        Credentials Sent!
                      </Motion.h4>
                      <Motion.p
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={2}
                        className="text-sm text-[#739072] leading-relaxed"
                      >
                        Your NutriBin device received the Wi-Fi details and is
                        attempting to connect to{" "}
                        <strong className="text-[#3A4D39]">{ssid}</strong>. The
                        status LED will turn solid once it's online.
                      </Motion.p>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>
            )}
          </AnimatePresence>
        </Motion.div>
      </main>

      <Motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-10 text-sm text-[#739072] font-medium"
      >
        &copy; 2026 NutriBin System. All rights reserved.
      </Motion.footer>
    </div>
  );
}
