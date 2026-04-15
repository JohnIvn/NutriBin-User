import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
  BellIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContextHook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Requests from "@/utils/Requests";
import { io } from "socket.io-client";
import getBaseUrl from "@/utils/GetBaseUrl";
import { RefreshCw, Server, QrCode } from "lucide-react";
import jsQR from "jsqr";

// Modal for QR Code Display (Similar to NutriBin Server)
const QRCodeModal = ({ isOpen, onClose, qrData, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <Motion.div
            {...ANIMATION_VARIANTS.modal.overlay}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80]"
          />

          {/* Modal Content */}
          <Motion.div
            {...ANIMATION_VARIANTS.modal.content}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl z-[81] overflow-hidden"
          >
            <div className="px-6 py-5 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#3A4D39] flex items-center gap-2">
                  <QrCode className="w-6 h-6" />
                  Machine QR Code
                </h2>
                <Motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#3A4D39]/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-[#3A4D39]" />
                </Motion.button>
              </div>
              <p className="text-sm text-[#3A4D39]/70 mt-1">
                Scan this to register this machine in the app
              </p>
            </div>

            <div className="p-8 flex flex-col items-center gap-6">
              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <RefreshCw className="w-10 h-10 text-[#3A4D39] animate-spin" />
                  <p className="text-[#3A4D39]/60 font-bold text-sm">
                    Generating QR Code...
                  </p>
                </div>
              ) : qrData?.qrCode ? (
                <>
                  <div className="bg-white p-4 rounded-2xl border-2 border-[#3A4D39]/10 shadow-inner">
                    <img
                      src={qrData.qrCode}
                      alt="Machine QR Code"
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <div className="text-center w-full space-y-4">
                    <div>
                      <p className="text-xs font-black text-[#3A4D39]/40 uppercase tracking-widest mb-1">
                        Serial ID (QR Data)
                      </p>
                      <p className="font-mono font-bold text-[#3A4D39] bg-[#ECE3CE]/30 px-3 py-2 rounded-lg text-sm break-all">
                        {qrData.serial}
                      </p>
                    </div>

                    {qrData.machineId && (
                      <div className="pt-2 border-t border-[#3A4D39]/5">
                        <p className="text-xs font-black text-[#3A4D39]/40 uppercase tracking-widest mb-1">
                          Machine ID (Internal)
                        </p>
                        <p className="font-mono text-[#3A4D39]/60 bg-[#ECE3CE]/10 px-3 py-1.5 rounded-lg text-xs break-all">
                          {qrData.machineId}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-red-500 font-bold">Failed to generate QR</p>
              )}
            </div>

            <div className="px-6 py-4 bg-[#ECE3CE]/20 border-t border-[#3A4D39]/10">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold bg-[#3A4D39] text-[#ECE3CE] 
                         hover:bg-[#4F6F52] transition-all duration-200"
              >
                Done
              </Motion.button>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Emergency Modal Component
const EmergencyModal = ({
  isOpen,
  onClose,
  countdown,
  isConfirming,
  message,
  messageType,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            {...ANIMATION_VARIANTS.modal.overlay}
            onClick={messageType === "error" ? onClose : undefined}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          />

          <Motion.div
            {...ANIMATION_VARIANTS.modal.content}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[91] overflow-hidden"
          >
            {/* Header */}
            <div
              className={`px-6 py-5 bg-gradient-to-br border-b ${
                messageType === "success"
                  ? "from-green-50 to-green-50/50 border-green-200"
                  : messageType === "error"
                    ? "from-red-50 to-red-50/50 border-red-200"
                    : "from-red-50 to-red-50/50 border-red-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2
                  className={`text-xl font-black flex items-center gap-2 ${
                    messageType === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {messageType === "success"
                    ? "Success"
                    : messageType === "error"
                      ? "Error"
                      : "Emergency Mode"}
                </h2>
                {(messageType === "error" || messageType === "success") && (
                  <Motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`p-1.5 rounded-lg transition-colors ${
                      messageType === "success"
                        ? "hover:bg-green-100"
                        : "hover:bg-red-100"
                    }`}
                    aria-label="Close"
                  >
                    <XMarkIcon
                      className={`w-5 h-5 ${
                        messageType === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </Motion.button>
                )}
                {messageType === "idle" && (
                  <Motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    disabled={isConfirming}
                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Cancel emergency"
                  >
                    <XMarkIcon className="w-5 h-5 text-red-600" />
                  </Motion.button>
                )}
              </div>
              {messageType === "idle" && (
                <p className="text-sm text-red-600/70 mt-1">
                  Press X to cancel
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-6">
              {messageType === "idle" && (
                <>
                  <Motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-4 border-red-200"
                  >
                    <span className="text-5xl font-black text-red-600">
                      {countdown}
                    </span>
                  </Motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-[#3A4D39]">
                      Emergency activated in
                    </p>
                    <p className="text-sm text-[#3A4D39]/70">
                      Machine will enter emergency mode in {countdown} second
                      {countdown !== 1 ? "s" : ""}
                    </p>
                  </div>
                </>
              )}

              {messageType === "success" && (
                <>
                  <Motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-200"
                  >
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-green-600">
                      Emergency Activated
                    </p>
                    <p className="text-sm text-[#3A4D39]/70">{message}</p>
                  </div>
                </>
              )}

              {messageType === "error" && (
                <>
                  <Motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100 border-4 border-red-200"
                  >
                    <XMarkIcon className="w-12 h-12 text-red-600" />
                  </Motion.div>

                  <div className="text-center space-y-2">
                    <p className="text-lg font-bold text-red-600">
                      Failed to Activate
                    </p>
                    <p className="text-sm text-[#3A4D39]/70">{message}</p>
                  </div>
                </>
              )}

              {messageType === "idle" && countdown > 0 && (
                <Motion.div
                  key={countdown}
                  initial={{ width: "100%" }}
                  animate={{ width: 0 }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-red-500"
                />
              )}
            </div>

            {/* Footer Info */}
            <div
              className={`px-6 py-4 border-t ${
                messageType === "success"
                  ? "bg-green-50 border-green-100"
                  : messageType === "error"
                    ? "bg-red-50 border-red-100"
                    : "bg-red-50 border-red-100"
              }`}
            >
              <p
                className={`text-xs text-center font-medium ${
                  messageType === "success"
                    ? "text-green-600/70"
                    : messageType === "error"
                      ? "text-red-600/70"
                      : "text-red-600/70"
                }`}
              >
                {messageType === "idle"
                  ? "Click the X button above to cancel before countdown reaches zero"
                  : messageType === "success"
                    ? "The machine has entered emergency mode"
                    : "Please try again or contact support"}
              </p>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// No Machine Modal Component
const NoMachineModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            {...ANIMATION_VARIANTS.modal.overlay}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          />

          <Motion.div
            {...ANIMATION_VARIANTS.modal.content}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[91] overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-br from-amber-50 to-amber-50/50 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-amber-600">
                  No Machine Selected
                </h2>
                <Motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5 text-amber-600" />
                </Motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center gap-6">
              <Motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-200"
              >
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </Motion.div>

              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-[#3A4D39]">
                  Please select a machine
                </p>
                <p className="text-sm text-[#3A4D39]/70">
                  You need to select an active machine before you can trigger
                  emergency mode. Choose a machine from the machine selector.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 rounded-xl font-bold bg-[#3A4D39] text-[#ECE3CE] 
                         hover:bg-[#4F6F52] transition-all duration-200"
              >
                OK
              </Motion.button>
            </div>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Constants
const NAVIGATION = {
  public: {
    left: [
      { name: "Home", href: "/" },
      { name: "Guide", href: "/guide" },
    ],
  },
  authenticated: {
    left: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Cameras", href: "/cameras" },
      { name: "Fertilizer", href: "/fertilizer" },
      { name: "Analytics", href: "/data" },
    ],
    right: [
      { name: "Logs", href: "/logs" },
      { name: "Repairs", href: "/repairs" },
      { name: "Support", href: "/support" },
      { name: "Bin Settings", href: "/modules" },
      { name: "Firmware", href: "/firmware" },
    ],
  },
};

const ANIMATION_VARIANTS = {
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    content: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
    },
  },
  drawer: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    content: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
  },
  userMenu: {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.95 },
  },
  notificationMenu: {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.95 },
  },
};

// Extracted Components
const NavLink = ({ to, children, currentPath, isEmergency = false }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`relative group font-bold text-sm uppercase tracking-wider 
               transition-colors py-1 ${
                 isEmergency
                   ? "text-white hover:text-gray-200"
                   : "text-[#3A4D39] hover:text-[#4F6F52]"
               }`}
    >
      {children}
      <Motion.span
        initial={false}
        animate={{
          width: isActive ? "100%" : "0%",
          opacity: isActive ? 1 : 0,
        }}
        className={`absolute -bottom-1 left-0 h-0.5 group-hover:w-full 
                 group-hover:opacity-100 transition-all duration-300 ${
                   isEmergency ? "bg-white" : "bg-[#3A4D39]"
                 }`}
      />
    </Link>
  );
};

const UserAvatar = ({ user, getInitials }) => (
  <Avatar className="size-9 ring-2 ring-[#3A4D39]/20 group-hover:ring-[#3A4D39]/40 transition-all">
    <AvatarImage
      className="object-cover"
      src={
        user.avatar ||
        user.profile_photo ||
        user.profile_image ||
        user.photo ||
        ""
      }
      alt={user.first_name}
    />
    <AvatarFallback className="bg-[#4F6F52] text-[#ECE3CE] font-bold text-xs">
      {getInitials(user.first_name, user.last_name)}
    </AvatarFallback>
  </Avatar>
);

const NotificationButton = ({ notificationMenuRef }) => {
  const { selectedMachine } = useUser();
  const machineId = selectedMachine?.machine_id;
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    if (!machineId) return;

    const baseUrl = getBaseUrl();
    const socket = io(baseUrl, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("subscribeToMachine", machineId);
    });

    socket.on("notification_created", (n) => {
      setNotifications((prev) => [
        {
          id: n.notification_id,
          title: n.header,
          message: n.description || n.subheader || "",
          timestamp: n.date_created ? new Date(n.date_created) : new Date(),
          read: n.resolved || false,
          type: n.type,
        },
        ...prev,
      ]);
    });

    socket.on("notification_resolved", (data) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== data.notification_id),
      );
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err);
    });

    return () => {
      console.log("[Socket] Disconnecting...");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [machineId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert":
        return "bg-red-100 border-red-200 text-red-700";
      case "warning":
        return "bg-yellow-100 border-yellow-200 text-yellow-700";
      case "info":
        return "bg-blue-100 border-blue-200 text-blue-700";
      default:
        return "bg-[#ECE3CE] border-[#3A4D39]/20 text-[#3A4D39]";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationOpen &&
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      const handleEsc = (e) => {
        if (e.key === "Escape") setNotificationOpen(false);
      };
      document.addEventListener("keydown", handleEsc);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [notificationOpen, notificationMenuRef]);

  return (
    <div className="relative" ref={notificationMenuRef}>
      <Motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          setNotificationOpen((prev) => !prev);
        }}
        className="relative p-2.5 rounded-xl bg-[#3A4D39]/5 hover:bg-[#3A4D39]/10
                 transition-all duration-200 group"
        aria-label="Notifications"
      >
        <BellIcon className="w-5 h-5 text-[#3A4D39]" />
        {unreadCount > 0 && (
          <Motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                     bg-red-500 text-white text-[10px] font-bold
                     rounded-full flex items-center justify-center
                     ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Motion.span>
        )}
      </Motion.button>

      <AnimatePresence>
        {notificationOpen && (
          <Motion.div
            {...ANIMATION_VARIANTS.notificationMenu}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 max-h-[32rem] bg-white border border-[#3A4D39]/10 
                     shadow-xl rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#3A4D39]/10 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#3A4D39]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-[#3A4D39]/60 mt-0.5">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#3A4D39] hover:text-[#4F6F52] 
                           transition-colors underline-offset-2 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <BellIcon className="w-12 h-12 text-[#3A4D39]/20 mb-3" />
                  <p className="text-sm font-medium text-[#3A4D39]/60">
                    No notifications
                  </p>
                  <p className="text-xs text-[#3A4D39]/40 mt-1">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#3A4D39]/5">
                  {notifications.map((notification, index) => (
                    <Motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 hover:bg-[#ECE3CE]/30 transition-colors cursor-pointer
                                ${!notification.read ? "bg-[#ECE3CE]/20" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-[#3A4D39] truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-[#4F6F52] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#3A4D39]/70 line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border
                                        ${getTypeColor(notification.type)}`}
                            >
                              {notification.type}
                            </span>
                            <span className="text-[10px] text-[#3A4D39]/50">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <Motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            clearNotification(notification.id);
                          }}
                          className="p-1 rounded-lg hover:bg-[#3A4D39]/10 transition-colors flex-shrink-0"
                          aria-label="Clear notification"
                        >
                          <XMarkIcon className="w-4 h-4 text-[#3A4D39]/40" />
                        </Motion.button>
                      </div>
                    </Motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-[#3A4D39]/10 bg-[#ECE3CE]/30">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-xs font-semibold text-[#3A4D39] hover:text-[#4F6F52] 
                           transition-colors text-center py-1"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AddMachineModal = ({
  isOpen,
  onClose,
  machineSerial,
  setMachineSerial,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleQRUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setMachineSerial(code.data);
        } else {
          alert("No QR code found in image.");
        }
      };
    };

    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            {...ANIMATION_VARIANTS.modal.overlay}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          <Motion.div
            {...ANIMATION_VARIANTS.modal.content}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[61] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#3A4D39]">
                  Add Machine
                </h2>
                <Motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#3A4D39]/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 text-[#3A4D39]" />
                </Motion.button>
              </div>
              <p className="text-sm text-[#3A4D39]/70 mt-1">
                Enter your machine's serial number to add it to your account
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmit} className="px-6 py-6">
              <div className="mb-4">
                <label
                  htmlFor="machine-serial"
                  className="block text-sm font-semibold text-[#3A4D39] mb-2"
                >
                  Machine Serial Number
                </label>
                <input
                  id="machine-serial"
                  type="text"
                  value={machineSerial}
                  onChange={(e) => setMachineSerial(e.target.value)}
                  placeholder="e.g., NB-2024-001"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3A4D39]/20 
                           text-[#3A4D39] font-medium
                           focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/50 focus:border-[#3A4D39]/50 focus:shadow-lg focus:shadow-[#3A4D39]/10
                           placeholder:text-[#3A4D39]/40 transition-all duration-300"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />

                <div className="mt-3">
                  <label className="block text-xs font-semibold text-[#3A4D39]/70 mb-2">
                    Or upload QR code image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQRUpload}
                    className="block w-full text-sm text-[#3A4D39]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-bold
                    file:bg-[#3A4D39] file:text-[#ECE3CE]
                    hover:file:bg-[#4F6F52]
                    cursor-pointer"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-sm"
                  role="alert"
                >
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                    {error}
                  </p>
                </Motion.div>
              )}

              {/* Success Message */}
              {success && (
                <Motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl shadow-sm"
                  role="alert"
                >
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                    {success}
                  </p>
                </Motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-[#3A4D39] 
                           bg-[#ECE3CE] hover:bg-[#ECE3CE]/70 
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-[#ECE3CE] 
                           bg-[#3A4D39] hover:bg-[#4F6F52] 
                           shadow-lg shadow-[#3A4D39]/20 hover:shadow-xl hover:shadow-[#3A4D39]/30
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-5 h-5" />
                      Add Machine
                    </>
                  )}
                </Motion.button>
              </div>
            </form>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const RenameMachineModal = ({
  isOpen,
  onClose,
  machine,
  newName,
  setNewName,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => {
  useEffect(() => {
    if (isOpen && machine) {
      setNewName(machine.nickname || "");
    }
  }, [isOpen, machine, setNewName]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && machine && (
        <>
          <Motion.div
            {...ANIMATION_VARIANTS.modal.overlay}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
          />

          <Motion.div
            {...ANIMATION_VARIANTS.modal.content}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[71] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-[#3A4D39]">
                  Rename Machine
                </h2>
                <Motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#3A4D39]/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 text-[#3A4D39]" />
                </Motion.button>
              </div>
              <p className="text-sm text-[#3A4D39]/70 mt-1">
                Give your machine a custom nickname
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={onSubmit} className="px-6 py-6">
              <div className="mb-4">
                <label
                  htmlFor="machine-name"
                  className="block text-sm font-semibold text-[#3A4D39] mb-2"
                >
                  Machine Name
                </label>
                <input
                  id="machine-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Kitchen Garden, Greenhouse #1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#3A4D39]/20 
                           text-[#3A4D39] font-medium
                           focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/50 focus:border-[#3A4D39]/50 focus:shadow-lg focus:shadow-[#3A4D39]/10
                           placeholder:text-[#3A4D39]/40 transition-all duration-300"
                  required
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-[#3A4D39]/50 mt-2">
                  Serial: {machine.machine_id}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-sm"
                  role="alert"
                >
                  <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                    {error}
                  </p>
                </Motion.div>
              )}

              {/* Success Message */}
              {success && (
                <Motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl shadow-sm"
                  role="alert"
                >
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                    {success}
                  </p>
                </Motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-[#3A4D39] 
                           bg-[#ECE3CE] hover:bg-[#ECE3CE]/70 
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  Cancel
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-[#ECE3CE] 
                           bg-[#3A4D39] hover:bg-[#4F6F52] 
                           shadow-lg shadow-[#3A4D39]/20 hover:shadow-xl hover:shadow-[#3A4D39]/30
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="w-5 h-5" />
                      Save Name
                    </>
                  )}
                </Motion.button>
              </div>
            </form>
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MachineSelectionModal = ({
  isOpen,
  onClose,
  user,
  selectedMachine,
  setSelectedMachine,
  setAddMachineOpen,
  setRenameModalOpen,
  setMachineToRename,
  onDeleteMachine,
  onShowQR,
  isDeleting,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);

  const handleSelect = (machine) => {
    setSelectedMachine(machine);
    localStorage.setItem("selectedMachine", JSON.stringify(machine));
    onClose();
    window.location.reload();
  };

  const handleRenameClick = (e, machine) => {
    e.stopPropagation();
    setMachineToRename(machine);
    setRenameModalOpen(true);
    onClose();
  };

  const handleDeleteClick = (e, machine) => {
    e.stopPropagation();
    setMachineToDelete(machine);
    setDeleteConfirmOpen(true);
  };

  const handleQRClick = (e, machine) => {
    e.stopPropagation();
    onShowQR(machine);
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (machineToDelete) {
      await onDeleteMachine(machineToDelete.machine_id);
      setDeleteConfirmOpen(false);
      setMachineToDelete(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <Motion.div
              {...ANIMATION_VARIANTS.modal.overlay}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />

            {/* Modal Content */}
            <Motion.div
              {...ANIMATION_VARIANTS.modal.content}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[90%] max-w-lg bg-white rounded-2xl shadow-2xl z-[61] overflow-hidden"
            >
              <div className="px-6 py-5 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50 border-b border-[#3A4D39]/10 flex justify-between items-center">
                <h2 className="text-xl font-black text-[#3A4D39] flex items-center gap-2">
                  <Server className="w-6 h-6" />
                  Manage Machines
                </h2>
                <Motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#3A4D39]/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5 text-[#3A4D39]" />
                </Motion.button>
              </div>

              <div className="p-6 flex flex-col gap-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-[#3A4D39]/40">
                {(!user?.machines || user.machines.length === 0) && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 px-4"
                  >
                    <Server className="w-12 h-12 text-[#3A4D39]/20 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#3A4D39] mb-1">
                      No machines registered
                    </p>
                    <p className="text-xs text-[#3A4D39]/60">
                      Add your first machine to get started
                    </p>
                  </Motion.div>
                )}
                {user?.machines?.map((machine, index) => (
                  <Motion.div
                    key={machine.machine_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 border border-[#3A4D39]/20 rounded-xl p-1 hover:border-[#3A4D39]/40 transition-colors group"
                  >
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(machine)}
                      className={`flex-1 text-left px-4 py-3 rounded-lg font-medium
                      transition-all flex justify-between items-center min-w-0 ${
                        selectedMachine?.machine_id === machine.machine_id
                          ? "bg-[#3A4D39] text-[#ECE3CE] shadow-md shadow-[#3A4D39]/20"
                          : "bg-[#ECE3CE]/30 text-[#3A4D39] hover:bg-[#ECE3CE]/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold truncate">
                          {machine.nickname ||
                            machine.serial_number ||
                            machine.machine_id}
                        </div>
                        {(machine.nickname || machine.serial_number) &&
                          machine.nickname !== machine.machine_id && (
                            <div className="text-xs opacity-70 mt-0.5 truncate">
                              {machine.serial_number || machine.machine_id}
                            </div>
                          )}
                      </div>
                      {selectedMachine?.machine_id === machine.machine_id && (
                        <Motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 ml-2 flex-shrink-0"
                        >
                          <CheckIcon className="w-5 h-5 text-green-400" />
                        </Motion.div>
                      )}
                    </Motion.button>
                    <div className="flex px-2 items-center gap-1 border-l border-[#3A4D39]/10 ml-0.5">
                      <Motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleQRClick(e, machine)}
                        className="p-1.5 rounded-lg hover:bg-[#3A4D39]/10 transition-colors"
                        title="Show machine QR code"
                      >
                        <QrCode className="w-5 h-5 text-[#3A4D39]" />
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleRenameClick(e, machine)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg hover:bg-[#3A4D39]/10 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Rename machine"
                        aria-label="Rename machine"
                      >
                        <PencilIcon className="w-5 h-5 text-[#3A4D39]" />
                      </Motion.button>
                      <Motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleDeleteClick(e, machine)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors
                               disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete machine"
                        aria-label="Delete machine"
                      >
                        <XMarkIcon className="w-5 h-5 text-red-600" />
                      </Motion.button>
                    </div>
                  </Motion.div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-[#3A4D39]/10 bg-[#ECE3CE]/30">
                <Motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onClose();
                    setAddMachineOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 
                         bg-[#3A4D39] text-[#ECE3CE] rounded-xl font-bold
                         hover:bg-[#4F6F52] shadow-lg shadow-[#3A4D39]/20
                         hover:shadow-xl hover:shadow-[#3A4D39]/30
                         transition-all duration-200"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add New Machine
                </Motion.button>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmOpen && machineToDelete && (
          <>
            <Motion.div
              {...ANIMATION_VARIANTS.modal.overlay}
              onClick={() => !isDeleting && setDeleteConfirmOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
            />

            <Motion.div
              {...ANIMATION_VARIANTS.modal.content}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl z-[71] overflow-hidden"
            >
              <div className="px-6 py-5 bg-gradient-to-br from-red-50 to-red-50/50 border-b border-red-200">
                <h2 className="text-xl font-black text-red-900">
                  Delete Machine
                </h2>
                <p className="text-sm text-red-700 mt-1">
                  This action cannot be undone
                </p>
              </div>

              <div className="px-6 py-6">
                <p className="text-[#3A4D39] mb-4">
                  Are you sure you want to delete{" "}
                  <strong className="font-bold">
                    {machineToDelete.nickname || machineToDelete.machine_id}
                  </strong>
                  ?
                </p>

                <div className="flex gap-3">
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-[#3A4D39] 
                             bg-[#ECE3CE] hover:bg-[#ECE3CE]/70 
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: isDeleting ? 1 : 1.02 }}
                    whileTap={{ scale: isDeleting ? 1 : 0.98 }}
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white 
                             bg-red-600 hover:bg-red-700 
                             shadow-lg shadow-red-600/20 hover:shadow-xl hover:shadow-red-600/30
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Machine Selector Button (separate from user menu)
const MachineSelector = ({ selectedMachine, onClick }) => {
  return (
    <Motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl
               bg-[#3A4D39]/5 hover:bg-[#3A4D39]/10
               transition-all duration-200 group w-48 min-w-0"
      aria-label="Select machine"
    >
      <Server className="w-4 h-4 text-[#3A4D39] flex-shrink-0" />
      <span className="text-sm font-bold text-[#3A4D39] truncate">
        {selectedMachine?.nickname ||
          selectedMachine?.machine_id ||
          "No Machine"}
      </span>
      <ChevronDownIcon className="w-4 h-4 text-[#3A4D39] flex-shrink-0" />
    </Motion.button>
  );
};

// Add Machine Button (when user has no machines)
const AddMachineButton = ({ onClick }) => {
  return (
    <Motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-xl
               bg-[#3A4D39] text-[#ECE3CE] hover:bg-[#4F6F52]
               transition-all duration-200 shadow-md hover:shadow-lg
               shadow-[#3A4D39]/20"
      aria-label="Add machine"
    >
      <PlusIcon className="w-4 h-4" />
      <span className="text-sm font-bold">Add Machine</span>
    </Motion.button>
  );
};

const UserMenu = ({
  user,
  userMenuOpen,
  setUserMenuOpen,
  handleLogout,
  userMenuRef,
  getInitials,
}) => {
  return (
    <div className="relative ml-2" ref={userMenuRef}>
      <Motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setUserMenuOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                 bg-[#3A4D39]/5 hover:bg-[#3A4D39]/10
                 transition-all duration-200 group"
        aria-label="User menu"
        aria-expanded={userMenuOpen}
      >
        <span className="hidden xl:block text-sm font-bold text-[#3A4D39] uppercase tracking-wide">
          {user.first_name}
        </span>
        <UserAvatar user={user} getInitials={getInitials} />
        <Motion.div
          animate={{ rotate: userMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-4 h-4 text-[#3A4D39]" />
        </Motion.div>
      </Motion.button>

      <AnimatePresence>
        {userMenuOpen && (
          <Motion.div
            {...ANIMATION_VARIANTS.userMenu}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 bg-white border border-[#3A4D39]/10 
                     shadow-xl rounded-2xl overflow-hidden"
          >
            {/* User Info */}
            <div className="px-4 py-4 border-b border-[#3A4D39]/10 bg-gradient-to-br from-[#ECE3CE] to-[#ECE3CE]/50">
              <p className="text-xs text-[#3A4D39]/60 font-semibold uppercase tracking-wider mb-1">
                Signed in as
              </p>
              <p className="text-sm font-bold text-[#3A4D39] truncate">
                {user.email}
              </p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                to="/logs"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Logs
              </Link>
              <Link
                to="/repairs"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Repairs
              </Link>
              <Link
                to="/support"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Support
              </Link>
              <Link
                to="/modules"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Bin settings
              </Link>
              <Link
                to="/firmware"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Firmware
              </Link>
              <Link
                to="/bluetooth"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Connect Via Bluetooth
              </Link>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm font-medium text-[#3A4D39] 
                         hover:bg-[#ECE3CE]/50 transition-colors"
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 text-sm font-medium 
                         text-red-600 hover:bg-red-50 transition-colors"
              >
                Log out
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Header Component
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [addMachineOpen, setAddMachineOpen] = useState(false);
  const [machineModalOpen, setMachineModalOpen] = useState(false);
  const [machineSerial, setMachineSerial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [machineToRename, setMachineToRename] = useState(null);
  const [newMachineName, setNewMachineName] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyCountdown, setEmergencyCountdown] = useState(5);
  const [isConfirmingEmergency, setIsConfirmingEmergency] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [emergencyMessageType, setEmergencyMessageType] = useState("idle"); // idle, success, error
  const [noMachineModalOpen, setNoMachineModalOpen] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const userMenuRef = useRef(null);
  const emergencySocketRef = useRef(null);
  const emergencyTriggeredRef = useRef(false);
  const emergencyTimerRef = useRef(null);

  const fetchQRCode = async (machine) => {
    try {
      const machineId = machine.machine_id;

      setQrLoading(true);
      setQrModalOpen(true);

      // Get serial number from endpoint
      const serialResponse = await Requests({
        url: `/machine/serial/${encodeURIComponent(machineId)}`,
        method: "GET",
      });

      if (!serialResponse.data?.ok || !serialResponse.data?.serial_number) {
        setError("Failed to fetch serial number");
        setQrModalOpen(false);
        setQrLoading(false);
        return;
      }

      const serial = serialResponse.data.serial_number;

      // Generate QR using the serial
      const qrResponse = await Requests({
        url: `/qr/generate/${encodeURIComponent(serial)}`,
        method: "GET",
      });

      if (qrResponse.data.ok) {
        setQrData({
          ...qrResponse.data,
          machineId: machineId,
        });
      } else {
        setError("Failed to generate QR code");
        setQrModalOpen(false);
      }
    } catch (err) {
      console.error("Error fetching QR code:", err);
      setError("An error occurred while generating QR code");
      setQrModalOpen(false);
    } finally {
      setQrLoading(false);
    }
  };
  const notificationMenuRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    loading,
    logout,
    selectedMachine,
    setSelectedMachine,
    refreshMachines,
  } = useUser();

  const isHome = location.pathname === "/";
  const shouldShowSolid = isScrolled || !isHome;

  // Initialize selected machine
  useEffect(() => {
    if (!user?.machines?.length) {
      localStorage.removeItem("selectedMachine");
      setSelectedMachine(null);
      return;
    }

    const stored = localStorage.getItem("selectedMachine");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const exists = user.machines.find(
          (m) => m.machine_id === parsed.machine_id,
        );

        if (exists) {
          setSelectedMachine(exists);
          return;
        } else {
          localStorage.removeItem("selectedMachine");
        }
      } catch (err) {
        console.error("Failed to parse stored machine:", err);
        localStorage.removeItem("selectedMachine");
      }
    }

    setSelectedMachine(user.machines[0]);
  }, [user?.machines, setSelectedMachine]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Emergency socket listener
  useEffect(() => {
    if (!selectedMachine) {
      setIsEmergencyActive(false);
      if (emergencySocketRef.current) {
        emergencySocketRef.current.disconnect();
        emergencySocketRef.current = null;
      }
      return;
    }

    // Reset emergency state while connecting to the new machine
    setIsEmergencyActive(false);
    setEmergencyModalOpen(false);

    let isMounted = true;

    const baseUrl = getBaseUrl();
    const socket = io(baseUrl, {
      transports: ["websocket"],
    });

    emergencySocketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinEmergencyRoom", {
        machineId: selectedMachine.machine_id,
      });
    });

    socket.on("emergency_notification", (data) => {
      if (isMounted) {
        if (data.isActive === true) {
          setIsEmergencyActive(true);
        } else {
          // Emergency has been resolved
          setIsEmergencyActive(false);
          setEmergencyModalOpen(false);
          setEmergencyCountdown(5);
          setIsConfirmingEmergency(false);
          setEmergencyMessage("");
          setEmergencyMessageType("idle");
          emergencyTriggeredRef.current = false;
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from emergency realtime");
    });

    return () => {
      isMounted = false;

      if (emergencySocketRef.current) {
        emergencySocketRef.current.disconnect();
        emergencySocketRef.current = null;
      }
    };
  }, [selectedMachine]);

  const triggerEmergency = useCallback(async () => {
    console.log(
      "[Emergency] Trigger called - Already triggered? Triggering...",
      emergencyTriggeredRef.current,
    );

    if (emergencyTriggeredRef.current || isConfirmingEmergency) {
      console.log("[Emergency] Skipping - already in progress or triggered");
      return;
    }

    if (!selectedMachine) {
      setEmergencyModalOpen(false);
      return;
    }

    emergencyTriggeredRef.current = true;
    setIsConfirmingEmergency(true);
    setEmergencyMessage("Activating emergency mode...");
    setEmergencyMessageType("idle");

    try {
      const customerId = user?.id || user?.customer_id || user?.userId;
      const machineId = selectedMachine.machine_id;

      console.log(
        "[Emergency] Sending request with customerId:",
        customerId,
        "machineId:",
        machineId,
      );

      const response = await Requests({
        url: "/settings/emergency",
        method: "POST",
        data: {
          customerId,
          machineId: machineId,
        },
      });

      if (response.data?.ok) {
        console.log("[Emergency] Request successful");
        setEmergencyMessage("Emergency mode activated successfully!");
        setEmergencyMessageType("success");
        // Keep modal open briefly to show success
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setEmergencyModalOpen(false);
      } else {
        throw new Error(
          response.data?.message || "Failed to activate emergency",
        );
      }
    } catch (err) {
      console.error("Emergency activation error:", err);
      setEmergencyMessage(
        err.message || "Failed to activate emergency mode. Please try again.",
      );
      setEmergencyMessageType("error");
    } finally {
      setIsConfirmingEmergency(false);
      setEmergencyCountdown(5);
    }
  }, [selectedMachine, user]);

  // Emergency countdown effect - DO NOT include triggerEmergency in deps
  useEffect(() => {
    if (!emergencyModalOpen) {
      setEmergencyCountdown(5);
      emergencyTriggeredRef.current = false;
      if (emergencyTimerRef.current) {
        clearInterval(emergencyTimerRef.current);
        emergencyTimerRef.current = null;
      }
      return;
    }

    if (isConfirmingEmergency) {
      return;
    }

    // If already triggered, don't start a new countdown
    if (emergencyTriggeredRef.current) {
      return;
    }

    const timer = setInterval(() => {
      setEmergencyCountdown((prev) => {
        const nextValue = prev - 1;

        if (nextValue <= 0) {
          clearInterval(timer);
          emergencyTimerRef.current = null;

          // Push the side-effect to the event loop to keep the React updater pure
          setTimeout(() => triggerEmergency(), 0);

          return 0;
        }

        return nextValue;
      });
    }, 1000);

    emergencyTimerRef.current = timer;

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [emergencyModalOpen, isConfirmingEmergency]);

  const handleLogout = useCallback(() => {
    logout();
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    navigate("/login");
  }, [logout, navigate]);

  const handleAddMachine = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      try {
        const response = await Requests({
          url: "/machine/add-machine",
          method: "POST",
          data: {
            machineSerial: machineSerial.trim(),
            customerId: user.id || user.customer_id || user.userId,
          },
        });

        if (!response.data?.ok) {
          throw new Error(response.data?.error || "Failed to add machine");
        }

        setSuccess(response.data.message || "Machine added successfully!");
        setMachineSerial("");
        await refreshMachines();

        setTimeout(() => {
          setAddMachineOpen(false);
          setSuccess("");
        }, 1500);
      } catch (err) {
        setError(err.message || "Failed to add machine. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [machineSerial, user, refreshMachines],
  );

  const handleRenameMachine = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsSubmitting(true);

      try {
        const response = await Requests({
          url: "/machine/add-name-machine",
          method: "POST",
          data: {
            name: newMachineName.trim(),
            customerId: user.id || user.customer_id || user.userId,
            machineId: machineToRename.machine_id,
          },
        });

        if (!response.data?.ok) {
          throw new Error(response.data?.error || "Failed to rename machine");
        }

        setSuccess(response.data.message || "Machine renamed successfully!");

        // Update the machine in local storage if it's the selected one
        if (selectedMachine?.machine_id === machineToRename.machine_id) {
          const updatedMachine = {
            ...selectedMachine,
            machine_name: newMachineName.trim(),
          };
          setSelectedMachine(updatedMachine);
          localStorage.setItem(
            "selectedMachine",
            JSON.stringify(updatedMachine),
          );
        }

        await refreshMachines();

        setTimeout(() => {
          setRenameModalOpen(false);
          setMachineToRename(null);
          setNewMachineName("");
          setSuccess("");
        }, 1500);
      } catch (err) {
        setError(err.message || "Failed to rename machine. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      newMachineName,
      user,
      machineToRename,
      selectedMachine,
      setSelectedMachine,
      refreshMachines,
    ],
  );

  const handleDeleteMachine = useCallback(
    async (machineId) => {
      if (!machineId) {
        return;
      }

      setIsSubmitting(true);

      const customerId = user?.id || user?.customer_id || user?.userId;

      try {
        const response = await Requests({
          url: "/machine/delete",
          method: "DELETE",
          data: {
            customerId,
            machineId: machineId,
          },
        });

        if (!response.data?.ok) {
          throw new Error(response.data?.error || "Failed to delete machine");
        }

        if (selectedMachine?.machine_id === machineId) {
          localStorage.removeItem("selectedMachine");
          setSelectedMachine(null);
        }

        await refreshMachines();

        setMachineModalOpen(false);

        if (selectedMachine?.machine_id === machineId) {
          window.location.reload();
        }
      } catch (err) {
        alert(err.message || "Failed to delete machine.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, selectedMachine, refreshMachines, setSelectedMachine],
  );

  const handleEmergencyClick = useCallback(() => {
    if (!selectedMachine) {
      setNoMachineModalOpen(true);
      return;
    }
    // Clear any existing timer
    if (emergencyTimerRef.current) {
      clearInterval(emergencyTimerRef.current);
      emergencyTimerRef.current = null;
    }
    emergencyTriggeredRef.current = false;
    setEmergencyCountdown(5);
    setIsConfirmingEmergency(false);
    setEmergencyMessage("");
    setEmergencyMessageType("idle");
    setEmergencyModalOpen(true);
  }, [selectedMachine]);

  const handleCloseEmergencyModal = useCallback(() => {
    setEmergencyModalOpen(false);
    setEmergencyCountdown(5);
    setIsConfirmingEmergency(false);
    setEmergencyMessage("");
    setEmergencyMessageType("idle");
    emergencyTriggeredRef.current = false;
    if (emergencyTimerRef.current) {
      clearInterval(emergencyTimerRef.current);
      emergencyTimerRef.current = null;
    }
  }, []);

  const getInitials = useCallback(
    (first, last) => `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase(),
    [],
  );

  const activeLeftLinks = user
    ? NAVIGATION.authenticated.left
    : NAVIGATION.public.left;

  return (
    <>
      <Motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isEmergencyActive
            ? "bg-red-600 shadow-lg shadow-red-600/50 backdrop-blur-lg"
            : shouldShowSolid
              ? "bg-[#ECE3CE]/95 backdrop-blur-lg shadow-lg shadow-[#3A4D39]/5"
              : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Navigation */}
            <nav className="hidden lg:flex items-center justify-end gap-6 xl:gap-8 flex-1">
              {activeLeftLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  currentPath={location.pathname}
                  isEmergency={isEmergencyActive}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Center Logo */}
            <Link to="/" className="group shrink-0 px-4">
              <Motion.h1
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`text-2xl lg:text-3xl font-black tracking-tighter 
                         border-2 px-4 py-1.5 rounded-xl 
                         transition-all duration-300 shadow-sm group-hover:shadow-md ${
                           isEmergencyActive
                             ? "text-white border-white group-hover:bg-white group-hover:text-red-600"
                             : "text-[#3A4D39] border-[#3A4D39] group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE]"
                         }`}
              >
                NutriBin
              </Motion.h1>
            </Link>

            {/* Right Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-start">
              {loading ? (
                <div className="flex items-center justify-center">
                  <Motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw
                      className={`w-6 h-6 ${isEmergencyActive ? "text-white" : "text-[#4F6F52]"}`}
                    />
                  </Motion.div>
                </div>
              ) : user ? (
                <>
                  {user?.machines?.length > 0 ? (
                    <MachineSelector
                      selectedMachine={selectedMachine}
                      onClick={() => {
                        refreshMachines();
                        setMachineModalOpen(true);
                      }}
                    />
                  ) : (
                    <AddMachineButton onClick={() => setAddMachineOpen(true)} />
                  )}

                  <NotificationButton
                    notificationMenuRef={notificationMenuRef}
                  />

                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEmergencyClick}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm
                             border-2 transition-all duration-200 shadow-md hover:shadow-lg
                             flex items-center gap-2 ${
                               isEmergencyActive
                                 ? "bg-white text-red-600 border-white hover:bg-red-50"
                                 : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                             }`}
                    aria-label="Emergency mode"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    Emergency
                  </Motion.button>

                  <UserMenu
                    user={user}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    handleLogout={handleLogout}
                    userMenuRef={userMenuRef}
                    getInitials={getInitials}
                  />
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    currentPath={location.pathname}
                    isEmergency={isEmergencyActive}
                  >
                    Login
                  </NavLink>
                  <Motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="px-6 py-2.5 rounded-xl bg-[#3A4D39] text-[#ECE3CE] 
                               font-bold text-sm hover:bg-[#4F6F52] 
                               transition-all duration-300 shadow-lg shadow-[#3A4D39]/20
                               hover:shadow-xl hover:shadow-[#3A4D39]/30"
                    >
                      Register
                    </Link>
                  </Motion.div>
                </>
              )}
            </nav>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 lg:hidden">
              {user && !loading && (
                <NotificationButton notificationMenuRef={notificationMenuRef} />
              )}

              <Motion.button
                whileTap={{ scale: 0.9 }}
                className="text-[#3A4D39] p-2 hover:bg-[#3A4D39]/10 
             rounded-xl transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Bars3Icon className="w-7 h-7" />
              </Motion.button>
            </div>
          </div>
        </div>
      </Motion.header>

      {/* Add Machine Modal */}
      <AddMachineModal
        isOpen={addMachineOpen}
        onClose={() => {
          setAddMachineOpen(false);
          setError("");
          setSuccess("");
          setMachineSerial("");
        }}
        machineSerial={machineSerial}
        setMachineSerial={setMachineSerial}
        onSubmit={handleAddMachine}
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />

      {/* Rename Machine Modal */}
      <RenameMachineModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setMachineToRename(null);
          setNewMachineName("");
          setError("");
          setSuccess("");
        }}
        machine={machineToRename}
        newName={newMachineName}
        setNewName={setNewMachineName}
        onSubmit={handleRenameMachine}
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />

      {/* Machine Selection Modal */}
      <MachineSelectionModal
        isOpen={machineModalOpen}
        onClose={() => setMachineModalOpen(false)}
        user={user}
        selectedMachine={selectedMachine}
        setSelectedMachine={setSelectedMachine}
        setAddMachineOpen={setAddMachineOpen}
        setRenameModalOpen={setRenameModalOpen}
        setMachineToRename={setMachineToRename}
        onDeleteMachine={handleDeleteMachine}
        onShowQR={fetchQRCode}
        isDeleting={isSubmitting}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrData={qrData}
        isLoading={qrLoading}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={handleCloseEmergencyModal}
        countdown={emergencyCountdown}
        onConfirm={triggerEmergency}
        isConfirming={isConfirmingEmergency}
        message={emergencyMessage}
        messageType={emergencyMessageType}
      />

      {/* No Machine Modal */}
      <NoMachineModal
        isOpen={noMachineModalOpen}
        onClose={() => setNoMachineModalOpen(false)}
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <Motion.div
              {...ANIMATION_VARIANTS.drawer.overlay}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 lg:hidden"
            />

            <Motion.div
              {...ANIMATION_VARIANTS.drawer.content}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white 
                       shadow-2xl z-50 flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div
                className={`flex justify-between items-center p-6 border-b transition-all ${
                  isEmergencyActive
                    ? "bg-red-600 border-red-700"
                    : "bg-[#ECE3CE] border-[#3A4D39]/10"
                }`}
              >
                <span
                  className={`text-xl font-black tracking-tight ${
                    isEmergencyActive ? "text-white" : "text-[#3A4D39]"
                  }`}
                >
                  Menu
                </span>
                <Motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2 rounded-xl transition-colors ${
                    isEmergencyActive
                      ? "hover:bg-red-700 hover:text-white"
                      : "hover:bg-[#3A4D39]/10 text-[#3A4D39]"
                  }`}
                  aria-label="Close menu"
                >
                  <XMarkIcon
                    className={`w-6 h-6 ${isEmergencyActive ? "text-white" : "text-[#3A4D39]"}`}
                  />
                </Motion.button>
              </div>

              {/* Navigation Links */}
              <div
                className={`flex-1 overflow-y-auto px-6 py-6 ${isEmergencyActive ? "bg-red-500" : "bg-white"}`}
              >
                <div className="flex flex-col gap-2">
                  {(user
                    ? [
                        ...NAVIGATION.authenticated.left,
                        ...NAVIGATION.authenticated.right,
                      ]
                    : NAVIGATION.public.left
                  ).map((link, index) => (
                    <Motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                          isEmergencyActive
                            ? location.pathname === link.href
                              ? "bg-red-700 text-white shadow-md"
                              : "text-white hover:bg-red-600"
                            : location.pathname === link.href
                              ? "bg-[#3A4D39] text-[#ECE3CE] shadow-md"
                              : "text-[#3A4D39] hover:bg-[#ECE3CE]/50"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </Motion.div>
                  ))}
                </div>

                {/* User Section */}
                {user && (
                  <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 pt-6 border-t border-[#3A4D39]/10"
                  >
                    <div className="flex items-center gap-3 mb-6 p-4 bg-[#ECE3CE]/50 rounded-xl">
                      <Avatar className="size-12 ring-2 ring-[#3A4D39]/20">
                        <AvatarImage
                          src={
                            user.avatar ||
                            user.profile_photo ||
                            user.profile_image ||
                            user.photo ||
                            ""
                          }
                          alt={user.first_name}
                        />
                        <AvatarFallback className="bg-[#4F6F52] text-[#ECE3CE] font-bold">
                          {getInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#3A4D39] truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-[#3A4D39]/70 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Machine Selector Mobile */}
                    {user?.machines?.length > 0 ? (
                      <div className="mb-4">
                        <label className="text-xs text-[#3A4D39]/60 font-semibold uppercase tracking-wider mb-2 block px-1">
                          Active Machine
                        </label>
                        <Motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setMachineModalOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 
                                   bg-white border border-[#3A4D39]/20 rounded-xl
                                   hover:bg-[#ECE3CE]/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Server className="w-4 h-4 text-[#3A4D39]" />
                            <span className="text-sm font-medium text-[#3A4D39]">
                              {selectedMachine?.nickname ||
                                selectedMachine?.machine_id ||
                                "Select Machine"}
                            </span>
                          </div>
                          <ChevronDownIcon className="w-4 h-4 text-[#3A4D39] flex-shrink-0" />
                        </Motion.button>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="text-xs text-[#3A4D39]/60 font-semibold uppercase tracking-wider mb-2 block px-1">
                          Get Started
                        </label>
                        <Motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAddMachineOpen(true);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3
                                   bg-[#3A4D39] text-[#ECE3CE] rounded-xl font-bold
                                   hover:bg-[#4F6F52] transition-colors shadow-md"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Add Your First Machine
                        </Motion.button>
                      </div>
                    )}

                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 mb-3 font-bold text-center text-[#3A4D39] 
                               bg-[#ECE3CE] rounded-xl border border-[#3A4D39]/20 
                               hover:bg-[#ECE3CE]/70 transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 bg-[#3A4D39] text-[#ECE3CE] font-bold rounded-xl 
                               shadow-lg hover:bg-[#4F6F52] transition-colors"
                    >
                      Log out
                    </button>
                  </Motion.div>
                )}
              </div>

              {/* Guest Actions */}
              {!user && (
                <Motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 border-t border-[#3A4D39]/10 bg-[#ECE3CE]/30"
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 mb-3 font-bold text-center text-[#3A4D39] 
                             border-2 border-[#3A4D39] rounded-xl hover:bg-[#3A4D39]/5 
                             transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-3 bg-[#3A4D39] text-[#ECE3CE] font-bold 
                             text-center rounded-xl shadow-lg hover:bg-[#4F6F52] 
                             transition-colors"
                  >
                    Register
                  </Link>
                </Motion.div>
              )}
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
