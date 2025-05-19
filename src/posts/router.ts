import { Router } from "express";
import { PostsHandlers } from "./handlers";

const router = Router()
const handlers = new PostsHandlers()

router.get("/listPosts", handlers.listPosts);
router.post("/createPost", handlers.createPost);

export default router;
