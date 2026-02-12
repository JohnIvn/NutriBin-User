import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContextHook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Requests from "@/utils/Requests";

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
    ],
    right: [
      { name: "Modules", href: "/modules" },
      { name: "Logs", href: "/logs" },
      { name: "Guide", href: "/guide" },
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
};

// Extracted Components
const NavLink = ({ to, children, currentPath }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className="relative group text-[#3A4D39] font-bold text-sm uppercase tracking-wider 
               hover:text-[#4F6F52] transition-colors py-1"
    >
      {children}
      <Motion.span
        initial={false}
        animate={{
          width: isActive ? "100%" : "0%",
          opacity: isActive ? 1 : 0,
        }}
        className="absolute -bottom-1 left-0 h-0.5 bg-[#3A4D39] group-hover:w-full 
                 group-hover:opacity-100 transition-all duration-300"
      />
    </Link>
  );
};

const MachineSelector = ({
  user,
  selectedMachine,
  setSelectedMachine,
  onAdd,
}) => {
  const handleMachineChange = useCallback(
    (e) => {
      const machine = user.machines.find(
        (m) => m.machine_id === e.target.value,
      );
      if (machine) {
        setSelectedMachine(machine);
        localStorage.setItem("selectedMachine", JSON.stringify(machine));
        window.location.reload();
      }
    },
    [user.machines, setSelectedMachine],
  );

  if (!user?.machines?.length) {
    return (
      <Motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAdd}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                 bg-[#3A4D39] text-[#ECE3CE] font-bold text-xs
                 hover:bg-[#4F6F52] transition-colors"
      >
        <PlusIcon className="w-4 h-4" />
        Add Machine
      </Motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedMachine?.machine_id || ""}
        onChange={handleMachineChange}
        className="px-3 py-1.5 rounded-xl bg-white border border-[#3A4D39]/20
                 text-[#3A4D39] font-bold text-xs
                 focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/30"
      >
        {user.machines.map((machine) => (
          <option key={machine.machine_id} value={machine.machine_id}>
            {machine.machine_name || machine.machine_id}
          </option>
        ))}
      </select>

      <Motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onAdd}
        className="p-1.5 rounded-lg hover:bg-[#3A4D39]/10 transition-colors"
        title="Add Machine"
      >
        <PlusIcon className="w-4 h-4 text-[#3A4D39]" />
      </Motion.button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="flex items-center gap-4">
    <div className="w-16 h-5 bg-[#3A4D39]/10 rounded-full animate-pulse" />
    <div className="w-16 h-5 bg-[#3A4D39]/10 rounded-full animate-pulse" />
    <div className="w-9 h-9 rounded-full bg-[#3A4D39]/10 animate-pulse" />
  </div>
);

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

const AddMachineModal = ({
  isOpen,
  onClose,
  machineSerial,
  setMachineSerial,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => (
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
              <h2 className="text-xl font-black text-[#3A4D39]">Add Machine</h2>
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
                         focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/30 focus:border-[#3A4D39]/40
                         placeholder:text-[#3A4D39]/40 transition-all"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </Motion.div>
            )}

            {/* Success Message */}
            {success && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl"
              >
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </Motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-[#3A4D39] 
                         bg-[#ECE3CE] hover:bg-[#ECE3CE]/70 
                         transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <Motion.button
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl font-bold text-[#ECE3CE] 
                         bg-[#3A4D39] hover:bg-[#4F6F52] 
                         shadow-lg shadow-[#3A4D39]/20 hover:shadow-xl hover:shadow-[#3A4D39]/30
                         transition-all disabled:opacity-50 disabled:cursor-not-allowed
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

const UserMenu = ({
  user,
  userMenuOpen,
  setUserMenuOpen,
  selectedMachine,
  setSelectedMachine,
  setAddMachineOpen,
  handleLogout,
  userMenuRef,
  getInitials,
}) => {
  const handleMachineChange = useCallback(
    (e) => {
      const machine = user.machines.find(
        (m) => m.machine_id === e.target.value,
      );
      if (machine) {
        setSelectedMachine(machine);
        localStorage.setItem("selectedMachine", JSON.stringify(machine));
        window.location.reload();
      }
    },
    [user.machines, setSelectedMachine],
  );

  return (
    <div className="relative ml-2" ref={userMenuRef}>
      <Motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setUserMenuOpen((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl
                 bg-[#3A4D39]/5 hover:bg-[#3A4D39]/10
                 transition-all duration-200 group"
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

            {/* Machine Selector */}
            {user?.machines?.length > 0 && (
              <div className="px-4 py-3 border-b border-[#3A4D39]/10 bg-[#ECE3CE]/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#3A4D39]/60 font-semibold uppercase tracking-wider">
                    Machines
                  </label>
                  <Motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setAddMachineOpen(true);
                      setUserMenuOpen(false);
                    }}
                    className="p-1 rounded-lg hover:bg-[#3A4D39]/10 transition-colors"
                    title="Add Machine"
                  >
                    <PlusIcon className="w-4 h-4 text-[#3A4D39]" />
                  </Motion.button>
                </div>
                <select
                  value={selectedMachine?.machine_id || ""}
                  onChange={handleMachineChange}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#3A4D39]/20
                           text-[#3A4D39] font-medium text-sm
                           focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/30
                           hover:border-[#3A4D39]/40 transition-colors cursor-pointer"
                >
                  {user.machines.map((machine) => (
                    <option key={machine.machine_id} value={machine.machine_id}>
                      {machine.machine_name || machine.machine_id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add Machine Button if no machines */}
            {(!user?.machines || user.machines.length === 0) && (
              <div className="px-4 py-3 border-b border-[#3A4D39]/10">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setAddMachineOpen(true);
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 
                           bg-[#3A4D39] text-[#ECE3CE] rounded-lg font-medium text-sm
                           hover:bg-[#4F6F52] transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Machine
                </Motion.button>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-2">
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
  const [machineSerial, setMachineSerial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const userMenuRef = useRef(null);

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
    if (user?.machines?.length && !selectedMachine) {
      const stored = localStorage.getItem("selectedMachine");
      const initialMachine = stored ? JSON.parse(stored) : user.machines[0];
      setSelectedMachine(initialMachine);
    }
  }, [user?.machines, selectedMachine, setSelectedMachine]);

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
            machineSerial: machineSerial,
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
        }, 1000);
      } catch (err) {
        setError(err.message || "Failed to add machine. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [machineSerial, user, refreshMachines],
  );

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
          shouldShowSolid
            ? "bg-[#ECE3CE]/95 backdrop-blur-lg shadow-lg shadow-[#3A4D39]/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1">
              {activeLeftLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  currentPath={location.pathname}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Machine Selector */}
              {user && (
                <MachineSelector
                  user={user}
                  selectedMachine={selectedMachine}
                  setSelectedMachine={setSelectedMachine}
                  onAdd={() => setAddMachineOpen(true)}
                />
              )}
            </nav>

            {/* Center Logo */}
            <Link to="/" className="group shrink-0 px-4">
              <Motion.h1
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl lg:text-3xl font-black text-[#3A4D39] tracking-tighter 
                         border-2 border-[#3A4D39] px-4 py-1.5 rounded-xl 
                         group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE] 
                         transition-all duration-300 shadow-sm group-hover:shadow-md"
              >
                NutriBin
              </Motion.h1>
            </Link>

            {/* Right Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-end">
              {loading ? (
                <LoadingSkeleton />
              ) : user ? (
                <>
                  {NAVIGATION.authenticated.right.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.href}
                      currentPath={location.pathname}
                    >
                      {link.name}
                    </NavLink>
                  ))}

                  <UserMenu
                    user={user}
                    userMenuOpen={userMenuOpen}
                    setUserMenuOpen={setUserMenuOpen}
                    selectedMachine={selectedMachine}
                    setSelectedMachine={setSelectedMachine}
                    setAddMachineOpen={setAddMachineOpen}
                    handleLogout={handleLogout}
                    userMenuRef={userMenuRef}
                    getInitials={getInitials}
                  />
                </>
              ) : (
                <>
                  <NavLink to="/login" currentPath={location.pathname}>
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

            {/* Mobile Menu Button */}
            <Motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden text-[#3A4D39] p-2 hover:bg-[#3A4D39]/10 
                       rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="w-7 h-7" />
            </Motion.button>
          </div>
        </div>
      </Motion.header>

      {/* Add Machine Modal */}
      <AddMachineModal
        isOpen={addMachineOpen}
        onClose={() => setAddMachineOpen(false)}
        machineSerial={machineSerial}
        setMachineSerial={setMachineSerial}
        onSubmit={handleAddMachine}
        isSubmitting={isSubmitting}
        error={error}
        success={success}
      />

      {/* Mobile Drawer - keeping original for brevity, but could be extracted similarly */}
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
                       shadow-2xl z-50 flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-[#3A4D39]/10 bg-[#ECE3CE]">
                <span className="text-xl font-black text-[#3A4D39] tracking-tight">
                  Menu
                </span>
                <Motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-[#3A4D39]/10 rounded-xl transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-[#3A4D39]" />
                </Motion.button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
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
                          location.pathname === link.href
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
                    {user?.machines?.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <label className="text-xs text-[#3A4D39]/60 font-semibold uppercase tracking-wider">
                            Active Machine
                          </label>
                          <Motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setAddMachineOpen(true);
                              setMobileMenuOpen(false);
                            }}
                            className="p-1 rounded-lg hover:bg-[#3A4D39]/10 transition-colors"
                            title="Add Machine"
                          >
                            <PlusIcon className="w-4 h-4 text-[#3A4D39]" />
                          </Motion.button>
                        </div>
                        <select
                          value={selectedMachine?.machine_id || ""}
                          onChange={(e) => {
                            const machine = user.machines.find(
                              (m) => m.machine_id === e.target.value,
                            );
                            setSelectedMachine(machine);
                            localStorage.setItem(
                              "selectedMachine",
                              JSON.stringify(machine),
                            );
                            window.location.reload();
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[#3A4D39]/20
                                   text-[#3A4D39] font-medium text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#3A4D39]/30"
                        >
                          {user.machines.map((machine) => (
                            <option
                              key={machine.machine_id}
                              value={machine.machine_id}
                            >
                              {machine.machine_name || machine.machine_id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Add Machine Button if no machines (mobile) */}
                    {(!user?.machines || user.machines.length === 0) && (
                      <Motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setAddMachineOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-4
                                 bg-[#3A4D39] text-[#ECE3CE] rounded-xl font-bold
                                 hover:bg-[#4F6F52] transition-colors"
                      >
                        <PlusIcon className="w-5 h-5" />
                        Add Machine
                      </Motion.button>
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
