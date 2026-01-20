import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAccount } from "@/schema/userAccount";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Sprout, ArrowRight, Eye, EyeOff } from "lucide-react";

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [mfaMessage, setMfaMessage] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(userAccount),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    console.log("called");
    try {
      setLoginError(null);
      setLoginMessage(null);
      setMfaMessage(null);

      const formData = {
        email: values.email,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:3000/user/signin",
        formData,
      );

      if (!response.data.ok) {
        setLoginError(response.data.error || "Login failed");
        return;
        y;
      }

      if (response.data.requiresMFA) {
        setMfaMessage("Check your email to verify your login.");
        return;
      }

      setLoginMessage("Login successful!");
      login(response.data.user);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setLoginError(error.message || "An error occurred");
      console.error(error.message || error);
    }
  }

  async function handleGoogleSignup(credential) {
    try {
      setLoginError(null);
      setMfaMessage(null);

      const response = await axios.post(
        "http://localhost:3000/user/google-signin",
        { credential },
      );

      if (!response.data.ok) {
        setLoginError(response.data.error || "Google Signin Failed");
        return;
      }

      localStorage.setItem("token", response.data.token);
      login(response.data.user);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setLoginError(error.message || "An error occurred");
      console.error(error);
    }
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {mfaMessage ? (
        // MFA Verification Message Screen
        <div className="w-full h-[calc(100vh-48px)] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Verify Your Login
              </h1>
              <p className="text-gray-600 mb-8 text-lg font-semibold">
                {mfaMessage}
              </p>
              <Button
                onClick={() => {
                  setMfaMessage(null);
                  setLoginError(null);
                }}
                className="w-full bg-[] text-white hover:bg-[#A34906] font-semibold"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full bg-[#ECE3CE]/30 font-sans flex items-center justify-center px-4 pt-28 pb-12">
          {/* floating card container */}
          <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-[#3A4D39]/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-[#3A4D39]/5">
            {/* left column */}
            <div className="hidden lg:flex w-1/2 bg-[#3A4D39] relative flex-col justify-between p-12 text-[#ECE3CE]">
              {/* decorative pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, #ECE3CE 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              ></div>

              {/* glowing orb */}
              <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#4F6F52] rounded-full blur-[100px] opacity-60"></div>

              {/* logo area */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="p-2 bg-[#ECE3CE] rounded-lg text-[#3A4D39]">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight">
                  NutriBin
                </span>
              </div>

              {/* value prop */}
              <div className="relative z-10 max-w-md space-y-6 my-auto">
                <h1 className="text-5xl font-black leading-tight">
                  Turn Waste <br />
                  <span className="text-[#739072]">Into Life.</span>
                </h1>
                <p className="text-lg text-[#ECE3CE]/80 font-medium leading-relaxed">
                  Join the ecosystem bridging household waste and sustainable
                  agriculture. Monitor, compost, and grow.
                </p>
              </div>

              {/* internal copyright */}
              <div className="relative z-10 text-xs text-[#ECE3CE]/50 font-medium tracking-wide uppercase">
                Secure Login Portal
              </div>
            </div>

            {/* right column */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 bg-white">
              <div className="w-full max-w-[400px] space-y-8">
                {/* form header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-[#3A4D39]">
                    Welcome Back
                  </h2>
                  <p className="text-[#4F6F52] text-sm">
                    Sign in to access your dashboard
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    {/* email field */}
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
                              placeholder="name@example.com"
                              className="h-12 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] placeholder:text-[#3A4D39]/40 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* password field */}
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
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-12 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] placeholder:text-[#3A4D39]/40 rounded-xl pr-10"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4F6F52] hover:text-[#3A4D39] transition-colors cursor-pointer"
                              >
                                {showPass ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <div className="flex justify-start mt-2">
                            <Link
                              to="/password-reset"
                              className="text-xs font-bold text-[#4F6F52] hover:underline"
                            >
                              Forgot password?
                            </Link>
                          </div>
                          <FormMessage className="text-red-500 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* submit gutton */}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-[#3A4D39]/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                    >
                      Sign In <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>

                    {/* feedback messages */}
                    {loginError && (
                      <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600" />{" "}
                        {loginError}
                      </div>
                    )}
                    {loginMessage && (
                      <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center font-medium border border-green-100 flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />{" "}
                        {loginMessage}
                      </div>
                    )}

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
                      <div className="w-full [&_iframe]:mx-auto">
                        <GoogleLogin
                          width="100%"
                          logo_alignment="center"
                          shape="pill"
                          theme="outline"
                          size="large"
                          text="continue_with"
                          onSuccess={(res) =>
                            handleGoogleSignup(res.credential)
                          }
                          onError={() =>
                            setLoginError("Google authentication failed")
                          }
                        />
                      </div>
                    </div>
                  </form>
                </Form>

                {/* signup link */}
                <div className="text-center text-sm text-[#739072]">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-[#3A4D39] hover:underline hover:text-[#4F6F52]"
                  >
                    Create one now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default Login;
