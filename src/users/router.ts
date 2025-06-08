import { Router } from "express";
import { upload } from "../core/utils";
import { UsersHandlers } from "./handlers";

const router = Router();

const handlers = new UsersHandlers();

router.post("/signup", handlers.signUp);
router.post("/signin", handlers.signIn);
router.get("/me", handlers.getMe);
router.patch("/me/update", upload.single("avatar"), handlers.updateMe)
router.post("/send-otp", handlers.sendOTP);

router.get("/admin/list-users", handlers.listUsers);
router.post("/admin/create", handlers.createUser);

export default router;
