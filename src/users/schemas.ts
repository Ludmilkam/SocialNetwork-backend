import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "The password must contain at least 8 characters"),
});

export const signUpSchema = signInSchema.extend({
    username: z.string().min(4, "username must contain at least 4 characters"),
    otp: z.string().min(6)
});

export const sendOTPSchema = z.object({
    email: z.string().email()
})

export const createUserSchema = signUpSchema

export const updateUserSchema = signUpSchema.omit({ password: true });
