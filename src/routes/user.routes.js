import {Router} from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
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

export default router;
