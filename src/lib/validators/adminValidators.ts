import { z } from "zod";

export const createAdminAccountValidator = z.object({
  institute_name: z
    .string()
    .min(3, "Institute name must be at least 3 characters long")
    .max(255, "Institute name must not exceed 255 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .regex(
      /\.(edu|ac\.in)$/,
      "Email must be from an educational institution (.edu or .ac.in)"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must not exceed 255 characters"),
  address: z
    .string()
    .min(3, "Address must be at least 3 characters long")
    .max(255, "Address must not exceed 255 characters"),
});

export const loginAccountValidator = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password must not exceed 255 characters"),
});

export const addResearcherValidator = z.object({
  scholar_id: z
    .string()
    .min(3, "Scholar ID must be at least 3 characters long")
    .max(255, "Scholar ID must not exceed 255 characters"),
  email: z.string().email("Invalid email address"),
});
