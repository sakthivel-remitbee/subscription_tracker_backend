import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import User from "../models/user.model";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const userId = req.params.id;
    const timezone = req.body.timezone;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "users" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    await User.update(
      { img: result.secure_url,timezone:timezone },
      { where: { id: userId } }
    );

    res.json({
      message: "Image uploaded successfully",
      url: result.secure_url,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};