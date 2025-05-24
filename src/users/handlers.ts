import { Request, Response } from "express";
import {
    HTTPBadRequestError,
    HTTPConflictError,
    HTTPForbiddenError,
    HTTPNotFoundError,
    HTTPUnauthorizedError,
} from "../core/http-errors";
import { validateObjectId, validateRequest } from "../core/validation";
import {
    NotAllowed,
    InvalidCredentialsError,
    InvalidOtpError,
    OtpExpiredError,
    OtpGenerationForbidden,
    PostNotFoundError,
    UserAlreadyExistsError,
    usersService,
    UsersService,
} from "./services";
import {
    createUserSchema,
    sendOTPSchema,
    signInSchema,
    signUpSchema,
} from "./schemas";
import { getSuccededResponse } from "../core/utils";
import { requireAdmin, requireAuthorized } from "./utils";

export class UsersHandlers {
    public service: UsersService;
    constructor() {
        this.service = usersService;
    }

    public signUp = async (req: Request, res: Response) => {
        try {
            const body = validateRequest(req, signUpSchema);
            const data = await this.service.signUp(body);

            res.status(201).json(getSuccededResponse(data));
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) throw new HTTPConflictError(err.message);
            if (err instanceof InvalidOtpError)
                throw new HTTPBadRequestError(err.message)
            if (err instanceof OtpExpiredError)
                throw new HTTPBadRequestError(err.message)
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

    public deletePost = async (req: Request, res: Response): Promise<void> => {
        requireAdmin(res);
        const userId = validateObjectId(req.params.userId);
        const postId = validateObjectId(req.params.postId)
        try{
            const post = await this.service.deletePost(userId, postId)
            res.status(200).json(getSuccededResponse(post));
        }catch(err){
            if (err instanceof PostNotFoundError) {
                throw new HTTPNotFoundError("Post not found")
            } else if (err instanceof NotAllowed){
                throw new HTTPForbiddenError("It`s not your post")
            }
            throw err;
        }
    }

    // 1. фронт отправляет запрос с имеилом юзера для отправки токена на его почту
    // 2. фронт отправляет запрос на регистрацию с данными пользователя + токен который юзер ввел
    public sendOTP = async (req: Request, res: Response) => {
        const body = validateRequest(req, sendOTPSchema)
        try {
            await this.service.sendOTP(body.email)
        } catch (err) {
            if (err instanceof OtpGenerationForbidden) {
                throw new HTTPForbiddenError("You can't create otp if you already registered")
            }
            throw err
        }
        res.status(204).send()
    }

}
