/**
 * Tests for Financial Calculator Service
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { FinancialCalculator } from './calculator';
import { IncomeEvent, ExpenseEvent, MortgageEvent } from '../models/events';

describe('FinancialCalculator', () => {
  let calculator: FinancialCalculator;

  beforeEach(() => {
    calculator = new FinancialCalculator();
  });

  describe('calculateLiquidityAndAssets', () => {
    it('should calculate basic income and expense correctly', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 5000,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
        {
          id: 2,
          planId: 1,
          type: 'expense' as const,
          data: {
            amount: 1500,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as ExpenseEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // First month: Income 5000 - Expense 1500 = 3500 liquidity
      expect(result[0].liquidity).to.equal(3500);
      expect(result[0].assets).to.equal(0);

      // Second month: Previous 3500 + Income 5000 - Expense 1500 = 7000 liquidity
      expect(result[1].liquidity).to.equal(7000);
      expect(result[1].assets).to.equal(0);

      // Should have 12 months of data (1 year)
      expect(result).to.have.lengthOf(12);
    });

    it('should handle one-time income correctly', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 10000,
            isRecurrent: false,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // First month should have the one-time income
      expect(result[0].liquidity).to.equal(10000);

      // Second month should remain the same (no recurring income)
      expect(result[1].liquidity).to.equal(10000);
    });

    it('should handle recurrent income with specific months', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 2000,
            isRecurrent: true,
            months: [1, 6, 12], // January, June, December
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // January (month 1)
      expect(result[0].liquidity).to.equal(2000);
      
      // February (month 2) - no income
      expect(result[1].liquidity).to.equal(2000);
      
      // June (month 6)
      expect(result[5].liquidity).to.equal(4000);
      
      // December (month 12)
      expect(result[11].liquidity).to.equal(6000);
    });

    it('should handle date-based Date object as start date', () => {
      const planStartDate = new Date('2025-01-01');
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 1000,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      expect(result[0].liquidity).to.equal(1000);
      expect(result[0].month).to.equal('2025-01-01');
    });

    it('should calculate mortgage with deposit correctly', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'mortgage' as const,
          data: {
            startDate: '2025-01-01',
            purchasePrice: 300000,
            loanedAmount: 270000,
            interestRate: 0.05, // 5% annual
            repaymentPercentage: 1.0, // 100% repayment
            years: 25,
          },
        } as MortgageEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // First month should add deposit to assets
      const deposit = 300000 - 270000; // 30000
      expect(result[0].assets).to.equal(deposit);
      
      // Liquidity should be 0 in first month (only deposit added to assets)
      expect(result[0].liquidity).to.equal(0);
      
      // Second month should have negative liquidity (monthly payment) and increased assets (principal repaid)
      expect(result[1].liquidity).to.be.lessThan(0);
      expect(result[1].assets).to.be.greaterThan(deposit);
    });

    it('should return correct number of data points', () => {
      const planStartDate = '2025-01-01';
      const events: any[] = [];

      const result5Years = calculator.calculateLiquidityAndAssets(events, planStartDate, 5);
      expect(result5Years).to.have.lengthOf(60); // 5 years * 12 months

      const result10Years = calculator.calculateLiquidityAndAssets(events, planStartDate, 10);
      expect(result10Years).to.have.lengthOf(120); // 10 years * 12 months
    });

    it('should handle multiple income and expense events', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 5000,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
        {
          id: 2,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 1000,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
        {
          id: 3,
          planId: 1,
          type: 'expense' as const,
          data: {
            amount: 1500,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as ExpenseEvent,
        {
          id: 4,
          planId: 1,
          type: 'expense' as const,
          data: {
            amount: 500,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as ExpenseEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // First month: Income (5000 + 1000) - Expense (1500 + 500) = 4000
      expect(result[0].liquidity).to.equal(4000);
      
      // Second month: Previous 4000 + Income 6000 - Expense 2000 = 8000
      expect(result[1].liquidity).to.equal(8000);
    });

    it('should round values to 2 decimal places', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 1234.567,
            isRecurrent: true,
            months: [],
            startDate: '2025-01-01',
          },
        } as IncomeEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // Should be rounded to 2 decimal places
      expect(result[0].liquidity).to.equal(1234.57);
    });

    it('should handle events starting in the future', () => {
      const planStartDate = '2025-01-01';
      const events = [
        {
          id: 1,
          planId: 1,
          type: 'income' as const,
          data: {
            amount: 5000,
            isRecurrent: true,
            months: [],
            startDate: '2025-06-01', // Starts in June
          },
        } as IncomeEvent,
      ];

      const result = calculator.calculateLiquidityAndAssets(events, planStartDate, 1);

      // First 5 months should have 0 liquidity
      expect(result[0].liquidity).to.equal(0);
      expect(result[1].liquidity).to.equal(0);
      expect(result[4].liquidity).to.equal(0);

      // June (month 6, index 5) should have the income
      expect(result[5].liquidity).to.equal(5000);
    });
  });
});

