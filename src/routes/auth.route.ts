import { Router } from "express";
import { register } from "../controllers/signup.controller";
import { login } from "../controllers/login.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { refreshAccessToken } from "../controllers/refreshAccestoken.controller";
import { logout } from "../controllers/logout.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

router.get("/check", authMiddleware, (req, res) => {
  res.json({
    message: "success auth",
    user: (req as any).user,
  });
});

export default router;