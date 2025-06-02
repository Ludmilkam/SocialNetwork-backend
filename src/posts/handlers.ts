import { Request, Response } from "express";
import { validateObjectId, validateRequest } from "../core/validation";
import { getSuccededResponse } from "../core/utils";
import { requireAuthorized } from "../users/utils";
import { createPostSchema } from "./schemas";
import { PostNotFoundError, PostsService, postsService } from "./services";
import { Config } from "../core/config";
import { MediaType } from "../generated/prisma";
import { HTTPNotFoundError } from "../core/http-errors";

export class PostsHandlers {
  public service: PostsService;
  constructor() {
    this.service = postsService;
  }
  public listPosts = async (req: Request, res: Response) => {
    const posts = await this.service.listPosts();
    res.status(200).json(getSuccededResponse(posts));
  };

  public createPost = async (req: Request, res: Response): Promise<void> => {
    const userId = requireAuthorized(res);
    const body = validateRequest(req, createPostSchema);
    const media = req.files
      ? (req.files as Express.Multer.File[]).map((item) => ({
          url:
            Config.MEDIA_SERVE_URL ||
            `http://${Config.SERVER_HOST}:${Config.SERVER_PORT}/${item.filename}`,
          type: MediaType.IMAGE,
        }))
      : [];
    const post = await this.service.createPost(userId, {
      ...body,
      media,
    });
    res.status(200).json(getSuccededResponse(post));
  };

  public deletePost = async (req: Request, res: Response): Promise<void> => {
    const userId = requireAuthorized(res);
    const postId = validateObjectId(req.params.id);
    try {
      await this.service.deletePostForUser(userId, postId);
      res.status(204).send();
    } catch (err) {
      if (err instanceof PostNotFoundError) {
        throw new HTTPNotFoundError("Post not found or not belongs to you");
      }
      throw err;
    }
  };
}
