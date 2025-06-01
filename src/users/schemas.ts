import { z } from "zod";
import { Config } from "../core/config";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "The password must contain at least 8 characters"),
});

export const signUpSchema = signInSchema.extend({
    otp: z.string().length(Config.OTP_LENGTH),
});

export const sendOTPSchema = z.object({
    email: z.string().email()
})

export const createUserSchema = signUpSchema

export const updateUserSchema = signUpSchema.omit({ password: true });


// export const updateSchema = .omit({ email: true,password: true });