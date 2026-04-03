import { Response } from "express";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";
import Category from "../models/category.model";
import Currency from "../models/currency.model";
import BillingCycle from "../models/billingCycle.model";
import PaymentMethod from "../models/paymentMethod.model";
import BrandColor from "../models/brandColor.model";
import { Op } from "sequelize";

const toUSD: Record<string, number> = {
  USD: 1,
  INR: 0.012,
  EUR: 1.08,
  GBP: 1.27,
  AED: 0.27,
};

const billingCycleToMonths: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  "half-yearly": 6,
  yearly: 12,
  annual: 12,
};

export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const countParam = req.params.count;
    const isAll = countParam === "all";
    const parsedPage = Number.parseInt(req.query.page as string, 10);
    const parsedLimit = Number.parseInt(req.query.limit as string, 10);
    const legacyLimit = Number.parseInt(countParam as string, 10);

    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const limit = Number.isNaN(parsedLimit) || parsedLimit < 1
      ? (Number.isNaN(legacyLimit) || legacyLimit < 1 ? 10 : legacyLimit)
      : parsedLimit;
    const safeLimit = Math.min(limit, 100);
    const offset = (page - 1) * safeLimit;
    const statusParam = req.query.status as string | undefined;
    const categoryParam = (req.query.category as string | undefined)?.trim();
    const serviceNameParam = (req.query.serviceName as string | undefined)?.trim();

    if (statusParam && !["active", "canceled"].includes(statusParam)) {
      return res.status(400).json({ message: "status must be active or canceled" });
    }

    const whereClause: any = { userId };
    whereClause.cost = { [Op.gt]: 0 };
    if (statusParam) {
      whereClause.status = statusParam as "active" | "canceled";
    }
    if (serviceNameParam) {
      whereClause.serviceName = { [Op.like]: `%${serviceNameParam}%` };
    }

    const categoryInclude = categoryParam
      ? {
          model: Category,
          as: "category",
          attributes: ["name"],
          where: { name: { [Op.like]: `%${categoryParam}%` } },
          required: true,
        }
      : { model: Category, as: "category", attributes: ["name"] };

    const include = [
      categoryInclude,
      { model: Currency, as: "currency", attributes: ["code", "symbol"] },
      { model: BillingCycle, as: "billingCycle", attributes: ["label"] },
      { model: PaymentMethod, as: "paymentMethod", attributes: ["name"] },
      { model: BrandColor, as: "brandColor", attributes: ["hex"] },
    ];

    const paginated = await Subscription.findAndCountAll({
      where: whereClause,
      limit: safeLimit,
      offset,
      order: [["nextRenewal", "ASC"]],
      include,
    });
    const subscriptions = paginated.rows;
    const totalItems = paginated.count;

    const userWithCurrency: any = await User.findByPk(userId, {
      include: [{ model: Currency, as: "currency", attributes: ["code", "symbol"] }],
    });

    const all = await Subscription.findAll({
      where: whereClause,
      include: [
        categoryInclude,
        { model: Currency, as: "currency", attributes: ["code"] },
        { model: BillingCycle, as: "billingCycle", attributes: ["label"] },
      ],
    });

    const totalActive = all.filter((s) => s.status === "active").length;

    const monthlyCostUSD = all
      .filter((s) => s.status === "active")
      .reduce((sum, s: any) => {
        const currencyCode = s.currency?.code ?? "USD";
        const rate = toUSD[currencyCode] ?? 1;
        const cost = parseFloat(s.cost);
        const cycleLabel = (s.billingCycle?.label ?? "monthly").toLowerCase();
        const months = billingCycleToMonths[cycleLabel] ?? 1;
        const monthlyCost = cost / months;
        return sum + monthlyCost * rate;
      }, 0);

    const targetCurrencyCode = req.user?.currency ?? userWithCurrency?.currency?.code ?? "USD";
    const targetCurrencySymbol =
      targetCurrencyCode === userWithCurrency?.currency?.code
        ? (userWithCurrency?.currency?.symbol ?? "$")
        : (targetCurrencyCode === "INR" ? "₹" :
          targetCurrencyCode === "EUR" ? "€" :
          targetCurrencyCode === "GBP" ? "£" :
          targetCurrencyCode === "AED" ? "د.إ" : "$");
    const targetRate = toUSD[targetCurrencyCode] ?? 1;
    const monthlyCostInLoginCurrency = monthlyCostUSD / targetRate;

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
      pagination: {
        page,
        limit: safeLimit,
        totalItems,
        totalPages: Math.ceil(totalItems / safeLimit),
        hasNextPage: page * safeLimit < totalItems,
        hasPrevPage: page > 1,
        source: isAll ? "all" : "count",
        status: statusParam ?? "all",
        category: categoryParam ?? "all",
        serviceName: serviceNameParam ?? "all",
      },
      summary: {
        limit: safeLimit,
        totalActive,
        monthlyCost: `${targetCurrencySymbol}${monthlyCostInLoginCurrency.toFixed(2)}`,
        currency: targetCurrencyCode,
      },
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
