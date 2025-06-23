import { Router } from "express";
import { UsersHandlers } from "./handlers";
import { upload } from "../core/utils";

const router = Router();

const handlers = new UsersHandlers()

router.post("/signup", handlers.signUp);
router.post("/signin", handlers.signIn);
router.post("/update", handlers.updateUser)
router.get("/me", handlers.getMe);
router.patch("/me/update", upload.single("avatar"), handlers.updateMe)
router.post("/update", handlers.updateUser)
router.post("/send-otp", handlers.sendOTP);
router.delete("/delete", handlers.deletePost)

router.get("/all-friends", handlers.allFriends);
router.get("/requests", handlers.friendRequests);
router.post("/requests/create", handlers.createFriendRequest)
router.post("/requests/accept", handlers.acceptRequest)
router.delete("/requests/decline/:fromUserId", handlers.declineRequest)
router.delete("/delete-friend/:friendId", handlers.deleteFriend)
router.delete("/albums/:albumId", handlers.deleteAlbum)
router.patch("/albums/:albumId", upload.array("images", 30), handlers.updateAlbum)
router.post("/albums/", handlers.createAlbum)
// router.get("/me/albums") усі альбоми юзера під акком якого ми зайшли
router.get("/:userId", handlers.getUserById)

router.get("/list-users", handlers.listUsers);
router.get("/recommendations", handlers.listRecommendedUsers)

// router.post("/block-user", handlers.blockUser)

// router.post("/send-message")
router.get("/:id", handlers.getUserById)

export default router;
