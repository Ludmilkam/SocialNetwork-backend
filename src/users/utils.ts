import { Response } from "express";
import { HTTPUnauthorizedError } from "../core/http-errors";

export const requireAuthorized = (res: Response): number => {
  if (!res.locals.userId) {
    throw new HTTPUnauthorizedError();
  }
  return res.locals.userId;
};
