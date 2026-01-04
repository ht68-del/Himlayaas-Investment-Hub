
import { InvestmentPlan } from './types';

export const BANK_DETAILS = {
  bankName: "सिद्धार्थ बैंक (Siddhartha Bank)",
  accountName: "Gita Kumari Sah Teli",
  accountNo: "55507560852"
};

export const SUPPORT_LINKS = {
  customerSupport: "@Himalayancustomerservice",
  telegramGroup: "https://t.me/HimalayanInvestmentHub"
};

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  { id: 'v1', name: 'VIP १ लगानी', price: 1000, dailyProfit: 150, duration: 100, returns: 15 },
  { id: 'v2', name: 'VIP २ लगानी', price: 2000, dailyProfit: 300, duration: 100, returns: 15 },
  { id: 'v3', name: 'VIP ३ लगानी', price: 3000, dailyProfit: 450, duration: 100, returns: 15 },
  { id: 'v4', name: 'VIP ४ लगानी', price: 4000, dailyProfit: 600, duration: 100, returns: 15 },
  { id: 'v5', name: 'VIP ५ लगानी', price: 5000, dailyProfit: 750, duration: 100, returns: 15 },
  { id: 'v6', name: 'VIP ६ लगानी', price: 6000, dailyProfit: 900, duration: 100, returns: 15 },
  { id: 'v7', name: 'VIP ७ लगानी', price: 7000, dailyProfit: 1050, duration: 100, returns: 15 },
  { id: 'v8', name: 'VIP ८ लगानी', price: 8000, dailyProfit: 1200, duration: 100, returns: 15 },
  { id: 'v9', name: 'VIP ९ लगानी', price: 9000, dailyProfit: 1350, duration: 100, returns: 15 },
  { id: 'v10', name: 'VIP १० लगानी', price: 10000, dailyProfit: 1500, duration: 100, returns: 15 },
];

export const APP_CONFIG = {
  minWithdraw: 400,
  withdrawFee: 0.20, // 20%
  referralBonus: {
    A: 0.25, // 25%
    B: 0.04, // 4%
    C: 0.03  // 3%
  },
  dailyCheckInBonus: 10,
  welcomeBonus: 100
};
