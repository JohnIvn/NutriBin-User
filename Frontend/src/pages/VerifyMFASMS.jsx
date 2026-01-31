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
  const attemptedCodeRef = useRef("");

  const customerId = searchParams.get("customerId");

  const handleSubmit = useCallback(async () => {
    if (!code || !/^\d{6}$/.test(code.trim())) {
      setError("Enter a 6-digit code");
      return;
    }

    const trimmed = code.trim();
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

      if (res.data?.ok) {
        toast.success("MFA verification successful!");
        login(res.data.user);
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(res.data?.message || "Verification failed");
      }
    } catch (err) {
      console.error("verify sms error", err);
      setError(
        err.response?.data?.message || err.message || "Verification error",
      );
    } finally {
      setSubmitting(false);
    }
  }, [code, customerId, login, navigate]);

  useEffect(() => {
    if (!customerId) {
      setError("Missing customerId");
    }
  }, [customerId]);

  // Auto-submit when a full 6-digit code is entered, but avoid repeating
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

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Enter SMS Code
          </h1>
          <p className="text-gray-600 mb-4">
            We sent a 6-digit code to your phone. Enter it below to complete
            login.
          </p>

          <div className="mb-4">
            <Input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="123456"
              inputMode="numeric"
              maxLength={6}
            />
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !/^\d{6}$/.test(code.trim())}
          >
            {submitting ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="mt-3">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyMFASMS;
