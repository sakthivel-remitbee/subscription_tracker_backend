import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class BrandColor extends Model {
  declare id: number;
  declare name: string;
  declare hex: string;
}

BrandColor.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    hex: { type: DataTypes.STRING(7), allowNull: false },
  },
  { sequelize, tableName: "brand_colors", timestamps: false }
);

export default BrandColor;