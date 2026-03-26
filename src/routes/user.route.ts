import { Router } from "express";
import upload from "../middlewares/upload.middleware";
import { uploadImage } from "../controllers/user.controller";

const router = Router();

router.put("/store-img/:id", upload.single("image"), uploadImage);

export default router;