import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { Plan, PlanRow, rowToPlan, planToRow } from '../models/plan';
import { ensureUserId } from '../middleware/auth';
import { FinancialCalculator, ChartDataPoint } from '../services/calculator';
import { Event, EventRow, rowToEvent } from '../models/events';

const router = Router();

// Apply userId middleware to all routes
router.use(ensureUserId);

/**
 * GET /api/plans
 * List all plans for the current user
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    
    const stmt = db.prepare('SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(userId) as PlanRow[];
    
    const plans = rows.map(rowToPlan);
    
    return res.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

/**
 * POST /api/plans
 * Create a new plan
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, startDate } = req.body;
    
    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Plan name is required' });
    }
    
    if (!startDate || typeof startDate !== 'string') {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
    }
    
    const plan: Plan = {
      userId,
      name: name.trim(),
      startDate,
    };
    
    const planRow = planToRow(plan);
    
    const stmt = db.prepare(
      'INSERT INTO plans (user_id, name, start_date) VALUES (?, ?, ?)'
    );
    
    const result = stmt.run(planRow.user_id, planRow.name, planRow.start_date);
    
    // Fetch the created plan
    const createdPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(result.lastInsertRowid) as PlanRow;
    
    return res.status(201).json({ plan: rowToPlan(createdPlan) });
  } catch (error) {
    console.error('Error creating plan:', error);
    return res.status(500).json({ error: 'Failed to create plan' });
  }
});

/**
 * GET /api/plans/:id
 * Get a specific plan by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    const stmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const row = stmt.get(planId, userId) as PlanRow | undefined;
    
    if (!row) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    return res.json({ plan: rowToPlan(row) });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return res.status(500).json({ error: 'Failed to fetch plan' });
  }
});

/**
 * PUT /api/plans/:id
 * Update a plan
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id, 10);
    const { name, startDate } = req.body;
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Check if plan exists and belongs to user
    const checkStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const existingPlan = checkStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!existingPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Plan name must be a non-empty string' });
    }
    
    if (startDate !== undefined) {
      if (typeof startDate !== 'string') {
        return res.status(400).json({ error: 'Start date must be a string' });
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate)) {
        return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
      }
    }
    
    // Update plan
    const updates: string[] = [];
    const values: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    
    if (startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(startDate);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(planId, userId);
    
    const updateStmt = db.prepare(
      `UPDATE plans SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    );
    
    updateStmt.run(...values);
    
    // Fetch updated plan
    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(planId) as PlanRow;
    
    return res.json({ plan: rowToPlan(updatedPlan) });
  } catch (error) {
    console.error('Error updating plan:', error);
    return res.status(500).json({ error: 'Failed to update plan' });
  }
});

/**
 * DELETE /api/plans/:id
 * Delete a plan
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Check if plan exists and belongs to user
    const checkStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const existingPlan = checkStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!existingPlan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Delete plan (events will be cascade deleted due to foreign key)
    const deleteStmt = db.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?');
    deleteStmt.run(planId, userId);
    
    return res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return res.status(500).json({ error: 'Failed to delete plan' });
  }
});

/**
 * GET /api/plans/:id/chart-data
 * Get calculated liquidity and assets data for charting
 * Query params: rangeYears (5-20, default 10)
 */
router.get('/:id/chart-data', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.id, 10);
    const rangeYears = parseInt(req.query.rangeYears as string, 10) || 10;
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Validate rangeYears
    if (rangeYears < 5 || rangeYears > 20) {
      return res.status(400).json({ error: 'Range years must be between 5 and 20' });
    }
    
    // Check if plan exists and belongs to user
    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const planRow = planStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!planRow) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    const plan = rowToPlan(planRow);
    
    // Fetch all events for this plan
    const eventsStmt = db.prepare('SELECT * FROM events WHERE plan_id = ? ORDER BY created_at');
    const eventRows = eventsStmt.all(planId) as EventRow[];
    
    const events: Event[] = eventRows.map(rowToEvent);
    
    // Calculate liquidity and assets
    const calculator = new FinancialCalculator();
    const chartData: ChartDataPoint[] = calculator.calculateLiquidityAndAssets(
      events,
      plan.startDate,
      rangeYears
    );
    
    return res.json({ chartData });
  } catch (error) {
    console.error('Error calculating chart data:', error);
    return res.status(500).json({ error: 'Failed to calculate chart data' });
  }
});

export default router;

