import express from "express";
import usersRouter from "../users/router";
import postsRouter from "../posts/router";
import messangerRouter from "../messanger/router"

const router = express.Router();

router.use("/users", usersRouter);
router.use("/posts", postsRouter);
router.use("/messanger", messangerRouter)

export default router;
