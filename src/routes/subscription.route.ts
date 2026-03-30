import { Router } from "express";
import { getSubscriptions } from "../controllers/subcription.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createSubscription } from "../controllers/createSubscription.controller";
import { updateSubscription } from "../controllers/updateSubscription.controller";
import { updateSubscriptionStatus } from "../controllers/updateSubscriptionStatus.controller";
import { deleteSubscription } from "../controllers/deleteSubscription.controller";

const router = Router();

router.post("/create", authMiddleware,createSubscription);
router.get("/:count", authMiddleware, getSubscriptions);
router.put("/update/:id",authMiddleware, updateSubscription);
router.put("/status/:id",authMiddleware, updateSubscriptionStatus);
router.delete("/delete/:id",authMiddleware, deleteSubscription);


export default router;