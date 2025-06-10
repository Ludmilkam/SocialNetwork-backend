import { Router } from "express";
import { UsersHandlers } from "./handlers";

const router = Router();

const handlers = new UsersHandlers()

router.post("/signup", handlers.signUp);
router.post("/signin", handlers.signIn);
router.post("/update", handlers.updateUser)
router.get("/me", handlers.getMe);
router.patch("/me/update", upload.single("avatar"), handlers.updateMe)
router.post("/send-otp", handlers.sendOTP);
router.delete("/delete", handlers.deletePost)

router.get("/all-friends", handlers.allFriends);
router.get("/requests", handlers.friendRequests);
router.get("/list-users", handlers.listUsers);

// router.post("/block-user", handlers.blockUser)
router.post("/accept-request", handlers.acceptRequest)
router.delete("/decline-request", handlers.declineRequest)
router.delete("/delete-friend", handlers.deleteFriend)
// router.post("/send-message")



router.get("/admin/list-users", handlers.listUsers);


router.post("/admin/create", handlers.createUser);

export default router;
