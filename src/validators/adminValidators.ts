import { z } from "zod";

export const createAdminAccountValidator = z.object({
  institute_name: z.string().min(3).max(255),
  email: z
    .string()
    .email()
    .regex(/\.(edu|ac\.in)$/),
  password: z.string().min(8).max(255),
  address: z.string().min(3).max(255),
});

export const loginAccountValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
