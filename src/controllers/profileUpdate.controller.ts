import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";
import Currency from "../models/currency.model";

export const profileUpdate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { timezone, name, email, currency } = req.body;

    if (!timezone || !name || !email || !currency) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const currencyRecord = await Currency.findOne({ where: { code: currency } });
    if (!currencyRecord) {
      return res.status(404).json({ message: "Currency not found" });
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
      { timezone, name, email, currencyId: currencyRecord.id },
      { where: { id: userId } }
    );

    res.json({
      message: "Profile updated successfully",
      user: { name, email, timezone, currency },
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
