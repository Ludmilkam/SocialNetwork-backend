import { Request, Response } from "express";
import { validateObjectId, validateRequest } from "../core/validation";
import { getSuccededResponse } from "../core/utils";
import { requireAuthorized } from "../users/utils";
import { createPostSchema } from "./schemas";
import { PostNotFoundError, PostsService, postsService } from "./services";
import { Config } from "../core/config";
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
    const images = req.files
      ? (req.files as Express.Multer.File[]).map((item) => ({
        file: Config.getMediaServeUrl(),
        filename: item.filename
      }))
      : [];
    const post = await this.service.createPost(userId, {
      ...body,
      images,
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
  public listTags = async (req: Request, res: Response) => {
    const posts = await this.service.listTags();
    res.status(200).json(getSuccededResponse(posts))
  };
}
