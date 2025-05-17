import express from "express";
import usersRouter from "../users/router";
import postsRouter from "../posts/router";

const router = express.Router();

router.use("/users", usersRouter);
router.use("/posts", postsRouter);

export default router;
