import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .max(50, "The title must contain a maximum of 50 characters")
    .min(1, "The title must contain at least 1 characters"),
  subject: z.string(),
  content: z.string(),
  links: z.preprocess(
    (val) => {
      if (val && typeof val === "string") {
        return [val];
      }
      return val;
    },
    z.array(z.string().url()).optional().or(z.literal("")),
  ),
});

export const createTagSchema = z.object({
    name: z.string()
})
