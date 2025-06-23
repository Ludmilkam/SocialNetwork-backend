import { PrismaClient } from "./generated/prisma";
import { PrismaClientKnownRequestError } from "./generated/prisma/runtime/library";

export const prisma = new PrismaClient({ log: [{ emit: "event", level: "query" }] });
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

export const getErrorCode = (err: unknown) =>
  err instanceof PrismaClientKnownRequestError && err.code;
export enum ErrorCodes {
  NotFound = "P2025",
  AlreadyExists = "P2002",
}
