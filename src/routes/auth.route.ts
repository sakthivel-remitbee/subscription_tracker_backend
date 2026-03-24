import { Router } from "express";
import { register } from "../controllers/signup.controller";
import { login } from "../controllers/login.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/check", authMiddleware, (req, res) => { res.json({message: "success auth"}) });

export default router;