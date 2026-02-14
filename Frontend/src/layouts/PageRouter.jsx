import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AboutUs from "@/pages/AboutUs";
import FAQ from "@/pages/FAQ";
import Home from "@/pages/Home";
import TOS from "@/pages/TOS";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import Socials from "@/pages/Socials";
import Studies from "@/pages/Studies";
import Guide from "@/pages/Guide";
import Cameras from "@/pages/Cameras";
import Modules from "@/pages/Modules";
import Dashboard from "@/pages/Dashboard";
import Fertilizer from "@/pages/Fertilizer";
import Logs from "@/pages/Logs";
import { Routes, Route, Navigate } from "react-router-dom";
import { VerifyMFA } from "@/pages/VerifyMFA";
import { VerifyMFASMS } from "@/pages/VerifyMFASMS";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Settings from "@/pages/Settings";
import ForgotPassword from "@/pages/ForgotPassword";
import EmailVerification from "@/pages/EmailVerification";
import { ChangePassword } from "@/pages/ChangePassword";
import { useUser } from "@/contexts/UserContextHook";
import DataScience from "@/pages/DataScience";

function FallbackRoute() {
  const { user } = useUser();
  return <Navigate replace to={user ? "/dashboard" : "/login"} />;
}

export default function PageRouter() {
  return (
    <Routes>
      <Route path="*" element={<FallbackRoute />} />
      <Route path="/" element={<FallbackRoute />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/verify" element={<EmailVerification />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/terms" element={<TOS />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/faqs" element={<FAQ />} />
      <Route path="/socials" element={<Socials />} />
      <Route path="/studies" element={<Studies />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/verify-mfa" element={<VerifyMFA />} />
      <Route path="/verify-mfasms" element={<VerifyMFASMS />} />
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
        path="/data"
        element={
          <ProtectedRoute>
            <DataScience />
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
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <Logs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
