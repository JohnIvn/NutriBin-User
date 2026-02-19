import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export function VerifyMFA() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyMFA = async () => {
      try {
        const token = searchParams.get("token");
        const customerId = searchParams.get("customerId");

        // Validate required parameters
        if (!token || !customerId) {
          setStatus("error");
          setErrorMessage(
            "Invalid verification link - missing token or user ID",
          );
          return;
        }

        const payload = {
          token,
          customerId,
        };

        console.log("[MFA Page] Sending payload:", payload);

        const response = await Requests({
          url: "/authentication/verify-mfa",
          method: "POST",
          data: payload,
        });

        console.log("[MFA Page] Response:", response.data);

        if (response.data.ok) {
          setStatus("success");
          toast.success("MFA verification successful!");
        } else {
          setStatus("error");
          setErrorMessage(response.data.message || "Verification failed");
        }
      } catch (err) {
        console.error("MFA verification error:", err);
        console.error("Error response:", err.response?.data);

        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "An error occurred during verification",
        );
      }
    };

    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      verifyMFA();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams, navigate, login]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-amber-100">
        {status === "verifying" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Your Login
            </h1>
            <p className="text-gray-600 text-sm">
              Please wait while we verify your account...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verification Failed
            </h1>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Back to Login
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Verified Successfully!
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              Redirecting you to dashboard...
            </p>
            <div className="flex items-center justify-center gap-1 mt-4">
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
