import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User  from "../models/user.model"; 
import logger from "../config/logger"; 

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation failed during login");
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

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

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_A_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.JWT_R_SECRET as string,
      { expiresIn: "7d"}
    );

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error:any) {
    logger.error("error", error);
    res.status(500).json({ message: error.message });
  }
};