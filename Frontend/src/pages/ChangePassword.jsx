import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Requests from "@/utils/Requests";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; 

export function ChangePassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const customerId = searchParams.get("customerId");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token || !customerId) {
      setError("Invalid or expired reset link");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await Requests({
        url: `/settings/${customerId}/password-reset/verify`,
        method: "POST",
        data: {
          code: token, // token from link
          newPassword: password,
        },
      });

      if (response.data.ok) {
        toast.success(response.data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(response.data.message || "Password reset failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while resetting password",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2">
          Reset Your Password
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Enter a new password for your account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4 relative">
          {/* Password input with eye toggle */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Confirm password input with eye toggle */}
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          <Button
            variant="outline"
            type="submit"
            className={`w-full text-white ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={submitting}
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            className="text-sm"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
