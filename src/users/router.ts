import { Router } from "express";
import { container } from "./container";

const router = Router();

router.post("/signup", container.handlers.signUp);
router.post("/signin", container.handlers.signIn);
router.get("/me", container.handlers.getUser);
router.get("/:id", container.handlers.getUser);

router.get("/admin/list-users", container.handlers.listUsers);
router.post("/admin/create", container.handlers.createUser);
router.delete("/admin/delete/:id", container.handlers.deleteUser);
router.patch("/admin/update/:id", container.handlers.updateUser);

export default router;
