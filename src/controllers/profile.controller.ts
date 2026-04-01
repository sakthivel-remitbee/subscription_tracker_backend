import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";

export const profile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile data fetched",
      user: {name:user.name,email:user.email,timezone:user.timezone,createdAt:user.createdAt,img:user.img},
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
