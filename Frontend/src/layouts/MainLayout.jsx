import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import PageRouter from "./PageRouter";
import { useUser } from "@/contexts/UserContextHook";
import GetBaseUrl from "@/utils/GetBaseUrl";

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const socketRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [banNotification, setBanNotification] = useState(null);
  const [countdown, setCountdown] = useState(15);

  // ─── Handle Logout ────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    console.log("🚪 Logging out user...");
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // ─── Initialize WebSocket Connection ────────────────────────
  useEffect(() => {
    if (!user?.customer_id) return;

    const socket = io(GetBaseUrl(), { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to ban notification service");
      // Join the user ban room
      socket.emit("joinUserBanRoom", { customerId: user.customer_id });
    });

    socket.on("user_ban_notification", (payload) => {
      console.log("🚫 Ban notification received:", payload);
      setBanNotification(payload);
      setCountdown(15);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user?.customer_id]);

  // ─── Handle Countdown Timer ────────────────────────────────────
  useEffect(() => {
    if (!banNotification) return;

    if (countdown <= 0) {
      // Auto logout when countdown reaches 0
      handleLogout();
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [banNotification, countdown, handleLogout]);

  // ─── Ban Notification Modal (Imperceptible to DOM removal) ─────
  if (banNotification) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="mb-4">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Account Banned
            </h2>
          </div>

          <div className="mb-6 text-gray-700">
            <p className="mb-4">
              Your account has been <strong>banned</strong> and you will be
              logged out automatically.
            </p>
            <div className="text-sm text-gray-600">
              <p>Account Details:</p>
              <p className="font-semibold mt-2">
                {banNotification.firstName} {banNotification.lastName}
              </p>
              <p className="text-xs text-gray-500">{banNotification.email}</p>
            </div>
          </div>

          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Logging out in:</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{countdown}s</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Logout Now
          </button>

          <p className="text-xs text-gray-500 mt-4">
            This action cannot be undone. Please contact support if you believe
            this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-20 w-full flex flex-col justify-start items-center h-auto bg-[#FFF5E4]">
      <PageRouter />
    </section>
  );
}
