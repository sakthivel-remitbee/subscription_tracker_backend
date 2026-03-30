import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";
import Category from "./category.model";
import Currency from "./currency.model";
import BillingCycle from "./billingCycle.model";
import PaymentMethod from "./paymentMethod.model";
import BrandColor from "./brandColor.model";

class Subscription extends Model {
  declare id: number;
  declare userId: number;
  declare serviceName: string;
  declare categoryId: number;
  declare cost: number;
  declare status: "active" | "canceled";
  declare startDate: string;
  declare nextRenewal: string;
  declare remindMeIn: number;
  declare billingCycleId: number;
  declare paymentMethodId: number;
  declare brandColorId: number;
  declare currencyId: number;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Subscription.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    serviceName: { type: DataTypes.STRING, allowNull: false },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "categories", key: "id" },
    },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: {
      type: DataTypes.ENUM("active", "canceled"),
      allowNull: false,
      defaultValue: "active",
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    nextRenewal: { type: DataTypes.DATEONLY, allowNull: false },
    remindMeIn: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    billingCycleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "billing_cycles", key: "id" },
    },
    paymentMethodId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "payment_methods", key: "id" },
    },
    brandColorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "brand_colors", key: "id" },
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "currencies", key: "id" },
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "subscriptions",
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["nextRenewal"] },
      { fields: ["userId", "status"] },
    ],
  }
);

Subscription.belongsTo(User,          { foreignKey: "userId",          as: "user" });
Subscription.belongsTo(Category,      { foreignKey: "categoryId",      as: "category" });
Subscription.belongsTo(Currency,      { foreignKey: "currencyId",      as: "currency" });
Subscription.belongsTo(BillingCycle,  { foreignKey: "billingCycleId",  as: "billingCycle" });
Subscription.belongsTo(PaymentMethod, { foreignKey: "paymentMethodId", as: "paymentMethod" });
Subscription.belongsTo(BrandColor,    { foreignKey: "brandColorId",    as: "brandColor" });

User.hasMany(Subscription, { foreignKey: "userId", as: "subscriptions", onDelete: "CASCADE" });

export default Subscription;