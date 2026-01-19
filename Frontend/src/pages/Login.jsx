import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAccount } from "@/schema/userAccount";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Sprout, ArrowRight } from "lucide-react";

export function Login() {
  const [showPass, setShowPass] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(userAccount),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    try {
      setLoginError(null);
      setLoginMessage(null);
      const formData = {
        email: values.username,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:3000/user/signin",
        formData
      );
      if (!response.data.ok) {
        setLoginError(response.data.error || "Login failed");
        return;
      }
      setLoginMessage("Login successful!");
      login(response.data.user);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setLoginError(error.message || "An error occurred");
      console.error(error.message || error);
    }
  }

  async function handleGoogleSignup(credential) {
    try {
      setLoginError(null);
      const response = await axios.post(
        "http://localhost:3000/user/google-signin",
        { credential }
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
      <div className="min-h-screen w-full bg-[#ECE3CE]/30 font-sans flex items-center justify-center px-4 pt-28 pb-12">
        
        {/* floating card container */}
        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl shadow-[#3A4D39]/10 overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-[#3A4D39]/5">
          
          {/* left column */}
          <div className="hidden lg:flex w-1/2 bg-[#3A4D39] relative flex-col justify-between p-12 text-[#ECE3CE]">
            {/* decorative pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ECE3CE 1px, transparent 0)', backgroundSize: '32px 32px' }}>
            </div>
            
            {/* glowing orb */}
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#4F6F52] rounded-full blur-[100px] opacity-60"></div>

            {/* logo area */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2 bg-[#ECE3CE] rounded-lg text-[#3A4D39]">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">NutriBin</span>
            </div>

            {/* value prop */}
            <div className="relative z-10 max-w-md space-y-6 my-auto">
              <h1 className="text-5xl font-black leading-tight">
                Turn Waste <br/>
                <span className="text-[#739072]">Into Life.</span>
              </h1>
              <p className="text-lg text-[#ECE3CE]/80 font-medium leading-relaxed">
                Join the ecosystem bridging household waste and sustainable agriculture. Monitor, compost, and grow.
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
                <h2 className="text-3xl font-bold text-[#3A4D39]">Welcome Back</h2>
                <p className="text-[#4F6F52] text-sm">Sign in to access your dashboard</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  
                  {/* email field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#3A4D39] font-semibold">Email Address</FormLabel>
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
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-[#3A4D39] font-semibold">Password</FormLabel>
                          <Link 
                            to="/password-reset" 
                            className="text-xs font-bold text-[#4F6F52] hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 bg-[#ECE3CE]/20 border-[#3A4D39]/20 focus-visible:ring-[#4F6F52] text-[#3A4D39] placeholder:text-[#3A4D39]/40 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Show Password Toggle */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPassword"
                      onCheckedChange={(checked) => setShowPass(checked)}
                      className="border-[#3A4D39]/40 data-[state=checked]:bg-[#3A4D39] data-[state=checked]:text-[#ECE3CE] rounded"
                    />
                    <Label htmlFor="showPassword" className="text-sm text-[#4F6F52] cursor-pointer font-medium">
                      Show Password
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#3A4D39] hover:bg-[#4F6F52] text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-[#3A4D39]/20 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Sign In <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  {/* Feedback Messages */}
                  {loginError && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"/> {loginError}
                    </div>
                  )}
                  {loginMessage && (
                    <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center font-medium border border-green-100 flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"/> {loginMessage}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#3A4D39]/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#739072] font-semibold">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Button */}
                  <div className="flex justify-center">
                    <div className="w-full [&_iframe]:mx-auto">
                      <GoogleLogin
                        width="100%"
                        logo_alignment="center"
                        shape="pill"
                        theme="outline"
                        size="large"
                        text="continue_with"
                        onSuccess={(res) => handleGoogleSignup(res.credential)}
                        onError={() => setLoginError("Google authentication failed")}
                      />
                    </div>
                  </div>
                </form>
              </Form>

              {/* Signup Link */}
              <div className="text-center text-sm text-[#739072]">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-[#3A4D39] hover:underline hover:text-[#4F6F52]">
                  Create one now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;