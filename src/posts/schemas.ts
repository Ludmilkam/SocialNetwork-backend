import { z } from "zod";

export const createPostSchema = z.object({
    title: z.string()
        .min(1, "Назва обов’язкова")
        .max(50, "Максимум 50 символів"),
    subject: z.string().min(1, "Тема обов’язкова"),
    body: z.string().min(1, "Текст публікації обов’язковий"),
    tags: z.array(z.string()).optional(),
    link: z.string().max(100, "Максимум 100 символів"),
});