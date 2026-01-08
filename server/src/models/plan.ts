// Plan type definitions

export interface Plan {
  id?: number;
  userId: number;
  name: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  createdAt?: string;
  updatedAt?: string;
}

// Database row interface (as stored in SQLite)
export interface PlanRow {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database row to Plan object
export const rowToPlan = (row: PlanRow): Plan => {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    startDate: row.start_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Helper function to convert Plan object to database format
export const planToRow = (plan: Plan): Omit<PlanRow, 'id' | 'created_at' | 'updated_at'> => {
  return {
    user_id: plan.userId,
    name: plan.name,
    start_date: plan.startDate,
  };
};

