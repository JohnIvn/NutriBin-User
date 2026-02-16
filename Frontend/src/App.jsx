import "./App.css";
import { BrowserRouter } from "react-router-dom";
import GuestLayout from "@/layouts/GuestLayout";
import MainLayout from "./layouts/MainLayout";
import { useUser } from "@/contexts/UserContextHook";
import ScrollToTop from "@/utils/ScrollToTop";
import { Toaster } from "sonner";
import Header from "./components/partials/Header";
import Footer from "./components/partials/Footer";

export default function App() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <Toaster richColors position="top-center" />
      <ScrollToTop />
      {user ? <MainLayout /> : <GuestLayout />}
      {!window.location.pathname.includes("/support") && <Footer />}
    </BrowserRouter>
  );
}
