import { Router } from "express";
import { MessangerHandlers } from "./handlers";

const handlers = new MessangerHandlers();
const router = Router();

router.get("/chats", handlers.listGroupChats);
router.get("/chats/personal", handlers.listPersonalChats);
router.get("/chats/:id", handlers.getChat)

export default router;
