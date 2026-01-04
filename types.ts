
export interface User {
  id: string;
  phoneNumber: string;
  password?: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
  totalEarnings: number;
  hasInvested: boolean;
  isAdmin: boolean;
  registrationDate: string;
  lastCheckIn?: string;
  spinChances: number;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  price: number;
  dailyProfit: number;
  duration: number;
  returns: number; // percentage
}

export interface UserInvestment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  dailyProfit: number;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired';
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'referral' | 'check-in' | 'profit' | 'spin';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  screenshot?: string;
  bankDetails?: string;
}

export enum Page {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  PRODUCTS = 'PRODUCTS',
  TEAM = 'TEAM',
  PROFILE = 'PROFILE',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  HISTORY = 'HISTORY',
  ADMIN = 'ADMIN',
  SPIN_WHEEL = 'SPIN_WHEEL'
}
