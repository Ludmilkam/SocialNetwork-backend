import { Router } from "express";
import { PostsHandlers } from "./handlers";

const router = Router();

const handlers = new PostsHandlers()

router.get("/", handlers.listPosts)

export default router;
