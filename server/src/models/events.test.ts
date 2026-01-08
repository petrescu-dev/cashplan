/**
 * Tests for Event models and helper functions
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { rowToEvent, eventToRow, EventRow, IncomeEvent } from './events';

describe('Event Models', () => {
  describe('rowToEvent', () => {
    it('should convert income event row to event object', () => {
      const row: EventRow = {
        id: 1,
        plan_id: 10,
        type: 'income',
        data: JSON.stringify({
          amount: 5000,
          isRecurrent: true,
          months: [],
          startDate: '2025-01-01',
        }),
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const event = rowToEvent(row);

      expect(event).to.deep.include({
        id: 1,
        planId: 10,
        type: 'income',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      });

      expect((event as IncomeEvent).data).to.deep.equal({
        amount: 5000,
        isRecurrent: true,
        months: [],
        startDate: '2025-01-01',
      });
    });

    it('should convert expense event row to event object', () => {
      const row: EventRow = {
        id: 2,
        plan_id: 10,
        type: 'expense',
        data: JSON.stringify({
          amount: 1500,
          isRecurrent: false,
          months: [],
          startDate: '2025-02-01',
        }),
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const event = rowToEvent(row);

      expect(event.type).to.equal('expense');
      expect(event.planId).to.equal(10);
    });

    it('should handle mortgage event correctly', () => {
      const row: EventRow = {
        id: 3,
        plan_id: 10,
        type: 'mortgage',
        data: JSON.stringify({
          startDate: '2025-01-01',
          purchasePrice: 300000,
          loanedAmount: 270000,
          interestRate: 0.05,
          repaymentPercentage: 1.0,
          years: 25,
        }),
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const event = rowToEvent(row);

      expect(event.type).to.equal('mortgage');
      expect(event.id).to.equal(3);
    });
  });

  describe('eventToRow', () => {
    it('should convert income event to database row format', () => {
      const event: IncomeEvent = {
        id: 1,
        planId: 10,
        type: 'income',
        data: {
          amount: 5000,
          isRecurrent: true,
          months: [],
          startDate: '2025-01-01',
        },
      };

      const row = eventToRow(event);

      expect(row).to.have.property('plan_id', 10);
      expect(row).to.have.property('type', 'income');
      expect(row).to.have.property('data');
      
      const parsedData = JSON.parse(row.data);
      expect(parsedData).to.deep.equal({
        amount: 5000,
        isRecurrent: true,
        months: [],
        startDate: '2025-01-01',
      });
    });

    it('should not include id, created_at, or updated_at', () => {
      const event: IncomeEvent = {
        id: 1,
        planId: 10,
        type: 'income',
        data: {
          amount: 5000,
          isRecurrent: true,
          months: [],
          startDate: '2025-01-01',
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const row = eventToRow(event);

      expect(row).to.not.have.property('id');
      expect(row).to.not.have.property('created_at');
      expect(row).to.not.have.property('updated_at');
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through row -> event -> row conversion', () => {
      const originalRow: EventRow = {
        id: 1,
        plan_id: 10,
        type: 'income',
        data: JSON.stringify({
          amount: 5000,
          isRecurrent: true,
          months: [1, 6, 12],
          startDate: '2025-01-01',
        }),
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const event = rowToEvent(originalRow);
      const newRow = eventToRow(event);

      expect(newRow.plan_id).to.equal(originalRow.plan_id);
      expect(newRow.type).to.equal(originalRow.type);
      expect(JSON.parse(newRow.data)).to.deep.equal(JSON.parse(originalRow.data));
    });
  });
});

