import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";

export const profileUpdate = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const {timezone,name,email}= req.body;

    if (!timezone || !name || !email) {
      return res.status(400).json({ message: "All datas are required" });
    }

    await User.update(
      { timezone:timezone,name:name,email:email },
      { where: { id: userId } }
    );

    res.json({
      message: "profile updated sucessfully",
      user:{name:name,email:email,timezone:timezone}
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};