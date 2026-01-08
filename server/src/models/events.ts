// Event type definitions

export interface BaseEvent {
  id?: number;
  planId: number;
  type: EventType;
  createdAt?: string;
  updatedAt?: string;
}

export type EventType = 'income' | 'expense' | 'mortgage' | 'mortgage_repayment' | 'pcp' | 'car_loan';

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

// Database row interface (as stored in SQLite)
export interface EventRow {
  id: number;
  plan_id: number;
  type: EventType;
  data: string; // JSON string
  created_at: string;
  updated_at: string;
}

// Helper function to convert database row to Event object
export const rowToEvent = (row: EventRow): Event => {
  const baseEvent = {
    id: row.id,
    planId: row.plan_id,
    type: row.type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  const data = JSON.parse(row.data);

  return {
    ...baseEvent,
    data,
  } as Event;
};

// Helper function to convert Event object to database format
export const eventToRow = (event: Event): Omit<EventRow, 'id' | 'created_at' | 'updated_at'> => {
  return {
    plan_id: event.planId,
    type: event.type,
    data: JSON.stringify(event.data),
  };
};

