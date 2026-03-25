import LoginLogs from "../models/loginLogs.model";
import { Request, Response } from "express";
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await LoginLogs.update(
    { isValid: false },
    { where: { refreshToken } }
  );

  res.json({ message: "Logged out successfully" });
};