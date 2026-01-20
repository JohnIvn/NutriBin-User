import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AboutUs from "@/pages/AboutUs";
import FAQ from "@/pages/FAQ";
import Home from "@/pages/Home";
import TOS from "@/pages/TOS";
import Socials from "@/pages/Socials";
import Studies from "@/pages/Studies";
import Guide from "@/pages/Guide";
import AccountSettings from "@/pages/AccountSettings";
import Cameras from "@/pages/Cameras";
import Modules from "@/pages/Modules";
import Dashboard from "@/pages/Dashboard";
import Fertilizer from "@/pages/Fertilizer";
import { Routes, Route, Navigate } from "react-router-dom";
import { VerifyMFA } from "@/pages/VerifyMFA";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Settings from "@/pages/Settings";

export default function PageRouter() {
  return (
    <Routes>
      <Route path="*" element={<h1>ERROR 401</h1>} />
      <Route path="/" element={<Navigate replace to={"/home"} />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/terms" element={<TOS />} />
      <Route path="/faqs" element={<FAQ />} />
      <Route path="/socials" element={<Socials />} />
      <Route path="/studies" element={<Studies />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/verify-mfa" element={<VerifyMFA />} />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cameras"
        element={
          <ProtectedRoute>
            <Cameras />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fertilizer"
        element={
          <ProtectedRoute>
            <Fertilizer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modules"
        element={
          <ProtectedRoute>
            <Modules />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
