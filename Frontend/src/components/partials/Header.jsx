import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContextHook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useUser();

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
    setUserMenuOpen(false);
    navigate("/login");
  };

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  
  const publicLeft = [
    { name: "Home", href: "/" },
    { name: "Guide", href: "/guide" },
  ];

  const authLeft = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Cameras", href: "/cameras" },
    { name: "Fertilizer", href: "/fertilizer" },
  ];
  
  const authRight = [
    { name: "Modules", href: "/modules" },
    { name: "Logs", href: "/logs" }, 
    { name: "Guide", href: "/guide" }, 
  ];

  const activeLeftLinks = user ? authLeft : publicLeft;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          shouldShowSolid
            ? "bg-[#ECE3CE]/90 backdrop-blur-md shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* left */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-end pr-12">
            {activeLeftLinks.map((link) => (
              <NavLink key={link.name} to={link.href}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* center logo - */}
          <div className="shrink-0 relative z-10">
            <Link to="/" className="group block text-center">
              <h1 className="text-2xl font-black text-[#3A4D39] tracking-tighter border-2 border-[#3A4D39] px-3 py-1 rounded-lg group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE] transition-all duration-300">
                NutriBin
              </h1>
            </Link>
          </div>

          {/* right */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-start pl-12">
            {loading ? (
              <div className="w-20 h-6 bg-gray-200/50 rounded animate-pulse" />
            ) : user ? (
              <>
                {/* auth right links */}
                {authRight.map((link) => (
                  <NavLink key={link.name} to={link.href}>
                    {link.name}
                  </NavLink>
                ))}

                {/* user dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-3 font-bold text-[#3A4D39] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <span className="hidden lg:block text-sm uppercase tracking-wide">
                      {user.first_name}
                    </span>
                    <Avatar className="size-9 border border-gray-200">
                      <AvatarImage
                        className="w-full h-full object-cover"
                        src={
                          user.avatar ||
                          user.profile_photo ||
                          user.profile_image ||
                          user.photo ||
                          ""
                        }
                        alt={user.first_name}
                      />
                      <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] font-bold text-xs">
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-55"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <Motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 mt-3 w-48 bg-[#ECE3CE] border border-[#3A4D39]/10 shadow-xl rounded-xl overflow-hidden z-60"
                        >
                          <div className="px-4 py-3 border-b border-[#3A4D39]/10 bg-[#3A4D39]/5">
                            <p className="text-xs text-[#3A4D39]/70 font-bold uppercase">
                              Signed in as
                            </p>
                            <p className="text-sm font-bold text-[#3A4D39] truncate">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2.5 text-sm text-[#3A4D39] font-medium hover:bg-[#3A4D39] hover:text-[#ECE3CE] transition-colors"
                          >
                            Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-700 font-medium hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Log out
                          </button>
                        </Motion.div>
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
                  className="px-6 py-2 rounded-full bg-[#3A4D39] text-[#ECE3CE] font-bold text-sm hover:bg-[#4F6F52] hover:scale-105 transition-all duration-300 shadow-md shadow-[#3A4D39]/20"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* mobile toggle */}
          <button
            className="md:hidden text-[#3A4D39] p-2 hover:bg-[#3A4D39]/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-60 md:hidden"
            />

            <Motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#ECE3CE] shadow-2xl z-70 p-8 md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 border-b border-[#3A4D39]/10 pb-4">
                <span className="text-lg font-black text-[#3A4D39]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-[#3A4D39]/10 rounded-full"
                >
                  <XMarkIcon className="w-8 h-8 text-[#3A4D39]" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-center">
                {(user ? [...authLeft, ...authRight] : publicLeft).map(
                  (link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xl font-bold text-[#3A4D39] py-2 hover:text-[#4F6F52]"
                    >
                      {link.name}
                    </Link>
                  ),
                )}

                {user ? (
                  <div className="mt-4 pt-6 border-t border-[#3A4D39]/10 w-full">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-[#3A4D39] text-[#ECE3CE] flex items-center justify-center font-bold">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-[#3A4D39]">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-[#3A4D39]/70">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 mb-2 font-bold text-[#3A4D39] bg-[#3A4D39]/5 rounded-lg"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-3 bg-[#3A4D39] text-[#ECE3CE] font-bold rounded-lg shadow-lg"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col gap-3 w-full">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 font-bold text-[#3A4D39] border-2 border-[#3A4D39] rounded-lg"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 bg-[#3A4D39] text-[#ECE3CE] font-bold rounded-lg shadow-lg"
                    >
                      Register
                    </Link>
                  </div>
                )}``
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="relative group text-[#3A4D39] font-bold text-sm uppercase tracking-wider hover:text-[#4F6F52] transition-colors"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#3A4D39] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
  </Link>
);