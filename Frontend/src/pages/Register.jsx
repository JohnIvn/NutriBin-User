import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { registration } from "@/schema/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import request from "@/utils/Requests";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUser } from "@/contexts/UserContextHook";
import { Sprout, ArrowRight, Eye, EyeOff } from "lucide-react";
import TOSModal from "@/components/ui/TOSModal";

// `postToBackend` is provided by `@/utils/Requests`

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [tosOpen, setTosOpen] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const { login } = useUser();

  const form = useForm({
    resolver: zodResolver(registration),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password") || "";

  async function onSubmit(values) {
    try {
      setRegisterError(null);
      setRegisterMessage(null);

      // 1️⃣ Send verification email

      const response = await request({
        url: "/user/email-verification",
        method: "POST",
        data: { newEmail: values.email },
      });

      if (!response.data.ok) {
        setRegisterError(response.data.error || "Register failed");
        return;
      }

      // 2️⃣ Save TEMP signup payload
      sessionStorage.setItem(
        "pendingSignup",
        JSON.stringify({
          firstname: values.firstName,
          lastname: values.lastName,
          email: values.email,
          password: values.password,
        }),
      );

      // 3️⃣ Navigate (state is now OPTIONAL)
      navigate("/verify");
    } catch (error) {
      setRegisterError(
        error.response?.data?.message || "Failed to send verification email",
      );
    }
  }

  async function handleGoogleSignup(credential) {
    try {
      setRegisterError(null);

      const response = await request({
        url: "/user/google-signup",
        method: "POST",
        data: { credential },
      });

      if (!response.data.ok) {
        setRegisterError(response.data.error || "Google Signup Failed");
        return;
      }

      localStorage.setItem("token", response.data.token);
      login(response.data.user);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setRegisterError(error.message || "An error occurred");
      console.error(error);
    }
  }

  const passwordChecks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[^A-Za-z0-9]/.test(passwordValue),
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* main container */}
      <div className="min-h-screen w-full bg-[#ECE3CE]/30 font-sans flex items-center justify-center px-4 pt-32 pb-12">
        {/* floating card */}
        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-[#3A4D39]/10 overflow-hidden flex flex-col lg:flex-row min-h-150 border border-[#3A4D39]/5">
          {/* left column */}
          <div className="hidden lg:flex w-1/2 bg-[#3A4D39] relative flex-col justify-between p-12 text-[#ECE3CE]">
            {/* pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #ECE3CE 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            ></div>

            {/* orb */}
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#4F6F52] rounded-full blur-[100px] opacity-60"></div>

            {/* logo */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 bg-[#ECE3CE] rounded-lg text-[#3A4D39]">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                NutriBin
              </span>
            </div>

            {/* content */}
            <div className="relative z-10 max-w-md space-y-6 my-auto">
              <h1 className="text-5xl font-black leading-tight">
                Join the <br />
                <span className="text-[#739072]">Revolution.</span>
              </h1>
              <p className="text-lg text-[#ECE3CE]/80 font-medium leading-relaxed">
                Create an account to start monitoring your compost, tracking
                nutrients, and contributing to a greener future.
              </p>
            </div>

            {/* footer */}
            <div className="relative z-10 text-xs text-[#ECE3CE]/50 font-medium tracking-wide uppercase">
              Secure Registration Portal
            </div>
          </div>

          {/* right column */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white">
            <div className="w-full max-w-105 space-y-6">
              {/* header */}
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-3xl font-bold text-[#3A4D39]">
                  Create Account
                </h2>
                <div className="text-[#4F6F52] text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#3A4D39] hover:underline hover:text-[#4F6F52]"
                  >
                    Sign in here
                  </Link>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* name row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3A4D39] font-semibold">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-11 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3A4D39] font-semibold">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="h-11 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-500" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#3A4D39] font-semibold">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="johndoe@example.com"
                            className="h-11 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-500" />
                      </FormItem>
                    )}
                  />

                  {/* password row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3A4D39] font-semibold">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="h-11 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] rounded-xl pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4F6F52] hover:text-[#3A4D39] transition-colors cursor-pointer"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <div className="h-5">
                            <FormMessage className="text-xs text-red-500" />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#3A4D39] font-semibold">
                            Confirm
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                className="h-11 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] rounded-xl pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4F6F52] hover:text-[#3A4D39] transition-colors cursor-pointer"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <div className="h-5">
                            <FormMessage className="text-xs text-red-500" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* password hints (LIVE CHECK) */}
                  <div className="bg-[#ECE3CE]/20 p-3 rounded-lg border border-[#3A4D39]/10">
                    <p className="text-xs font-bold text-[#3A4D39] mb-2">
                      Password Requirements:
                    </p>

                    <ul className="text-[11px] space-y-1">
                      <li
                        className={
                          passwordChecks.length
                            ? "text-green-600"
                            : "text-[#4F6F52]"
                        }
                      >
                        {passwordChecks.length ? "✔" : "•"} At least 8
                        characters
                      </li>

                      <li
                        className={
                          passwordChecks.upper && passwordChecks.lower
                            ? "text-green-600"
                            : "text-[#4F6F52]"
                        }
                      >
                        {passwordChecks.upper && passwordChecks.lower
                          ? "✔"
                          : "•"}{" "}
                        Uppercase & lowercase letters
                      </li>

                      <li
                        className={
                          passwordChecks.number
                            ? "text-green-600"
                            : "text-[#4F6F52]"
                        }
                      >
                        {passwordChecks.number ? "✔" : "•"} Contains a number
                      </li>

                      <li
                        className={
                          passwordChecks.special
                            ? "text-green-600"
                            : "text-[#4F6F52]"
                        }
                      >
                        {passwordChecks.special ? "✔" : "•"} Contains a special
                        character
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-[#4F6F52]">
                    <input
                      type="checkbox"
                      checked={tosAccepted}
                      readOnly={!tosAccepted}
                      onChange={(e) => {
                        // Only allow unchecking if already accepted
                        if (tosAccepted) {
                          setTosAccepted(e.target.checked);
                        }
                      }}
                      onClick={() => {
                        // If not yet accepted, open modal instead of toggling
                        if (!tosAccepted) {
                          setTosOpen(true);
                        }
                      }}
                      className="mt-1 accent-[#3A4D39] cursor-pointer"
                    />
                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setTosOpen(true)}
                        className="font-bold text-[#3A4D39] underline hover:text-[#4F6F52]"
                      >
                        Terms of Service
                      </button>
                    </span>
                  </div>

                  {/* feedback */}
                  {registerError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />{" "}
                      {registerError}
                    </div>
                  )}
                  {registerMessage && (
                    <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center font-medium border border-green-100 flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />{" "}
                      {registerMessage}
                    </div>
                  )}

                  {/* submit */}
                  <Button
                    type="submit"
                    disabled={!tosAccepted}
                    className="w-full h-12 bg-[#3A4D39] hover:bg-[#4F6F52] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all shadow-lg mt-2"
                  >
                    Create Account <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  {/* divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#3A4D39]/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#739072] font-semibold">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* google */}
                  <div className="flex justify-center">
                    <div className="flex justify-center w-full max-w-[400px] mx-auto">
                      <GoogleLogin
                        width={400}
                        logo_alignment="center"
                        shape="pill"
                        theme="outline"
                        size="large"
                        text="continue_with"
                        onSuccess={(res) => handleGoogleSignup(res.credential)}
                        onError={() =>
                          setRegisterError("Google authentication failed")
                        }
                      />
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <TOSModal
        key={tosOpen ? "open" : "closed"} // 👈 This resets the internal state automatically
        open={tosOpen}
        onClose={() => setTosOpen(false)}
        onAccept={() => {
          setTosAccepted(true);
          setTosOpen(false);
        }}
      />
    </GoogleOAuthProvider>
  );
}
