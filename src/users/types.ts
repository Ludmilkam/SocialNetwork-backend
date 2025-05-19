import { Prisma } from "../generated/prisma";
import { z } from "zod";
import {
    createUserSchema,
    signInSchema,
    signUpSchema,
    updateUserSchema,
} from "./schemas";

export type AuthTokenPayload = { uid: number };

export type UserCreate = Prisma.UserUncheckedCreateInput;
export type User<S extends boolean | null | undefined | Prisma.UserDefaultArgs = {}> = Prisma.UserGetPayload<S>
export type ShowUser<S extends boolean | null | undefined | Prisma.UserDefaultArgs = {}> = Omit<User<S>, "password"> & { password: undefined };
export type ShowUserWithRelations = ShowUser<{ include: { createdPosts: true } }>

export type signInInput = z.infer<typeof signInSchema>;
export type signUpInput = z.infer<typeof signUpSchema>;
export type createUserInput = z.infer<typeof createUserSchema>;
export type updateUserInput = z.infer<typeof updateUserSchema>;
