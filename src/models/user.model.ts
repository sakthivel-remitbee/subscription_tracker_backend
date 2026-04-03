import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import Currency from "./currency.model";

class User extends Model {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare img: string | null;
  declare timezone: string | null;
  declare currencyId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 2,
      references: { model: "currencies", key: "id" },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
  }
);

User.belongsTo(Currency, { foreignKey: "currencyId", as: "currency" });

export default User;
