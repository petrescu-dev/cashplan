// Type definitions for Cashplan.io
// These types match the backend API responses

export interface User {
  id: number;
  email: string;
  isAuthenticated: boolean;
}

export interface Plan {
  id?: number;
  userId: number;
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  createdAt?: string;
  updatedAt?: string;
}

export type EventType = 'income' | 'expense' | 'mortgage' | 'mortgage_repayment' | 'pcp' | 'car_loan';

export interface BaseEvent {
  id?: number;
  planId: number;
  type: EventType;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeEvent extends BaseEvent {
  type: 'income';
  data: {
    amount: number;
    isRecurrent: boolean;
    months: number[]; // Array of month numbers (1-12), empty for one-off
    startDate: string; // ISO date string
    endDate?: string; // ISO date string, optional for recurrent
  };
}

export interface ExpenseEvent extends BaseEvent {
  type: 'expense';
  data: {
    amount: number;
    isRecurrent: boolean;
    months: number[]; // Array of month numbers (1-12), empty for one-off
    startDate: string; // ISO date string
    endDate?: string; // ISO date string, optional for recurrent
  };
}

export interface MortgageEvent extends BaseEvent {
  type: 'mortgage';
  data: {
    startDate: string; // ISO date string
    purchasePrice: number;
    loanedAmount: number;
    interestRate: number; // Annual rate as decimal (e.g., 0.05 for 5%)
    repaymentPercentage: number; // Percentage as decimal (e.g., 0.5 for 50%)
    years: number;
  };
}

export interface MortgageRepaymentEvent extends BaseEvent {
  type: 'mortgage_repayment';
  data: {
    mortgageEventId: number; // Reference to parent mortgage event
    date: string; // ISO date string
    amount: number;
  };
}

export interface PCPEvent extends BaseEvent {
  type: 'pcp';
  data: {
    startDate: string; // ISO date string
    purchasePrice: number;
    deposit: number;
    years: 2 | 3 | 5;
    residualValue: number;
    interestRate: number; // Annual rate as decimal
  };
}

export interface CarLoanEvent extends BaseEvent {
  type: 'car_loan';
  data: {
    startDate: string; // ISO date string
    purchasePrice: number;
    deposit: number;
    years: number; // 3-10 years
    interestRate: number; // Annual rate as decimal
  };
}

export type Event = IncomeEvent | ExpenseEvent | MortgageEvent | MortgageRepaymentEvent | PCPEvent | CarLoanEvent;

export interface ChartDataPoint {
  month: string; // ISO date string (YYYY-MM-DD)
  liquidity: number;
  assets: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface PlanResponse {
  plan: Plan;
}

export interface EventsResponse {
  events: Event[];
}

export interface EventResponse {
  event: Event;
}

export interface ChartDataResponse {
  chartData: ChartDataPoint[];
}

export interface UserResponse {
  user: User;
}
