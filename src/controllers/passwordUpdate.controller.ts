import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";
import bcrypt from 'bcrypt';

export const passwordUpdate = async (req: AuthRequest, res: Response) => {
  try {

    const userId = req.user?.id;
    const {oldPassword,newPassword}= req.body;

    if (!oldPassword || !newPassword) { return res.status(400).json({ message: "All fields are required" });}

    if (oldPassword===newPassword) { return res.status(400).json({ message: "new password must be not old password" });}

    const person = await User.findByPk(userId);
    if(!person){return res.status(400).json({ message: "user not found" });}

    const gate1 = await bcrypt.compare(oldPassword,person.password,);
    if (!gate1) { return res.status(400).json({ message: "USER Password mismatched" }); }

    const hpassword = await bcrypt.hash(newPassword,10);
    
    await User.update( { password:hpassword }, { where: { id: userId } } );

    res.json({message: "password updated sucessfully"});

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};