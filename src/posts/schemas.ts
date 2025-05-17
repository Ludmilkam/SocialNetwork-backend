import { z } from "zod";

export const createPostSchema = z.object({
    title: z
        .string()
        .max(50, "The title must contain a maximum of 50 characters"),
    subject: z.string(),
    body: z.string(),
    link: z.string().url(),
});
