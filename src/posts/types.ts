import { MediaType, Prisma } from "../generated/prisma";
import { z } from "zod";
import { createPostSchema } from "./schemas";

export type Post = Prisma.PostGetPayload<{}>
export type CreatePostInput = z.infer<typeof createPostSchema> & { media: { url: string, type: MediaType }[] };
