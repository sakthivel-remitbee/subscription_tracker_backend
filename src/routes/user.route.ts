import { Router } from "express";
import upload from "../middlewares/upload.middleware";
import { uploadImage } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { profileUpdate } from "../controllers/profileUpdate.controller";
import { passwordUpdate } from "../controllers/passwordUpdate.controller";
import { deleteUser } from "../controllers/deleteUser.controller";
import { profile } from "../controllers/profile.controller";

const router = Router();

router.put("/store/img",  authMiddleware ,upload.single("image"), uploadImage);
router.put("/updates/details",  authMiddleware ,profileUpdate);
router.put("/updates/password",  authMiddleware ,passwordUpdate);
router.delete("/delete",  authMiddleware ,deleteUser);
router.get("/profile",  authMiddleware ,profile);


export default router;