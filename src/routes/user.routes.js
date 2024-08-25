import {Router} from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserDetails,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  // upload is middleware called before calling the controler(method)
  upload.fields([
    // in user table we get two fields avatr or coverImage
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// seccured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-current-password").post(changeCurrentPassword);

router.route("/get-current-user").get(getCurrentUser);

router.route("/get-user-details").get(getUserDetails);

router.route("/update-account-details").post(verifyJWT,updateAccountDetails);

router.route("/update-avatar").post(updateUserAvatar);

router.route("/update-cover-Image").post(updateUserCoverImage);

export default router;
