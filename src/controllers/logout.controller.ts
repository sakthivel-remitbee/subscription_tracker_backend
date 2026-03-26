import LoginLogs from "../models/loginLogs.model";
import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const session = await LoginLogs.findOne({ where: { refreshToken } });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    const userId = session.uid;

    await session.update({ isValid: false });

    const remainingActiveSessions = await LoginLogs.count({
      where: { uid: userId, isValid: true },
    });

    await LoginLogs.update(
      { countUsers: remainingActiveSessions },
      { where: { uid: userId } }
    );

    res.json({
      message: "Logged out successfully",
      activeSessions: remainingActiveSessions,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};