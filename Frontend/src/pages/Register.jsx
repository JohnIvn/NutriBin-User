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
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerMessage, setRegisterMessage] = useState(null);
  const [registerError, setRegisterError] = useState(null);

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

  return (
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
                  <FormLabel className="text-base font-medium">Email</FormLabel>
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
                onCheckedChange={(checked) => setShowPassword(Boolean(checked))}
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

            <Button
              type="button"
              className="w-full h-12 text-base font-medium bg-secondary hover:bg-secondary-foreground"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
