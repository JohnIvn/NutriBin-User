import { z } from "zod";

export const registration = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(3, "First name must be at least 3 characters")
      .regex(/^[A-Za-z\s]+$/, "First name must contain only letters"),

    lastName: z
      .string()
      .trim()
      .min(3, "Last name must be at least 3 characters")
      .regex(/^[A-Za-z\s]+$/, "Last name must contain only letters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email (example@domain.com)")
      .refine(
        (val) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(val), // stricter real email pattern
        "Please enter a proper email address",
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
