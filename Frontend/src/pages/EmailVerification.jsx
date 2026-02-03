import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Requests from "@/utils/Requests";

export default function EmailVerification() {
  const navigate = useNavigate();

  const [registrationData, setRegistrationData] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  // 🔐 Load temp signup payload
  useEffect(() => {
    const stored = sessionStorage.getItem("pendingSignup");

    if (!stored) {
      navigate("/register", { replace: true });
      return;
    }

    setRegistrationData(JSON.parse(stored));
  }, [navigate]);
  console.log(registrationData)
  if (!registrationData) return null;

  async function handleVerify() {
    try {
      setLoading(true);
      setError(null);

      const response = await Requests({
        url: '/user/signup',
        method: 'POST',
        data: {
          ...registrationData,
          emailVerificationCode: code,
        },
      });

      console.log(response)
      if (!response.data.ok) {
        throw new Error(response.data.message);
      }

      // 🧹 Cleanup temp data
      sessionStorage.removeItem("pendingSignup");

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECE3CE]/30">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-[#3A4D39]">
          Verify Your Email
        </h2>

        <p className="text-sm text-center text-[#4F6F52]">
          We sent a 6-digit code to <b>{registrationData.email}</b>
        </p>

        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter verification code"
          maxLength={6}
        />

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <Button
          onClick={handleVerify}
          disabled={loading || code.length !== 6}
          className="w-full"
        >
          {loading ? "Verifying..." : "Verify & Create Account"}
        </Button>
      </div>
    </div>
  );
}
