import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";

export const updateSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subscriptionId = parseInt(req.params.id as string);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    if (!["active", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or canceled" });
    }

    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    await subscription.update({ status });

    res.json({
      message: "Status updated successfully",
      subscription,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};