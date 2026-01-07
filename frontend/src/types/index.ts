// Type definitions for Cashplan.io

export interface User {
  id: number;
  email: string;
}

export interface Plan {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BaseEvent {
  id: number;
  plan_id: number;
  type: 'income' | 'expense' | 'mortgage' | 'mortgage_repayment' | 'pcp' | 'car_loan';
  data: unknown;
  created_at: string;
  updated_at: string;
}

export interface IncomeEventData {
  amount: number;
  isRecurrent: boolean;
  months: number[];
  startDate: string;
  endDate: string;
}

export interface IncomeEvent extends BaseEvent {
  type: 'income';
  data: IncomeEventData;
}

export interface ExpenseEventData {
  amount: number;
  isRecurrent: boolean;
  months: number[];
  startDate: string;
  endDate: string;
}

export interface ExpenseEvent extends BaseEvent {
  type: 'expense';
  data: ExpenseEventData;
}

export interface MortgageEventData {
  startDate: string;
  purchasePrice: number;
  loanedAmount: number;
  interestRate: number;
  repaymentPercentage: number;
  years: number;
}

export interface MortgageEvent extends BaseEvent {
  type: 'mortgage';
  data: MortgageEventData;
}

export interface MortgageRepaymentEventData {
  mortgageEventId: number;
  date: string;
  amount: number;
}

export interface MortgageRepaymentEvent extends BaseEvent {
  type: 'mortgage_repayment';
  data: MortgageRepaymentEventData;
}

export interface PCPEventData {
  purchasePrice: number;
  deposit: number;
  years: 2 | 3 | 5;
  residualValue: number;
  interestRate: number;
}

export interface PCPEvent extends BaseEvent {
  type: 'pcp';
  data: PCPEventData;
}

export interface CarLoanEventData {
  purchasePrice: number;
  deposit: number;
  years: number; // 3-10
  interestRate: number;
}

export interface CarLoanEvent extends BaseEvent {
  type: 'car_loan';
  data: CarLoanEventData;
}

export type Event = IncomeEvent | ExpenseEvent | MortgageEvent | MortgageRepaymentEvent | PCPEvent | CarLoanEvent;

export interface ChartDataPoint {
  month: number;
  liquidity: number;
  assets: number;
}

