import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const prisma = new PrismaClient();
export const getErrorCode = (err: unknown) =>
    err instanceof PrismaClientKnownRequestError && err.code;
export enum ErrorCodes {
    NotFound = "P2025",
    AlreadyExists = "P2002",
}
