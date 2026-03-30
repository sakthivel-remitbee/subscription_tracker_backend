import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";
import Category from "../models/category.model";
import Currency from "../models/currency.model";
import BillingCycle from "../models/billingCycle.model";
import PaymentMethod from "../models/paymentMethod.model";
import BrandColor from "../models/brandColor.model";

export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subscriptionId = parseInt(req.params.id as string);

    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const {
      serviceName,
      category,
      cost,
      status,
      nextRenewal,
      remindMeIn,
      billingCycle,
      paymentMethod,
      brandColorHex,
      currency,
      notes,
    } = req.body;

    // find FK ids by name/value
    const categoryRecord      = await Category.findOne({ where: { name: category } });
    const currencyRecord      = await Currency.findOne({ where: { code: currency } });
    const billingCycleRecord  = await BillingCycle.findOne({ where: { label: billingCycle } });
    const paymentMethodRecord = await PaymentMethod.findOne({ where: { name: paymentMethod } });
    const brandColorRecord    = await BrandColor.findOne({ where: { hex: brandColorHex } });

    if (!categoryRecord)      return res.status(404).json({ message: "Category not found" });
    if (!currencyRecord)      return res.status(404).json({ message: "Currency not found" });
    if (!billingCycleRecord)  return res.status(404).json({ message: "Billing cycle not found" });
    if (!paymentMethodRecord) return res.status(404).json({ message: "Payment method not found" });
    if (!brandColorRecord)    return res.status(404).json({ message: "Brand color not found" });

    await subscription.update({
      serviceName,
      categoryId:      categoryRecord.id,
      cost,
      status,
      nextRenewal,
      remindMeIn,
      billingCycleId:  billingCycleRecord.id,
      paymentMethodId: paymentMethodRecord.id,
      brandColorId:    brandColorRecord.id,
      currencyId:      currencyRecord.id,
      notes:           notes ?? null,
    });

    res.json({
      message: "Subscription updated successfully",
      subscription,
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};