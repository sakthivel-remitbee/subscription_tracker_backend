import { Response } from "express";
import User from "../models/user.model";
import { AuthRequest } from "../types/authRequest";
import LoginLogs from "../models/loginLogs.model";
import sequelize from "../config/db";

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "user not found" });
    }

    await User.destroy({where: { id: userId },transaction: t,});
    await LoginLogs.destroy({ where: { uid: userId }, transaction: t,});

    await t.commit();

    res.json({ message: "user deleted successfully" });

  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};