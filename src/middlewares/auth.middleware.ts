import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../config/logger";
import { AuthRequest } from "../types/authRequest";

export const authMiddleware = ( req: AuthRequest,res: Response,next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("No token provided");
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_A_SECRET as string);

    req.user = decoded as { id: number; email: string };

    logger.info("Token verified successfully");
    next();
  } catch (error) {
    logger.error("Invalid or expired token", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};