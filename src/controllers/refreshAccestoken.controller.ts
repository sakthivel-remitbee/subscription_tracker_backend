import LoginLogs from "../models/loginLogs.model";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/user.model";
import Currency from "../models/currency.model";
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded: any = jwt.verify(
      refreshToken,
      process.env.JWT_R_SECRET as string
    );

    const session = await LoginLogs.findOne({
      where: {
        uid: decoded.id,
        refreshToken,
        isValid: true,
      },
    });

    if (!session) { return res.status(403).json({ message: "Invalid session" }); }

    const user: any = await User.findByPk(decoded.id, {
      include: [{ model: Currency, as: "currency", attributes: ["code"] }],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCurrency = user?.currency?.code ?? "INR";

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: user?.email, currency: userCurrency },
      process.env.JWT_A_SECRET as string,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
