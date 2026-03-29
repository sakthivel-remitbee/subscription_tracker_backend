import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";

export const deleteSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subscriptionId = parseInt(req.params.id as string);

    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    await subscription.destroy();

    res.json({ message: "Subscription deleted successfully" });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};