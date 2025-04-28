import { Request, Response } from "express";
import {
    HTTPConflictError,
    HTTPNotFoundError,
    HTTPUnauthorizedError,
} from "../core/http-errors";
import { validateObjectId, validateRequest } from "../core/validation";
import {
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotFoundError,
    UsersService,
} from "./services";
import {
    createUserSchema,
    signInSchema,
    signUpSchema,
    updateUserSchema,
} from "./schemas";
import { getSuccededResponse } from "../core/utils";
import { requireAdmin, requireAuthorized } from "./utils";

export class UsersHandlers {
    constructor(public service: UsersService) {
        this.service = service;
    }

    public signUp = async (req: Request, res: Response) => {
        try {
            const body = validateRequest(req, signUpSchema);
            const data = await this.service.signUp(body);

            res.status(201).json(getSuccededResponse(data));
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) throw new HTTPConflictError(err.message);
            throw err;
        }
    };

    public signIn = async (req: Request, res: Response) => {
        try {
            const body = validateRequest(req, signInSchema);
            const token = await this.service.signIn(body);
            res.json(getSuccededResponse(token));
        } catch (err) {
            if (err instanceof InvalidCredentialsError)
                throw new HTTPUnauthorizedError(err.message);
            throw err;
        }
    };

    public getUser = async (req: Request, res: Response) => {
        const userId = requireAuthorized(res);
        try {
            const user = await this.service.getUser(userId);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof InvalidCredentialsError)
                throw new HTTPUnauthorizedError(err.message);
            throw err;
        }
    };
    public listUsers = async (req: Request, res: Response) => {
        const users = await this.service.listUsers();
        res.status(200).json(users);
    };

    public getUserById = async (req: Request, res: Response) => {
        requireAdmin(res);
        const userId = validateObjectId(req.params.id);
        try {
            const user = await this.service.getUser(userId);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                throw new HTTPNotFoundError("User not found");
            }
            throw err;
        }
    };

    public createUser = async (req: Request, res: Response): Promise<void> => {
        requireAdmin(res);
        const body = validateRequest(req, createUserSchema);
        try {
            const user = await this.service.createUser(body);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                throw new HTTPConflictError(err.message);
            }
            throw err;
        }
    };
    public updateUser = async (req: Request, res: Response): Promise<void> => {
        const userId = validateObjectId(req.params.id);
        const body = validateRequest(req, updateUserSchema);
        try {
            const user = await this.service.updateUser(body, userId);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                throw new HTTPNotFoundError(err.message);
            }
            if (err instanceof UserAlreadyExistsError)
                throw new HTTPConflictError(err.message);
            throw err;
        }
    };
    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        requireAdmin(res);
        const userId = validateObjectId(req.params.id);
        try {
            const user = await this.service.deleteUser(userId);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof UserNotFoundError)
                throw new HTTPNotFoundError(err.message);
            throw err;
        }
    };
}
