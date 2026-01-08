/**
 * Tests for Plan models and helper functions
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { rowToPlan, planToRow, PlanRow, Plan } from './plan';

describe('Plan Models', () => {
  describe('rowToPlan', () => {
    it('should convert plan row to plan object', () => {
      const row: PlanRow = {
        id: 1,
        user_id: 100,
        name: 'My Financial Plan',
        start_date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const plan = rowToPlan(row);

      expect(plan).to.deep.equal({
        id: 1,
        userId: 100,
        name: 'My Financial Plan',
        startDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      });
    });

    it('should handle negative user IDs (unauthenticated)', () => {
      const row: PlanRow = {
        id: 2,
        user_id: -50000,
        name: 'Guest Plan',
        start_date: '2025-02-01',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const plan = rowToPlan(row);

      expect(plan.userId).to.equal(-50000);
      expect(plan.name).to.equal('Guest Plan');
    });
  });

  describe('planToRow', () => {
    it('should convert plan to database row format', () => {
      const plan: Plan = {
        id: 1,
        userId: 100,
        name: 'My Financial Plan',
        startDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const row = planToRow(plan);

      expect(row).to.deep.equal({
        user_id: 100,
        name: 'My Financial Plan',
        start_date: '2025-01-01',
      });
    });

    it('should not include id, created_at, or updated_at', () => {
      const plan: Plan = {
        id: 1,
        userId: 100,
        name: 'Test Plan',
        startDate: '2025-01-01',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const row = planToRow(plan);

      expect(row).to.not.have.property('id');
      expect(row).to.not.have.property('created_at');
      expect(row).to.not.have.property('updated_at');
      expect(row).to.not.have.property('createdAt');
      expect(row).to.not.have.property('updatedAt');
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through row -> plan -> row conversion', () => {
      const originalRow: PlanRow = {
        id: 1,
        user_id: 100,
        name: 'Test Plan',
        start_date: '2025-01-01',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const plan = rowToPlan(originalRow);
      const newRow = planToRow(plan);

      expect(newRow.user_id).to.equal(originalRow.user_id);
      expect(newRow.name).to.equal(originalRow.name);
      expect(newRow.start_date).to.equal(originalRow.start_date);
    });
  });
});

