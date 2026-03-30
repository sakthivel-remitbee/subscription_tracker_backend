import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";

export const profileUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { timezone, name, email } = req.body;

    if (!timezone || !name || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    await User.update(
      { timezone, name, email },
      { where: { id: userId } }
    );

    res.json({
      message: "Profile updated successfully",
      user: { name, email, timezone },
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};