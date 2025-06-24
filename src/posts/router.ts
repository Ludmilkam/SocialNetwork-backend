import { Router } from "express";
import { PostsHandlers } from "./handlers";
import { upload } from "../core/utils";

const router = Router();
const handlers = new PostsHandlers();

router.get("/", handlers.listPosts);
router.post("/", upload.array("media", 6), handlers.createPost);
router.patch("/:id", upload.array("media"), handlers.updatePost)
router.delete("/:id", handlers.deletePost);
router.get("/tags", handlers.listTags)
router.post("/create-tag", handlers.createTag)

export default router;
