import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "The password must contain at least 8 characters"),
});

export const signUpSchema = signInSchema.extend({
    username: z.string().min(4, "username must contain at least 4 characters"),
    phoneNumber: z.string().min(5),
    aboutMe: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    otp: z.string().min(6),
    avatarUrl: z.string().optional(),
});

export const sendOTPSchema = z.object({
    email: z.string().email()
})

export const createUserSchema = signUpSchema

export const updateUserSchema = signUpSchema.omit({ password: true });
