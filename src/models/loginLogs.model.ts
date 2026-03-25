import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db"; 


interface LoginLogsAttributes {
  id: number;
  uid: number;
  refreshToken: string;
  isValid: boolean;
  countUsers: number;
}

interface LoginLogsCreationAttributes
  extends Optional<LoginLogsAttributes, "id"> {}


class LoginLogs
  extends Model<LoginLogsAttributes, LoginLogsCreationAttributes>
  implements LoginLogsAttributes
{
  public id!: number;
  public uid!: number;
  public refreshToken!: string;
  public isValid!: boolean;
  public countUsers!: number;


  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


LoginLogs.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    uid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isValid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    countUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "LoginLogs",
    tableName: "login_logs",
    timestamps: true,
  }
);

export default LoginLogs;