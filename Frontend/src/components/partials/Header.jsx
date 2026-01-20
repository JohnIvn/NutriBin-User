import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  const isHome = location.pathname === "/";
  const shouldShowSolid = isScrolled || !isHome;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  const navLinksLeft = [
    { name: "Home", href: "/" },
    { name: "Guide", href: "/guide" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300  ${
          shouldShowSolid
            ? "bg-[#ECE3CE]/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* LEFT LINKS */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-end pr-12">
            {navLinksLeft.map((link) => (
              <NavLink key={link.name} to={link.href}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* LOGO */}
          <div className="flex-shrink-0 relative z-10">
            <Link to="/" className="group block text-center">
              <h1 className="text-2xl font-black text-[#3A4D39] tracking-tighter border-2 border-[#3A4D39] px-3 py-1 rounded-lg group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE] transition-all duration-300">
                NutriBin
              </h1>
            </Link>
          </div>

          {/* RIGHT LINKS / AUTH */}
          <nav className="hidden md:flex items-center gap-6 flex-1 justify-start pl-12">
            {loading ? null : user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/cameras">Cameras</NavLink>
                <NavLink to="/fertilizer">Fertilizer</NavLink>
                <NavLink to="/modules">Modules</NavLink>

                {/* USER DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 font-bold text-[#3A4D39]"
                  >
                    {user.first_name}
                    <div className="w-8 h-8 rounded-full bg-[#3A4D39] text-[#ECE3CE] flex items-center justify-center text-sm">
                      {getInitials(user.first_name, user.last_name)}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        {/* click outside catcher */}
                        <div
                          className="fixed inset-0 z-[55]"
                          onClick={() => setUserMenuOpen(false)}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-3 w-48 bg-[#ECE3CE] shadow-xl rounded-lg z-[60]"
                        >
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 hover:bg-[#d6ccb6] rounded-t-lg"
                          >
                            Settings
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-3 hover:bg-[#d6ccb6] rounded-b-lg"
                          >
                            Log out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full bg-[#3A4D39] text-[#ECE3CE] font-bold text-sm hover:bg-[#4F6F52] hover:scale-105 transition-all duration-300 shadow-md shadow-[#3A4D39]/20"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-[#3A4D39] p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#ECE3CE] shadow-2xl z-[70] p-8 md:hidden flex flex-col"
            >
              <div className="flex justify-end mb-8">
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="w-8 h-8 text-[#3A4D39]" />
                </button>
              </div>

              <div className="flex flex-col gap-6 items-center text-center text-xl font-bold text-[#3A4D39]">
                {navLinksLeft.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/cameras"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cameras
                    </Link>
                    <Link
                      to="/fertilizer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Fertilizer
                    </Link>
                    <Link
                      to="/modules"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Modules
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-6 px-8 py-3 bg-[#3A4D39] text-[#ECE3CE] rounded-full w-full shadow-lg"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login">Login</Link>
                    <Link
                      to="/register"
                      className="px-8 py-3 bg-[#3A4D39] text-[#ECE3CE] rounded-full w-full shadow-lg"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* DESKTOP LINK COMPONENT */
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative group text-[#3A4D39] font-bold text-sm uppercase tracking-wider"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#3A4D39] transition-all duration-300 group-hover:w-full" />
  </Link>
);
