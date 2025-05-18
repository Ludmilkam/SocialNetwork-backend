import { Prisma } from "../generated/prisma";
import { z } from "zod";
import { createPostSchema } from "./schemas";

export type PostCreate = Prisma.PostCreateInput;
export type createPostInput = z.infer<typeof createPostSchema>;
