import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, img } = req.body;
    console.log("Calling API...");
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) { return res.status(400).json({ message: "User already exists" }); }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timezone="IST";

    const user = await User.create({ name, email, password: hashedPassword, img, timezone,});

    return res.status(201).json({
      message: "User created successfully",
      data: name,
    });
  } catch (err:any) {
    return res.status(500).json({ error: err.message});
  }
};