import { Request, Response } from "express";
import { validateRequest } from "../core/validation";
import { getSuccededResponse } from "../core/utils";
import { requireAuthorized } from "../users/utils";
import { createPostSchema } from "./schemas";
import { PostsService, postsService } from "./services";

export class PostsHandlers {
    public service: PostsService;
    constructor() {
        this.service = postsService;
    }
    public listPosts = async (req: Request, res: Response) => {
        const posts = await this.service.listPosts();
        res.status(200).json(getSuccededResponse(posts))
    };

    public createPost = async (req: Request, res: Response): Promise<void> => {
        const userId = requireAuthorized(res);
        const body = validateRequest(req, createPostSchema);
        const post = await this.service.createPost(userId, body);
        res.status(200).json(getSuccededResponse(post))

    }
}
