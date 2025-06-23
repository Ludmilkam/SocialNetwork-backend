import { Prisma } from "../generated/prisma";
import { z } from "zod";
import { createPostSchema, createTagSchema } from "./schemas";

export type Post = Prisma.PostGetPayload<{}>;
export type CreatePostInput = z.infer<typeof createPostSchema> & {
  images: { filename: string, file: string }[];
};

export type Tag = Prisma.TagGetPayload<{}>
export type CreateTagInput = z.infer<typeof createTagSchema>
