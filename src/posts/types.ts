import { Prisma } from "../generated/prisma";
import { z } from "zod";
import { createPostSchema, updatePostSchema } from "./schemas";

export type Post = Prisma.PostGetPayload<{}>;
type PostImages = {
  images: { filename: string; file: string }[];
}
export type CreatePostInput = z.infer<typeof createPostSchema> & PostImages;
export type UpdatePostInput = z.infer<typeof updatePostSchema> & PostImages
