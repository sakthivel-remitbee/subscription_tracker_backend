import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";

class BillingCycle extends Model {
  declare id: number;
  declare label: string;
}

BillingCycle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    label: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, tableName: "billing_cycles", timestamps: false }
);

export default BillingCycle;
