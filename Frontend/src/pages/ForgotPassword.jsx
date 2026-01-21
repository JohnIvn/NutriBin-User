import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [customerId, setcustomerId] = useState("");
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [codeValid, setCodeValid] = useState(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const navigate = useNavigate();

  const passwordChecks = {
    minLength:
      newPassword && newPassword.length >= 8 && newPassword.length <= 20,
    hasUppercase: newPassword && /[A-Z]/.test(newPassword),
    hasLowercase: newPassword && /[a-z]/.test(newPassword),
    hasNumber: newPassword && /\d/.test(newPassword),
    hasSpecial: newPassword && /[^A-Za-z0-9]/.test(newPassword),
    match: newPassword && confirmPassword && newPassword === confirmPassword,
  };

  const allPasswordRequirementsMet =
    passwordChecks.minLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase &&
    passwordChecks.hasNumber &&
    passwordChecks.hasSpecial &&
    passwordChecks.match;

  const codeFormatValid = /^\d{6}$/.test(String(resetCode || "").trim());

  const debounceTimer = useRef(null);
  const debounceCodeTimer = useRef(null);

  // Live-check email existence while typing
  useEffect(() => {
    setEmailExists(null);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const val = String(email || "").trim();
    if (!val || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await Requests({
          url: `/management/staff/check-email/${encodeURIComponent(val)}`,
          method: "GET",
        });
        // API returns { ok: true, available: boolean }
        if (res.data?.ok) {
          setEmailExists(!res.data.available);
        } else {
          setEmailExists(null);
        }
      } catch (err) {
        console.error(err);
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 450);

    return () => clearTimeout(debounceTimer.current);
  }, [email]);


  return (
    <div className="w-full min-h-[calc(100vh-48px)] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-6 mt-15">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Request a password change code and set a new password for your
          account.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1"
            />
            <p className="text-xs mt-1">
              {checkingEmail ? (
                <span className="text-gray-500">Checking email…</span>
              ) : emailExists === null ? (
                <span className="text-gray-500">Enter your email to check</span>
              ) : emailExists ? (
                <span className="text-green-600">
                  Account found for this email
                </span>
              ) : (
                <span className="text-red-600">
                  No account found with this email
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="bg-[#4F6F52]"
              disabled={sendingReset}
              onClick={handleSendCode}
            >
              {sendingReset
                ? "Sending..."
                : resetSent
                  ? "Resend Code"
                  : "Send Code"}
            </Button>
          </div>

          <hr className="my-3" />

          <div>
            <label className="text-xs font-semibold text-gray-600">
              Verification Code
            </label>
            <Input
              value={resetCode}
              onChange={(e) =>
                setResetCode(e.target.value.replace(/[^0-9]/g, ""))
              }
              placeholder="000000"
              className="mt-1 text-center font-mono tracking-[0.5em] text-lg"
              maxLength={6}
            />
            <p className="text-xs mt-1">
              {checkingCode ? (
                <span className="text-gray-500">Checking code…</span>
              ) : codeValid === null ? (
                <span className="text-gray-500">
                  Enter the 6-digit code sent to your email
                </span>
              ) : codeValid ? (
                <span className="text-green-600">Code looks valid</span>
              ) : (
                <span className="text-red-600">Code is invalid or expired</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                New Password
              </label>
              <div className="relative mt-1">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Confirm
              </label>
              <div className="relative mt-1">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {newPassword && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Password must contain:
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.minLength ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.minLength
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    8-20 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.hasUppercase ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.hasUppercase
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.hasLowercase ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.hasLowercase
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.hasNumber ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.hasNumber
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.hasSpecial ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.hasSpecial
                        ? "text-green-700"
                        : "text-gray-600"
                    }
                  >
                    One special character
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full ${passwordChecks.match ? "bg-green-500" : "bg-gray-300"}`}
                  />{" "}
                  <span
                    className={
                      passwordChecks.match ? "text-green-700" : "text-gray-600"
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              className="w-full bg-[#4F6F52]"
              disabled={
                resetSubmitting ||
                !codeFormatValid ||
                !allPasswordRequirementsMet
              }
              onClick={handleVerify}
            >
              {resetSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}