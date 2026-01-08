/**
 * Example usage of the Financial Calculator with plan start date
 * This demonstrates how to use the calculator with a specific start date
 */

import { FinancialCalculator } from '../services/calculator';
import { IncomeEvent, ExpenseEvent } from '../models/events';

// Create a calculator instance
const calculator = new FinancialCalculator();

// Example: Create a plan starting from January 1, 2025
const planStartDate = '2025-01-01';

// Example events
const events = [
  // Monthly salary
  {
    id: 1,
    planId: 1,
    type: 'income' as const,
    data: {
      amount: 5000,
      isRecurrent: true,
      months: [], // Empty means all months
      startDate: '2025-01-01',
    },
  } as IncomeEvent,
  
  // Monthly rent expense
  {
    id: 2,
    planId: 1,
    type: 'expense' as const,
    data: {
      amount: 1500,
      isRecurrent: true,
      months: [], // Empty means all months
      startDate: '2025-01-01',
    },
  } as ExpenseEvent,
];

// Calculate liquidity and assets for 5 years from the plan start date
const chartData = calculator.calculateLiquidityAndAssets(
  events,
  planStartDate, // Plan's start date, not current date
  5 // 5 years projection
);

// Display first few months
console.log('Financial projection starting from:', planStartDate);
console.log('\nFirst 6 months:');
chartData.slice(0, 6).forEach((dataPoint) => {
  console.log(
    `${dataPoint.month}: Liquidity: £${dataPoint.liquidity.toFixed(2)}, Assets: £${dataPoint.assets.toFixed(2)}`
  );
});

/**
 * Expected output:
 * 2025-01-01: Liquidity: £3,500.00, Assets: £0.00
 * 2025-02-01: Liquidity: £7,000.00, Assets: £0.00
 * 2025-03-01: Liquidity: £10,500.00, Assets: £0.00
 * ... and so on
 * 
 * Note: All calculations are relative to the plan's start date (2025-01-01),
 * not the current date. This allows users to plan for future scenarios.
 */

