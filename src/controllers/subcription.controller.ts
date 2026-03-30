import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";
import Category from "../models/category.model";
import Currency from "../models/currency.model";
import BillingCycle from "../models/billingCycle.model";
import PaymentMethod from "../models/paymentMethod.model";
import BrandColor from "../models/brandColor.model";

const toUSD: Record<string, number> = {
  USD: 1,
  INR: 0.012,
  EUR: 1.08,
  GBP: 1.27,
  AED: 0.27,
};

export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const countParam = req.params.count;
    const isAll = countParam === "all";
    const limit = isAll ? undefined : parseInt(countParam as string) || 10;

    const subscriptions = await Subscription.findAll({
      where: { userId },
      ...(limit !== undefined && { limit }),
      order: [["nextRenewal", "ASC"]],
      include: [
        { model: Category,      as: "category",      attributes: ["name"] },
        { model: Currency,      as: "currency",       attributes: ["code", "symbol"] },
        { model: BillingCycle,  as: "billingCycle",   attributes: ["label"] },
        { model: PaymentMethod, as: "paymentMethod",  attributes: ["name"] },
        { model: BrandColor,    as: "brandColor",     attributes: ["hex"] },
      ],
    });

    const all = await Subscription.findAll({
      where: { userId },
      include: [
        { model: Currency, as: "currency", attributes: ["code"] },
      ],
    });

    const totalActive = all.filter((s) => s.status === "active").length;

    const monthlyCostUSD = all
      .filter((s) => s.status === "active")
      .reduce((sum, s: any) => {
        const currencyCode = s.currency?.code ?? "USD";
        const rate = toUSD[currencyCode] ?? 1;
        const cost = parseFloat(s.cost);
        const months = s.billingCycle?.months ?? 1;
        const monthlyCost = cost / months;
        return sum + monthlyCost * rate;
      }, 0);

    const data = subscriptions.map((s: any) => ({
      id:            s.id,
      serviceName:   s.serviceName,
      category:      s.category?.name,
      cost:          parseFloat(s.cost),
      status:        s.status,
      nextRenewal:   s.nextRenewal,
      remindMeIn:    s.remindMeIn,
      billingCycle:  s.billingCycle?.label,
      paymentMethod: s.paymentMethod?.name,
      brandColorHex: s.brandColor?.hex,
      currency:      s.currency?.code,
    }));

    res.json({
      subscriptions: data,
      summary: {
        limit: isAll ? "all" : limit,
        totalActive,
        monthlyCostUSD: `$${monthlyCostUSD.toFixed(2)}`,
      },
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

