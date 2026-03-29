import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class Currency extends Model {
  declare id: number;
  declare code: string;
  declare symbol: string;
}

Currency.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    symbol: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, tableName: "currencies", timestamps: false }
);

export default Currency;