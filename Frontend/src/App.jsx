import "./App.css";
import { BrowserRouter } from "react-router-dom";
import GuestLayout from "@/layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";
import { useUser } from "@/contexts/UserContextHook";
import ScrollToTop from "@/utils/ScrollToTop";
import { Toaster } from "sonner";
import Header from "./components/partials/Header";
import Footer from "./components/partials/Footer";
import { RefreshCw } from "lucide-react";
import { motion as Motion } from "framer-motion";

export default function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-10 h-10 text-[#4F6F52]" />
        </Motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Toaster richColors position="top-center" />
      <ScrollToTop />
      {user ? <MainLayout /> : <GuestLayout />}
      {!window.location.pathname.includes("/support")}
      <Footer />
    </BrowserRouter>
  );
}
