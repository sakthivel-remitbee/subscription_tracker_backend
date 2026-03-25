import LoginLogs from "../models/loginLogs.model";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

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

  const newAccessToken = jwt.sign(
    { id: decoded.id },
    process.env.JWT_A_SECRET as string,
    { expiresIn: "15m" }
  );

  res.json({ accessToken: newAccessToken });
};