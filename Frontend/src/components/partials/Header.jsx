import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useLocation } from "react-router-dom"; // 1. Import useLocation

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const location = useLocation();

  const isHome = location.pathname === "/";
  const shouldShowSolid = isScrolled || !isHome;

  // detect scroll to add shadow/glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinksLeft = [
    { name: "Home", href: "/" },
    { name: "Guide", href: "/guide" },
  ];

  const navLinksRight = [
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register", isButton: true },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          shouldShowSolid
            ? "bg-[#ECE3CE]/90 backdrop-blur-md shadow-sm py-3" // Solid/Glass style
            : "bg-transparent py-5" // Transparent style (Only on Home top)
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* left links */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-end pr-12">
            {navLinksLeft.map((link) => (
              <NavLink key={link.name} href={link.href}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* logo */}
          <div className="flex-shrink-0 relative z-10">
            <a href="/" className="group block text-center">
              {/* NutriBin */}
              <h1 className="text-2xl font-black text-[#3A4D39] tracking-tighter border-2 border-[#3A4D39] px-3 py-1 rounded-lg group-hover:bg-[#3A4D39] group-hover:text-[#ECE3CE] transition-all duration-300">
                NutriBin
              </h1>
            </a>
          </div>

          {/* right links */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-start pl-12">
            {navLinksRight.map((link) =>
              link.isButton ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-5 py-2 rounded-full bg-[#3A4D39] text-[#ECE3CE] font-bold text-sm hover:bg-[#4F6F52] hover:scale-105 transition-all duration-300 shadow-md shadow-[#3A4D39]/20"
                >
                  {link.name}
                </a>
              ) : (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              )
            )}
          </nav>

          {/* mobile menu buttons */}
          <button
            className="md:hidden text-[#3A4D39] p-2"
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
            {/* backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            
            {/* slide-in menu */}
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

              <div className="flex flex-col gap-6 items-center text-center">
                {[...navLinksLeft, ...navLinksRight].map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xl font-bold ${
                      link.isButton
                        ? "px-8 py-3 bg-[#3A4D39] text-[#ECE3CE] rounded-full mt-4 w-full shadow-lg"
                        : "text-[#3A4D39] hover:text-[#4F6F52]"
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// helper component for desktop links with hover line animation
const NavLink = ({ href, children }) => {
  return (
    <a href={href} className="relative group text-[#3A4D39] font-bold text-sm uppercase tracking-wider">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#3A4D39] transition-all duration-300 group-hover:w-full" />
    </a>
  );
};