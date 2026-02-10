import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useUser } from "@/contexts/UserContextHook";

export function VerifyMFASMS() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useUser();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const attemptedCodeRef = useRef("");
  const inputRef = useRef(null);

  const customerId = searchParams.get("customerId");

  // Countdown for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = useCallback(async () => {
    const trimmed = code.trim();

    if (!trimmed || !/^\d{6}$/.test(trimmed)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    // Prevent duplicate submissions
    if (attemptedCodeRef.current === trimmed && submitting) {
      return;
    }

    attemptedCodeRef.current = trimmed;
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        code: trimmed,
        ...(customerId && { customerId }),
      };

      const res = await Requests({
        url: "/authentication/verify-mfa-sms",
        method: "POST",
        data: payload,
      });

      if (res.data.ok) {
        toast.success("Verification successful!");
        login(res.data.user);
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(res.data?.message || "Verification failed. Please try again.");
        setCode("");
        attemptedCodeRef.current = "";
        inputRef.current?.focus();
      }
    } catch (err) {
      console.error("MFA verification error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred during verification";
      setError(errorMessage);
      setCode("");
      attemptedCodeRef.current = "";
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  }, [code, customerId, login, navigate]);

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setResendCooldown(60); // 60 second cooldown
      const res = await Requests({
        url: "/authentication/resend-mfa-sms",
        method: "POST",
        data: { customerId },
      });

      if (res.data.ok) {
        toast.success("Code resent successfully!");
        setCode("");
        setError(null);
        inputRef.current?.focus();
      } else {
        toast.error(res.data?.message || "Failed to resend code");
        setResendCooldown(0);
      }
    } catch (err) {
      console.error("Resend code error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to resend code. Please try again.",
      );
      setResendCooldown(0);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCode(value);
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && /^\d{6}$/.test(code.trim()) && !submitting) {
      handleSubmit();
    }
  };

  // Auto-submit when a full 6-digit code is entered
  useEffect(() => {
    const trimmed = code.trim();
    if (
      /^\d{6}$/.test(trimmed) &&
      !submitting &&
      attemptedCodeRef.current !== trimmed
    ) {
      handleSubmit();
    }
  }, [code, submitting, handleSubmit]);

  // Validate customerId on mount
  useEffect(() => {
    if (!customerId) {
      toast.error("Invalid verification link");
      navigate("/login", { replace: true });
    }
  }, [customerId, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter Verification Code
          </h1>
          <p className="text-gray-600 mb-6">
            We sent a 6-digit code to your phone.
            <br />
            Enter it below to complete login.
          </p>

          {/* Code Input */}
          <div className="mb-4">
            <Input
              ref={inputRef}
              autoFocus
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={submitting}
              aria-label="6-digit verification code"
              aria-invalid={!!error}
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              id="error-message"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 mb-4"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Verify Button */}
          <Button
            className="w-full mb-3"
            onClick={handleSubmit}
            disabled={submitting || !/^\d{6}$/.test(code.trim())}
          >
            {submitting ? "Verifying..." : "Verify Code"}
          </Button>

          {/* Resend Code */}
          <div className="mb-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-sm text-amber-600 hover:text-amber-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Didn't receive a code? Resend"}
            </button>
          </div>

          {/* Back to Login */}
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="w-full"
            disabled={submitting}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VerifyMFASMS;
