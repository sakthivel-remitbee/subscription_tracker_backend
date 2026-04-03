import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";
import Category from "../models/category.model";
import Currency from "../models/currency.model";
import BillingCycle from "../models/billingCycle.model";
import PaymentMethod from "../models/paymentMethod.model";
import BrandColor from "../models/brandColor.model";
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      serviceName,
      category,
      cost,
      status,
      startDate,
      nextRenewal,
      remindMeIn,
      billingCycle,
      paymentMethod,
      brandColorHex,
      currency,
      notes,
    } = req.body;

    if (
      !serviceName ||
      !category ||
      cost === undefined ||
      cost === null ||
      !status ||
      !nextRenewal ||
      remindMeIn === undefined ||
      remindMeIn === null ||
      !billingCycle ||
      !paymentMethod ||
      !brandColorHex ||
      !currency
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (Number(cost) <= 0) {
      return res.status(400).json({ message: "cost must be greater than 0" });
    }
    if (!["active", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or canceled" });
    }

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

    const subscription = await Subscription.create({
      userId,
      serviceName,
      categoryId:      categoryRecord.id,
      cost,
      status,
      startDate:       startDate ?? new Date().toISOString().split("T")[0],
      nextRenewal,
      remindMeIn,
      billingCycleId:  billingCycleRecord.id,
      paymentMethodId: paymentMethodRecord.id,
      brandColorId:    brandColorRecord.id,
      currencyId:      currencyRecord.id,
      notes:           notes ?? null,
    });

    res.status(201).json({
      message: "Subscription created successfully",
      subscription:{
        id:subscription.id,
        serviceName,
        userId,
        billingCycle,
        cost,
        status,
        paymentMethod,
        brandColorHex,
        currency,
        category,
        startDate:subscription.startDate,
        nextRenewal,
        remindMeIn,
        notes: subscription.notes,
      }
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
