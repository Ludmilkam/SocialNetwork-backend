import { z } from "zod";
import { Role } from "@prisma/client";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z
        .string()
        .min(8, "The password must contain at least 6 characters"),
});

export const signUpSchema = signInSchema.extend({
    username: z.string().min(4, "username must contain at least 4 characters"),
});
export const createUserSchema = signUpSchema.extend({
    role: z.optional(z.nativeEnum(Role)),
});
export const updateUserSchema = createUserSchema.omit({ password: true });
