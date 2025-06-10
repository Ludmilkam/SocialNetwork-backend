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
  InvalidCredentialsError,
  InvalidOtpError,
  OtpExpiredError,
  OtpGenerationForbidden,
  UserAlreadyExistsError,
  usersService,
  UsersService,
} from "./services";
import {
  createUserSchema,
  sendOTPSchema,
  signInSchema,
  signUpSchema,
  updateMeSchema,
} from "./schemas";
import { getSuccededResponse } from "../core/utils";
import { requireAdmin, requireAuthorized } from "./utils";
import { Config } from "../core/config";

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
      if (err instanceof UserAlreadyExistsError)
        throw new HTTPConflictError(err.message);
      if (err instanceof InvalidOtpError)
        throw new HTTPBadRequestError(err.message);
      if (err instanceof OtpExpiredError)
        throw new HTTPBadRequestError(err.message);
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

  public getMe = async (req: Request, res: Response) => {
    try {
      const userId = requireAuthorized(res);
      const user = await this.service.getUser(userId);
      res.status(200).json(getSuccededResponse(user));
    } catch (err) {
      if (err instanceof InvalidCredentialsError)
        throw new HTTPUnauthorizedError(err.message);
      throw err;
    }
  };

  public updateMe = async (req: Request, res: Response) => {
    const avatarUrl = req.file ? Config.getMediaServeUrl() + "/" + req.file.filename : undefined
    try {
      const userId = requireAuthorized(res);
      const body = validateRequest(req, updateMeSchema);
      const user = await this.service.updateUser(userId, { ...body, avatarUrl });
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
        const body = validateRequest(req, updateUserSchema);
        const userId = requireAuthorized(res);
        try {
            const user = await this.service.updateUser(userId, body);
            res.status(200).json(getSuccededResponse(user));
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                throw new HTTPConflictError(err.message);
            }
            throw err;
        }
    };

    public blockUser = async (req: Request, res: Response): Promise<void> => {
        const { userId, blockedUserId } = req.body;
        try {
            await this.service.blockUser(Number(userId), Number(blockedUserId));
            res.status(204).send();
        } catch (err) {
            if (err instanceof UserNotFoundError) {
                throw new HTTPNotFoundError("User not found");
            }
            throw err;
        }
    };

    public acceptRequest = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const toUserId = requireAuthorized(res)
        const { fromUserId } = req.body;
        const result = await this.service.acceptRequest(fromUserId, toUserId);
        res.status(200).json(getSuccededResponse(result));
    };

    public declineRequest = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const toUserId = requireAuthorized(res)
        const fromUserId = Number(req.params.fromUserId);
        await this.service.declineRequest(fromUserId, toUserId);
        res.status(204).send();
    };

    public deleteFriend = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const currUserId = requireAuthorized(res)
        const friendId = Number(req.params.friendId);
        try {
            await this.service.deleteFriend(
                friendId,
                currUserId
            );
            res.status(204).send();
        } catch (err) {
            throw new HTTPBadRequestError("bad request")
        }
    };

    public createFriendRequest = async (req: Request, res: Response): Promise<void> => {
        const fromUserId = requireAuthorized(res)
        const { toUserId } = req.body;

        try {
            const result = await this.service.createFriendRequest(
                fromUserId,
                toUserId
            );
            res.json(getSuccededResponse(result));
        } catch (err) {
            res.status(400).json({ success: false, message: err });
        }
    };

    public deletePost = async (req: Request, res: Response): Promise<void> => {
        requireAdmin(res);
        const userId = validateObjectId(req.params.userId);
        const postId = validateObjectId(req.params.postId);
        try {
            const post = await this.service.deletePost(userId, postId);
            res.status(200).json(getSuccededResponse(post));
        } catch (err) {
            if (err instanceof PostNotFoundError) {
                throw new HTTPNotFoundError("Post not found");
            } else if (err instanceof NotAllowed) {
                throw new HTTPForbiddenError("It`s not your post");
            }
            throw err;
        }
    };

    public allFriends = async (req: Request, res: Response) => {
        const userId = requireAuthorized(res);
        const allFriends = await this.service.allFriends(userId);
        console.log(allFriends);
        res.status(200).json(getSuccededResponse(allFriends));
    };

    public friendRequests = async (req: Request, res: Response) => {
        const userId = requireAuthorized(res);
        const friendRequests = await this.service.friendRequests(userId);
        console.log(friendRequests);
        res.status(200).json(getSuccededResponse(friendRequests));
    };

    // 1. фронт отправляет запрос с имеилом юзера для отправки токена на его почту
    // 2. фронт отправляет запрос на регистрацию с данными пользователя + токен который юзер ввел
    public sendOTP = async (req: Request, res: Response) => {
        const body = validateRequest(req, sendOTPSchema);
        try {
            await this.service.sendOTP(body.email);
        } catch (err) {
            if (err instanceof OtpGenerationForbidden) {
                throw new HTTPForbiddenError(
                    "You can't create otp if you already registered"
                );
            }
            throw err;
        }
        res.status(204).send();
    };
}
