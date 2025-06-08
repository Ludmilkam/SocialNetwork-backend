import { Router } from "express";
import { UsersHandlers } from "./handlers";

const router = Router();

const handlers = new UsersHandlers()

router.post("/signup", handlers.signUp);
router.post("/signin", handlers.signIn);
router.post("/update", handlers.updateUser)
router.get("/me", handlers.getUser);
router.post("/send-otp", handlers.sendOTP)
router.delete("/delete", handlers.deletePost)

router.get("/all-friends", handlers.allFriends);
router.get("/requests", handlers.friendRequests);
router.get("/list-users", handlers.listUsers);

router.post("/block-user", handlers.blockUser)
router.post("/accept-request", handlers.acceptRequest)
router.post("/decline-request", handlers.declineRequest)
router.post("/delete-friend", handlers.deleteFriend)
router.post("/add-friend", handlers.addFriend)
// router.post("/send-message")

router.post("/admin/create", handlers.createUser);

export default router;
