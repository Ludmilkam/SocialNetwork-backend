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
  email: z.string().email(),
});

export const createUserSchema = signUpSchema;

// export const updateUserSchema = signUpSchema.omit({ password: true });

export const updateMeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  birthDate: z.string().optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string()
})

export const createAlbumSchema = z.object({
  name: z.string().min(1, 'Album name is required'),
  subject: z.string().min(1, 'Album subject is required'),
  topic_id: z.number()
})

export const updateAlbumSchema = z.object({
  name: z.string().min(1, 'Album name is required').optional(),
  subject: z.string().min(1, 'Album subject is required').optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear()).optional()
});
