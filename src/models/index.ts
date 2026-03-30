import sequelize from "../config/db";
import User from "./user.model";
import Category from "./category.model";
import Currency from "./currency.model";
import BillingCycle from "./billingCycle.model";
import PaymentMethod from "./paymentMethod.model";
import BrandColor from "./brandColor.model";
import Subscription from "./subscription.model";

export const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log(" DB synced");
};

export { User, Category, Currency, BillingCycle, PaymentMethod, BrandColor, Subscription };