import LoginLogs from "../models/loginLogs.model";
import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Subscription from "../models/subscription.model";
import Currency from "../models/currency.model";

const MAX_SESSIONS = 2;

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const activeSessions = await LoginLogs.count({
      where: {
        uid: user.id,
        isValid: true,
      },
    });

  
    if (activeSessions >= MAX_SESSIONS) {
      res.status(403).json({
        message: "Session limit reached. Please logout from another device.",
      });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_A_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_R_SECRET as string,
      { expiresIn: "7d" }
    );

    await LoginLogs.create({
      uid: user.id,
      refreshToken,
      isValid: true,
      countUsers: activeSessions + 1,
    });

    const latestSubscription: any = await Subscription.findOne({
      where: { userId: user.id },
      include: [{ model: Currency, as: "currency", attributes: ["code"] }],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user:{
        uid:user.id,
        name:user.name,
        email:user.email,
        timezone:user.timezone,
        img:user.img,
        currency:latestSubscription?.currency?.code ?? null,
        createdAt:user.createdAt,
        
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
