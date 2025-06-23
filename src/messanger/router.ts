import { Router } from "express";
import { MessangerHandlers } from "./handlers";

const handlers = new MessangerHandlers();
const router = Router();

router.get("/chats", handlers.listGroupChats);
router.get("/chats/personal", handlers.listPersonalChats);

export default router;
