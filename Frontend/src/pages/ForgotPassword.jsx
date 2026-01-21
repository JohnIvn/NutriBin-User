import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Requests from "@/utils/Requests";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [sending, setSending] = useState(false);

  const debounceTimer = useRef(null);

  // Live email existence check
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
          url: `/user/check-email/${encodeURIComponent(val)}`,
          method: "GET",
          data: {}
        });

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
    }, 400);

    return () => clearTimeout(debounceTimer.current);
  }, [email]);

  const handleSendLink = async () => {
    if (!emailExists) return;

    setSending(true);
    try {
      await Requests({
        url: "/user/forgot-password",
        method: "POST",
        data: { email },
      });

      toast.success("Password reset link sent to your email");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reset link");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-48px)] flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50 p-6 mt-15">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email and we’ll send you a password reset link.
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
                <span className="text-gray-500">Enter your email</span>
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

          <Button
            className="w-full bg-[#4F6F52]"
            disabled={!emailExists || sending}
            onClick={handleSendLink}
          >
            {sending ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
