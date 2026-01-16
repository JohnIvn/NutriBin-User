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
import Requests from "@/utils/Requests";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

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
    console.log("Form submitted with values:", values);
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
      <section className="flex w-full min-h-screen justify-between">
        <div className="hidden md:flex justify-center items-center bg-center relative max-h-full m-auto">
          <img src="/Login.png" alt="Logo" className="h-full w-lg -right-64" />
          <img
            src="/Logo.svg"
            alt="Logo"
            className="absolute h-128 w-lg -right-64 hidden lg:flex"
          />
        </div>

        <div className="flex flex-col items-center w-full lg:w-2/3 pt-20 pb-2">
          <Form {...form}>
            <h1 className="w-auto text-start text-5xl font-semibold mb-8">
              Sign In
            </h1>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-96 lg:w-md"
            >
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example123@gmail.com"
                        className="border border-secondary-foreground h-12 text-base px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        className="border border-secondary-foreground h-12 text-base px-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between w-full">
                <div className="flex h-full justify-center items-center w-auto gap-2">
                  <Checkbox
                    id="showPassword"
                    onCheckedChange={(checked) => setShowPass(checked)}
                    className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked :text-secondary-foreground  data-[state=checked :border-secondary border-secondary"
                  />

                  <Label htmlFor="showPassword">
                    <span className="text-base md:text-base">
                      Show Password
                    </span>
                  </Label>
                </div>

                <Button
                  type="button"
                  asChild
                  className={
                    "h-full p-0 text-secondary bg-transparent hover:text-secondary-foreground"
                  }
                >
                  <Link to={"/password-reset"}>Forgot password?</Link>
                </Button>
              </div>

              <Button
                type="submit"
                className="bg-secondary hover:bg-secondary-foreground w-full h-12 text-base font-medium"
              >
                Login
              </Button>

              {loginError && (
                <div className="text-center w-full p-3 bg-red-50 border border-red-200 rounded text-red-700 text-base">
                  {loginError}
                </div>
              )}
              {loginMessage && (
                <div className="w-full p-3 bg-green-50 border border-green-200 rounded text-green-700 text-base">
                  {loginMessage}
                </div>
              )}

              <div className="flex justify-between items-center">
                <hr className="w-1/3 border border-secondary" />
                <h1 className="font-medium">Or</h1>
                <hr className="w-1/3 border border-secondary" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(res) => handleGoogleSignup(res.credential)}
                  onError={() =>
                    setRegisterError("Google authentication failed")
                  }
                />
              </div>
            </form>
          </Form>
        </div>
      </section>
    </GoogleOAuthProvider>
  );
}

export default Login;
