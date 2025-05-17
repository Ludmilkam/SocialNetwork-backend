import { Response } from "express";
import { HTTPForbiddenError, HTTPUnauthorizedError } from "../core/http-errors";
import { ShowUser } from "./types";
import { container } from "./container";
import { InvalidCredentialsError } from "./services";

export const requireAuthorized = (res: Response): number => {
    if (!res.locals.userId) {
        throw new HTTPUnauthorizedError();
    }
    return res.locals.userId;
};

export const requireAdmin = (res: Response): Promise<ShowUser> => {
    const userId = requireAuthorized(res);
    try {
        const user = container.service.getUser(userId);
        return user;
    } catch (err) {
        if (err instanceof InvalidCredentialsError)
            throw new HTTPForbiddenError("Only admin can access that page");
        throw err;
    }
};
