import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HTTPUnauthorizedError } from "../core/http-errors";
import { AuthTokenPayload } from "./types";

export class UsersMiddlewares {
    public authenticate = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }
        const authErr = new HTTPUnauthorizedError("Invalid credentials");
        const [schema, token] = authHeader.split(" ");
        if (!schema || schema.toLowerCase() != "bearer" || !token) {
            throw authErr;
        }
        let payload;
        try {
            payload = jwt.verify(
                token,
                process.env.JWT_SECRET!,
            ) as AuthTokenPayload;
        } catch {
            throw authErr;
        }
        res.locals.userId = payload.uid;
        next();
    };
}

export const usersMiddlewares = new UsersMiddlewares()
