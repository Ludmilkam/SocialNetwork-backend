import { PrismaClient } from "./generated/prisma";
import { PrismaClientKnownRequestError } from "./generated/prisma/runtime/library";

export const prisma = new PrismaClient({ log: ["query"] });
export const getErrorCode = (err: unknown) =>
  err instanceof PrismaClientKnownRequestError && err.code;
export enum ErrorCodes {
  NotFound = "P2025",
  AlreadyExists = "P2002",
}
