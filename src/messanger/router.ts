import { Router } from "express";
import { MessangerHandlers } from "./handlers";

const handlers = new MessangerHandlers()
const router = Router()

router.get("/chats", handlers.listUserChats)

export default router;
