import { Prisma } from "../generated/prisma";
import { z } from "zod";
import { createPostSchema } from "./schemas";

export type Post = Prisma.PostGetPayload<{}>
export type createPostInput = z.infer<typeof createPostSchema>;
