import { Router } from "express";
import upload from "../middlewares/upload.middleware";
import { uploadImage } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.put("/store-img/",  authMiddleware ,upload.single("image"), uploadImage);

export default router;