import { Request, Response } from "express";
import { postsService, PostsService } from "./services";
import { getSuccededResponse } from "../core/utils";

export class PostsHandlers {
  public service: PostsService;
  constructor() {
    this.service = postsService;
  }
  public listPosts = async (req: Request, res: Response) => {
    const posts = await this.service.listPosts()
    res.status(200).json(getSuccededResponse(posts));
  }
}
