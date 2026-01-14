import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { registration } from "@/schema/registration";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUser } from "@/contexts/UserContext";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);
  const [registerError, setRegisterError] = useState(null);
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

  async function onSubmit(values) {
    try {
      setRegisterError(null);
      setRegisterMessage(null);

      const formData = {
        firstname: values.firstName,
        lastname: values.lastName,
        email: values.email,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:3000/user/signup",
        formData
      );

      if (!response.data.ok) {
        setRegisterError(response.data.error || "Register failed");
        return;
      }

      setRegisterMessage(
        "Register successful! Please check your email to verify your account."
      );
    } catch (error) {
      setRegisterError(error.message || "An error occurred");
      console.error(error);
    }
  }

  async function handleGoogleSignup(credential) {
    try {
      setRegisterError(null)
      
      const response = await axios.post(
        "http://localhost:3000/user/google-signup",
        { credential }
      )

      if (!response.data.ok) {
        setRegisterError(response.data.error || "Google Signup Failed")
        return
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

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <section className="flex w-full min-h-screen justify-between">
        <div className="hidden md:flex justify-center items-center relative">
          <img src="/Login.png" alt="Background" className="h-full w-lg" />
          <img
            src="/Logo.svg"
            alt="Logo"
            className="absolute h-128 hidden lg:flex -right-40"
          />
        </div>

        <div className="flex flex-col items-center w-full md:w-2/3 pt-12 pb-4">
          <Form {...form}>
            <h1 className="text-5xl font-semibold mb-3">Create an account</h1>

            <p className="text-base mb-8">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-700 font-medium">
                Sign in
              </Link>
            </p>

            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-96 lg:w-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          className="h-12 text-base px-4 border border-secondary-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          className="h-12 text-base px-4 border border-secondary-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe@example.com"
                        className="h-12 text-base px-4 border border-secondary-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 text-base px-4 border border-secondary-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          className="h-12 text-base px-4 border border-secondary-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="showPassword"
                  onCheckedChange={(checked) =>
                    setShowPassword(Boolean(checked))
                  }
                  className="border-secondary-foreground data-[state=checked]:bg-secondary data-[state=checked :text-secondary-foreground  data-[state=checked :border-secondary border-secondary"
                />
                <Label htmlFor="showPassword" className="text-base">
                  Show password
                </Label>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Your password must have:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>At least 8 characters</li>
                  <li>Upper & lowercase letters</li>
                  <li>One number & one special character</li>
                </ul>
              </div>

              {registerError && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded text-red-700 text-base">
                  {registerError}
                </div>
              )}

              {registerMessage && (
                <div className="w-full p-3 bg-green-50 border border-green-200 rounded text-green-700 text-base">
                  {registerMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-secondary hover:bg-secondary-foreground"
              >
                Register
              </Button>

              <div className="flex items-center justify-between">
                <hr className="w-1/3 border-secondary" />
                <span className="font-medium">Or</span>
                <hr className="w-1/3 border-secondary" />
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
