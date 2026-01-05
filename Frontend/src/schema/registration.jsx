import { z } from "zod";

export const registration = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required"),

    lastName: z
      .string()
      .min(1, "Last name is required"),

    contactNumber: z
      .string()
      .min(10, "Contact number must be at least 10 digits")
      .regex(/^[0-9]+$/, "Contact number must contain only numbers"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z
      .string()
      .min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
