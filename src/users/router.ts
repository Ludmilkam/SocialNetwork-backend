import { Router } from "express";
import { UsersHandlers } from "./handlers";

const router = Router();

const handlers = new UsersHandlers()

router.post("/signup", handlers.signUp);
router.post("/signin", handlers.signIn);
router.get("/me", handlers.getUser);
router.get("/:id", handlers.getUser);

router.get("/admin/list-users", handlers.listUsers);
router.post("/admin/create", handlers.createUser);

export default router;
