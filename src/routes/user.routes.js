import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover,
    getUserChannelProfile,
    getWatchHistory 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);


// secure routes
router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails); //use patch for update

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar); //use patch for update

router.route("/update-cover").patch(verifyJWT, upload.single("coverImage"), updateUserCover); //use patch for update

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);


export default router