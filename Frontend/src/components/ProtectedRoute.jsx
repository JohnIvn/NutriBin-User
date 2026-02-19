import { Navigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContextHook";
import { RefreshCw } from "lucide-react";
import { motion as Motion } from "framer-motion";

export function ProtectedRoute({ children }) {
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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
