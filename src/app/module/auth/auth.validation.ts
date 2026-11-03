import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const AuthValidation = { loginValidationSchema };