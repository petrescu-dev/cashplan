import { Event, IncomeEvent, ExpenseEvent, MortgageEvent, MortgageRepaymentEvent, PCPEvent, CarLoanEvent } from '../models/events';
import { startOfMonth, addMonths, parseISO, isBefore, isAfter, isEqual, differenceInMonths } from 'date-fns';

export interface ChartDataPoint {
  month: string; // ISO date string (YYYY-MM-DD)
  liquidity: number;
  assets: number;
}

interface DeltaResult {
  liquidityDelta: number;
  assetsDelta: number;
  newBalance?: number;
}

/**
 * Shared utility function to calculate car depreciation
 * @param purchasePrice Original purchase price of the car
 * @param monthsSincePurchase Number of months since purchase
 * @returns Monthly depreciation amount
 */
export const calculateCarDepreciation = (purchasePrice: number, monthsSincePurchase: number): number => {
  const yearsSincePurchase = Math.floor(monthsSincePurchase / 12);
  
  let depreciationRate: number;
  
  if (yearsSincePurchase < 2) {
    depreciationRate = 0.02; // 2% per month for years 1-2
  } else if (yearsSincePurchase < 4) {
    depreciationRate = 0.012; // 1.2% per month for years 3-4
  } else {
    depreciationRate = 0.01; // 1% per month for years 5+
  }
  
  const depreciation = purchasePrice * depreciationRate;
  // Minimum car value is £1500
  
  return Math.max(depreciation, 0);
};

/**
 * Financial Calculator Service
 * Calculates liquidity and assets over time based on events
 */
export class FinancialCalculator {
  /**
   * Main orchestration method to calculate liquidity and assets
   * @param events Array of all events for a plan
   * @param startDate Start date for calculations (ISO string or Date)
   * @param rangeYears Number of years to project (5-20)
   * @returns Array of data points with month, liquidity, and assets
   */
  calculateLiquidityAndAssets(events: Event[], startDate: string | Date, rangeYears: number): ChartDataPoint[] {
    const dataPoints: ChartDataPoint[] = [];
    const planStartDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const startMonth = startOfMonth(planStartDate);
    const totalMonths = rangeYears * 12;
    
    let currentLiquidity = 0;
    let currentAssets = 0;
    
    // Track state for stateful events
    const mortgageBalances = new Map<number, number>(); // mortgageEventId -> remaining balance
    const carLoanBalances = new Map<number, number>(); // carLoanEventId -> remaining balance
    const carPurchaseDates = new Map<number, Date>(); // eventId -> purchase date
    
    // Process each month
    for (let monthIndex = 0; monthIndex < totalMonths; monthIndex++) {
      const currentMonth = addMonths(startMonth, monthIndex);
      
      // Process each event for this month
      for (const event of events) {
        let delta: DeltaResult = { liquidityDelta: 0, assetsDelta: 0 };
        
        switch (event.type) {
          case 'income':
            delta = this.calculateIncomeDelta(event as IncomeEvent, currentMonth);
            break;
          case 'expense':
            delta = this.calculateExpenseDelta(event as ExpenseEvent, currentMonth);
            break;
          case 'mortgage':
            const mortgageBalance = mortgageBalances.get(event.id!) || (event as MortgageEvent).data.loanedAmount * (event as MortgageEvent).data.repaymentPercentage;
            delta = this.calculateMortgageDelta(event as MortgageEvent, currentMonth, mortgageBalance);
            if (delta.newBalance !== undefined) {
              mortgageBalances.set(event.id!, delta.newBalance);
            }
            break;
          case 'mortgage_repayment':
            const mortgageId = (event as MortgageRepaymentEvent).data.mortgageEventId;
            const currentMortgageBalance = mortgageBalances.get(mortgageId) || 0;
            delta = this.calculateMortgageRepaymentDelta(event as MortgageRepaymentEvent, currentMonth, currentMortgageBalance);
            if (delta.newBalance !== undefined) {
              mortgageBalances.set(mortgageId, delta.newBalance);
            }
            break;
          case 'pcp':
            const pcpDate = carPurchaseDates.get(event.id!) || parseISO((event as PCPEvent).data.startDate);
            const pcpMonths = differenceInMonths(currentMonth, pcpDate);
            delta = this.calculatePCPDelta(event as PCPEvent, currentMonth, pcpMonths);
            if (!carPurchaseDates.has(event.id!)) {
              carPurchaseDates.set(event.id!, pcpDate);
            }
            break;
          case 'car_loan':
            const carLoanData = event as CarLoanEvent;
            const purchaseDate = carPurchaseDates.get(event.id!) || parseISO(carLoanData.data.startDate);
            const carLoanMonths = differenceInMonths(currentMonth, purchaseDate);
            const loanBalance = carLoanBalances.get(event.id!) || (carLoanData.data.purchasePrice - carLoanData.data.deposit);
            delta = this.calculateCarLoanDelta(carLoanData, currentMonth, carLoanMonths, loanBalance);
            if (delta.newBalance !== undefined) {
              carLoanBalances.set(event.id!, delta.newBalance);
            }
            if (!carPurchaseDates.has(event.id!)) {
              carPurchaseDates.set(event.id!, purchaseDate);
            }
            break;
        }
        
        currentLiquidity += delta.liquidityDelta;
        currentAssets += delta.assetsDelta;
      }
      
      // Record data point for this month
      dataPoints.push({
        month: currentMonth.toISOString().split('T')[0],
        liquidity: Math.round(currentLiquidity * 100) / 100,
        assets: Math.round(currentAssets * 100) / 100,
      });
    }
    
    return dataPoints;
  }
  
  /**
   * Calculate income delta for a given month
   */
  private calculateIncomeDelta(event: IncomeEvent, currentMonth: Date): DeltaResult {
    const { amount, isRecurrent, months, startDate, endDate } = event.data;
    const start = parseISO(startDate);
    
    // Check if current month is within date range
    if (isBefore(currentMonth, startOfMonth(start))) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    if (endDate) {
      const end = parseISO(endDate);
      if (isAfter(currentMonth, startOfMonth(end))) {
        return { liquidityDelta: 0, assetsDelta: 0 };
      }
    }
    
    // For one-off income
    if (!isRecurrent) {
      if (isEqual(startOfMonth(currentMonth), startOfMonth(start))) {
        return { liquidityDelta: amount, assetsDelta: 0 };
      }
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // For recurrent income, check if current month is in the months array
    const currentMonthNumber = currentMonth.getMonth() + 1; // 1-12
    if (months.length === 0 || months.includes(currentMonthNumber)) {
      return { liquidityDelta: amount, assetsDelta: 0 };
    }
    
    return { liquidityDelta: 0, assetsDelta: 0 };
  }
  
  /**
   * Calculate expense delta for a given month
   */
  private calculateExpenseDelta(event: ExpenseEvent, currentMonth: Date): DeltaResult {
    const { amount, isRecurrent, months, startDate, endDate } = event.data;
    const start = parseISO(startDate);
    
    // Check if current month is within date range
    if (isBefore(currentMonth, startOfMonth(start))) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    if (endDate) {
      const end = parseISO(endDate);
      if (isAfter(currentMonth, startOfMonth(end))) {
        return { liquidityDelta: 0, assetsDelta: 0 };
      }
    }
    
    // For one-off expense
    if (!isRecurrent) {
      if (isEqual(startOfMonth(currentMonth), startOfMonth(start))) {
        return { liquidityDelta: -amount, assetsDelta: 0 };
      }
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // For recurrent expense, check if current month is in the months array
    const currentMonthNumber = currentMonth.getMonth() + 1; // 1-12
    if (months.length === 0 || months.includes(currentMonthNumber)) {
      return { liquidityDelta: -amount, assetsDelta: 0 };
    }
    
    return { liquidityDelta: 0, assetsDelta: 0 };
  }
  
  /**
   * Calculate mortgage delta for a given month
   */
  private calculateMortgageDelta(event: MortgageEvent, currentMonth: Date, repaymentBalance: number): DeltaResult {
    const { startDate, purchasePrice, loanedAmount, interestRate, repaymentPercentage, years } = event.data;
    const start = parseISO(startDate);
    const endDate = addMonths(start, years * 12);
    
    // Check if mortgage is active
    if (isBefore(currentMonth, startOfMonth(start)) || isAfter(currentMonth, startOfMonth(endDate))) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // Initial month: add deposit to assets
    if (isEqual(startOfMonth(currentMonth), startOfMonth(start))) {
      const deposit = purchasePrice - loanedAmount;
      return { liquidityDelta: 0, assetsDelta: deposit, newBalance: repaymentBalance };
    }
    
    // Calculate monthly payment
    const monthlyRate = interestRate / 12;
    const totalMonths = years * 12;
    const repaymentAmount = loanedAmount * repaymentPercentage;
    const interestOnlyAmount = loanedAmount * (1 - repaymentPercentage);
    
    // Interest-only payment
    const interestOnlyPayment = interestOnlyAmount * monthlyRate;
    
    // Amortized payment
    const amortizedPayment = repaymentAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    // Calculate principal repaid this month
    const interestPortion = repaymentBalance * monthlyRate;
    const principalPortion = amortizedPayment - interestPortion;
    const newBalance = Math.max(0, repaymentBalance - principalPortion);
    
    const totalPayment = amortizedPayment + interestOnlyPayment;
    
    return {
      liquidityDelta: -totalPayment,
      assetsDelta: principalPortion,
      newBalance,
    };
  }
  
  /**
   * Calculate mortgage repayment delta for a given month
   */
  private calculateMortgageRepaymentDelta(event: MortgageRepaymentEvent, currentMonth: Date, repaymentBalance: number): DeltaResult {
    const { date, amount } = event.data;
    const repaymentDate = parseISO(date);
    
    // Check if repayment occurs in current month
    if (!isEqual(startOfMonth(currentMonth), startOfMonth(repaymentDate))) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // Reduce balance
    const newBalance = Math.max(0, repaymentBalance - amount);
    
    return {
      liquidityDelta: -amount,
      assetsDelta: amount,
      newBalance,
    };
  }
  
  /**
   * Calculate PCP delta for a given month
   */
  private calculatePCPDelta(event: PCPEvent, _currentMonth: Date, monthsSincePurchase: number): DeltaResult {
    const { purchasePrice, deposit, years, residualValue, interestRate } = event.data;
    
    // Placeholder - needs start date in event data
    // For now, assume PCP starts at current month if monthsSincePurchase === 0
    if (monthsSincePurchase < 0 || monthsSincePurchase >= years * 12) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // Initial month: add initial asset value
    if (monthsSincePurchase === 0) {
      const initialAssetValue = purchasePrice - deposit;
      return { liquidityDelta: -deposit, assetsDelta: initialAssetValue };
    }
    
    // Calculate monthly PCP payment
    const loanedAmount = purchasePrice - deposit;
    const amountToFinance = loanedAmount - residualValue;
    const monthlyRate = interestRate / 12;
    const totalMonths = years * 12;
    const monthlyPayment = amountToFinance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    // Calculate depreciation
    const depreciation = calculateCarDepreciation(purchasePrice, monthsSincePurchase);
    
    return {
      liquidityDelta: -monthlyPayment,
      assetsDelta: -depreciation,
    };
  }
  
  /**
   * Calculate car loan delta for a given month
   */
  private calculateCarLoanDelta(event: CarLoanEvent, _currentMonth: Date, monthsSincePurchase: number, loanBalance: number): DeltaResult {
    const { purchasePrice, deposit, years, interestRate } = event.data;
    
    // Placeholder - needs start date in event data
    if (monthsSincePurchase < 0 || monthsSincePurchase >= years * 12) {
      return { liquidityDelta: 0, assetsDelta: 0 };
    }
    
    // Initial month: add initial asset value
    if (monthsSincePurchase === 0) {
      const initialAssetValue = purchasePrice - deposit;
      return { liquidityDelta: -deposit, assetsDelta: initialAssetValue, newBalance: purchasePrice - deposit };
    }
    
    // Calculate monthly payment
    const monthlyRate = interestRate / 12;
    const totalMonths = years * 12;
    const loanAmount = purchasePrice - deposit;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    // Calculate principal repaid this month
    const interestPortion = loanBalance * monthlyRate;
    const principalPortion = monthlyPayment - interestPortion;
    const newBalance = Math.max(0, loanBalance - principalPortion);
    
    // Calculate depreciation
    const depreciation = calculateCarDepreciation(purchasePrice, monthsSincePurchase);
    
    return {
      liquidityDelta: -monthlyPayment,
      assetsDelta: principalPortion - depreciation,
      newBalance,
    };
  }
}

