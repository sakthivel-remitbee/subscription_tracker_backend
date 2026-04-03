import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../types/authRequest";
import Subscription from "../models/subscription.model";
import Currency from "../models/currency.model";
import User from "../models/user.model";
import Category from "../models/category.model";
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

const monthKeys = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const currencySymbols: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

export const getCalendarData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsedYear = Number.parseInt(req.query.year as string, 10);
    const year = Number.isNaN(parsedYear) ? new Date().getFullYear() : parsedYear;
    const parsedPage = Number.parseInt(req.query.page as string, 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    if (year < 1970 || year > 9999) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const [userWithCurrency, renewals, totalActive] = await Promise.all([
      User.findByPk(userId, {
        include: [{ model: Currency, as: "currency", attributes: ["code", "symbol"] }],
      }) as Promise<any>,
      Subscription.findAll({
        where: {
          userId,
          status: "active",
          cost: { [Op.gt]: 0 },
          nextRenewal: {
            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
          },
        },
        include: [
          { model: Category, as: "category", attributes: ["name"] },
          { model: Currency, as: "currency", attributes: ["code", "symbol"] },
          { model: BillingCycle, as: "billingCycle", attributes: ["label"] },
          { model: PaymentMethod, as: "paymentMethod", attributes: ["name"] },
          { model: BrandColor, as: "brandColor", attributes: ["hex"] },
        ],
        order: [["nextRenewal", "ASC"]],
      }) as Promise<any[]>,
      Subscription.count({
        where: {
          userId,
          status: "active",
          cost: { [Op.gt]: 0 },
        },
      }),
    ]);

    const userCurrencyCode = req.user?.currency ?? userWithCurrency?.currency?.code ?? "USD";
    const userCurrencySymbol =
      userWithCurrency?.currency?.code === userCurrencyCode
        ? (userWithCurrency?.currency?.symbol ?? "$")
        : (currencySymbols[userCurrencyCode] ?? "$");
    const userRate = toUSD[userCurrencyCode] ?? 1;

    const monthBuckets: Record<number, {
      year: number;
      month: string;
      monthlyCost: string;
      userCurrency: string;
      data: Array<{
        id: number;
        serviceName: string;
        category: string | null;
        cost: number;
        status: string;
        nextRenewal: string;
        remindMeIn: number;
        billingCycle: string | null;
        paymentMethod: string | null;
        brandColorHex: string | null;
        currency: string;
      }>;
      _monthTotalValue: number;
    }> = {};

    for (const renewal of renewals) {
      const monthIndex = Number.parseInt(String(renewal.nextRenewal).slice(5, 7), 10) - 1;
      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }
      if (!monthBuckets[monthIndex]) {
        monthBuckets[monthIndex] = {
          year,
          month: monthKeys[monthIndex],
          monthlyCost: `${userCurrencySymbol}0.00`,
          userCurrency: userCurrencyCode,
          data: [],
          _monthTotalValue: 0,
        };
      }

      const sourceCurrency = renewal.currency?.code ?? "USD";
      const sourceRate = toUSD[sourceCurrency] ?? 1;
      const amount = Number.parseFloat(renewal.cost);
      const convertedAmount = (amount * sourceRate) / userRate;
      monthBuckets[monthIndex]._monthTotalValue += convertedAmount;
      monthBuckets[monthIndex].data.push({
        id: renewal.id,
        serviceName: renewal.serviceName,
        category: renewal.category?.name ?? null,
        cost: Number(amount.toFixed(2)),
        status: renewal.status,
        nextRenewal: renewal.nextRenewal,
        remindMeIn: renewal.remindMeIn,
        billingCycle: renewal.billingCycle?.label ?? null,
        paymentMethod: renewal.paymentMethod?.name ?? null,
        brandColorHex: renewal.brandColor?.hex ?? null,
        currency: sourceCurrency,
      });
    }

    const availableMonthIndexes = Object.keys(monthBuckets)
      .map((m) => Number.parseInt(m, 10))
      .sort((a, b) => a - b);
    const totalPages = availableMonthIndexes.length;

    if (totalPages === 0) {
      return res.json({
        loaded: false,
        message: "No data for this month",
        records: [],
        pagination: {
          page: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: {
          totalActive,
        },
      });
    }

    if (page > totalPages) {
      return res.json({
        loaded: false,
        message: "No data for this month",
        records: [],
        pagination: {
          page,
          totalPages,
          hasNextPage: false,
          hasPrevPage: totalPages > 0,
        },
        summary: {
          totalActive,
        },
      });
    }

    const selectedMonthIndex = availableMonthIndexes[page - 1];
    const selectedMonth = monthBuckets[selectedMonthIndex];
    const loaded = true;
    selectedMonth.monthlyCost = `${userCurrencySymbol}${selectedMonth._monthTotalValue.toFixed(2)}`;
    const currentPageRecordsCount = selectedMonth.data.length;

    res.json({
      loaded,
      message: loaded ? "Data loaded successfully" : "No data for this month",
      records: loaded
        ? [
            {
              year: selectedMonth.year,
              month: selectedMonth.month,
              monthlyCost: selectedMonth.monthlyCost,
              userCurrency: selectedMonth.userCurrency,
              data: selectedMonth.data,
            },
          ]
        : [],
      pagination: {
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filtereds: currentPageRecordsCount,
      summary: {
        totalActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
