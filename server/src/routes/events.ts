import { Router, Request, Response } from 'express';
import db from '../db/connection';
import { Event, EventRow, rowToEvent, eventToRow, EventType } from '../models/events';
import { PlanRow } from '../models/plan';
import { ensureUserId } from '../middleware/auth';

const router = Router();

// Apply userId middleware to all routes
router.use(ensureUserId);

/**
 * GET /api/plans/:planId/events
 * Get all events for a plan
 */
router.get('/:planId/events', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId, 10);
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Verify plan belongs to user
    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const plan = planStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Fetch events
    const eventsStmt = db.prepare('SELECT * FROM events WHERE plan_id = ? ORDER BY created_at');
    const rows = eventsStmt.all(planId) as EventRow[];
    
    const events = rows.map(rowToEvent);
    
    return res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * POST /api/plans/:planId/events
 * Create a new event
 */
router.post('/:planId/events', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId, 10);
    const { type, data } = req.body;
    
    if (isNaN(planId)) {
      return res.status(400).json({ error: 'Invalid plan ID' });
    }
    
    // Verify plan belongs to user
    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const plan = planStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Validate event type
    const validTypes: EventType[] = ['income', 'expense', 'mortgage', 'mortgage_repayment', 'pcp', 'car_loan'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    
    // Validate data
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Event data is required' });
    }
    
    // Basic validation based on event type
    const validationError = validateEventData(type, data);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    const event: Event = {
      planId,
      type,
      data,
    } as Event;
    
    const eventRow = eventToRow(event);
    
    const stmt = db.prepare(
      'INSERT INTO events (plan_id, type, data) VALUES (?, ?, ?)'
    );
    
    const result = stmt.run(eventRow.plan_id, eventRow.type, eventRow.data);
    
    // Fetch the created event
    const createdEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid) as EventRow;
    
    return res.status(201).json({ event: rowToEvent(createdEvent) });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PUT /api/plans/:planId/events/:eventId
 * Update an event
 */
router.put('/:planId/events/:eventId', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId, 10);
    const eventId = parseInt(req.params.eventId, 10);
    const { type, data } = req.body;
    
    if (isNaN(planId) || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid plan ID or event ID' });
    }
    
    // Verify plan belongs to user
    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const plan = planStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Verify event belongs to plan
    const eventStmt = db.prepare('SELECT * FROM events WHERE id = ? AND plan_id = ?');
    const existingEvent = eventStmt.get(eventId, planId) as EventRow | undefined;
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Validate event type if provided
    if (type !== undefined) {
      const validTypes: EventType[] = ['income', 'expense', 'mortgage', 'mortgage_repayment', 'pcp', 'car_loan'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid event type' });
      }
    }
    
    // Validate data if provided
    if (data !== undefined) {
      if (typeof data !== 'object') {
        return res.status(400).json({ error: 'Event data must be an object' });
      }
      
      const eventType = type || existingEvent.type;
      const validationError = validateEventData(eventType, data);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
    }
    
    // Update event
    const updates: string[] = [];
    const values: any[] = [];
    
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    
    if (data !== undefined) {
      updates.push('data = ?');
      values.push(JSON.stringify(data));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(eventId, planId);
    
    const updateStmt = db.prepare(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ? AND plan_id = ?`
    );
    
    updateStmt.run(...values);
    
    // Fetch updated event
    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as EventRow;
    
    return res.json({ event: rowToEvent(updatedEvent) });
  } catch (error) {
    console.error('Error updating event:', error);
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/plans/:planId/events/:eventId
 * Delete an event
 */
router.delete('/:planId/events/:eventId', (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const planId = parseInt(req.params.planId, 10);
    const eventId = parseInt(req.params.eventId, 10);
    
    if (isNaN(planId) || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid plan ID or event ID' });
    }
    
    // Verify plan belongs to user
    const planStmt = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?');
    const plan = planStmt.get(planId, userId) as PlanRow | undefined;
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    // Verify event belongs to plan
    const eventStmt = db.prepare('SELECT * FROM events WHERE id = ? AND plan_id = ?');
    const existingEvent = eventStmt.get(eventId, planId) as EventRow | undefined;
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete event
    const deleteStmt = db.prepare('DELETE FROM events WHERE id = ? AND plan_id = ?');
    deleteStmt.run(eventId, planId);
    
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

/**
 * Validate event data based on event type
 */
function validateEventData(type: EventType, data: any): string | null {
  // Common date validation
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  switch (type) {
    case 'income':
    case 'expense':
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        return 'Amount must be a positive number';
      }
      if (typeof data.isRecurrent !== 'boolean') {
        return 'isRecurrent must be a boolean';
      }
      if (!Array.isArray(data.months)) {
        return 'months must be an array';
      }
      if (data.months.some((m: any) => typeof m !== 'number' || m < 1 || m > 12)) {
        return 'months array must contain numbers between 1 and 12';
      }
      if (!data.startDate || !dateRegex.test(data.startDate)) {
        return 'startDate must be in YYYY-MM-DD format';
      }
      if (data.endDate && !dateRegex.test(data.endDate)) {
        return 'endDate must be in YYYY-MM-DD format';
      }
      break;
      
    case 'mortgage':
      if (!data.startDate || !dateRegex.test(data.startDate)) {
        return 'startDate must be in YYYY-MM-DD format';
      }
      if (typeof data.purchasePrice !== 'number' || data.purchasePrice <= 0) {
        return 'purchasePrice must be a positive number';
      }
      if (typeof data.loanedAmount !== 'number' || data.loanedAmount <= 0) {
        return 'loanedAmount must be a positive number';
      }
      if (data.loanedAmount > data.purchasePrice) {
        return 'loanedAmount cannot exceed purchasePrice';
      }
      if (typeof data.interestRate !== 'number' || data.interestRate < 0 || data.interestRate > 1) {
        return 'interestRate must be a number between 0 and 1';
      }
      if (typeof data.repaymentPercentage !== 'number' || data.repaymentPercentage < 0 || data.repaymentPercentage > 1) {
        return 'repaymentPercentage must be a number between 0 and 1';
      }
      if (typeof data.years !== 'number' || data.years <= 0) {
        return 'years must be a positive number';
      }
      break;
      
    case 'mortgage_repayment':
      if (typeof data.mortgageEventId !== 'number' || data.mortgageEventId <= 0) {
        return 'mortgageEventId must be a positive number';
      }
      if (!data.date || !dateRegex.test(data.date)) {
        return 'date must be in YYYY-MM-DD format';
      }
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        return 'amount must be a positive number';
      }
      break;
      
    case 'pcp':
      if (!data.startDate || !dateRegex.test(data.startDate)) {
        return 'startDate must be in YYYY-MM-DD format';
      }
      if (typeof data.purchasePrice !== 'number' || data.purchasePrice <= 0) {
        return 'purchasePrice must be a positive number';
      }
      if (typeof data.deposit !== 'number' || data.deposit < 0) {
        return 'deposit must be a non-negative number';
      }
      if (data.deposit > data.purchasePrice) {
        return 'deposit cannot exceed purchasePrice';
      }
      if (![2, 3, 5].includes(data.years)) {
        return 'years must be 2, 3, or 5';
      }
      if (typeof data.residualValue !== 'number' || data.residualValue < 0) {
        return 'residualValue must be a non-negative number';
      }
      if (typeof data.interestRate !== 'number' || data.interestRate < 0 || data.interestRate > 1) {
        return 'interestRate must be a number between 0 and 1';
      }
      break;
      
    case 'car_loan':
      if (!data.startDate || !dateRegex.test(data.startDate)) {
        return 'startDate must be in YYYY-MM-DD format';
      }
      if (typeof data.purchasePrice !== 'number' || data.purchasePrice <= 0) {
        return 'purchasePrice must be a positive number';
      }
      if (typeof data.deposit !== 'number' || data.deposit < 0) {
        return 'deposit must be a non-negative number';
      }
      if (data.deposit > data.purchasePrice) {
        return 'deposit cannot exceed purchasePrice';
      }
      if (typeof data.years !== 'number' || data.years < 3 || data.years > 10) {
        return 'years must be between 3 and 10';
      }
      if (typeof data.interestRate !== 'number' || data.interestRate < 0 || data.interestRate > 1) {
        return 'interestRate must be a number between 0 and 1';
      }
      break;
  }
  
  return null;
}

export default router;

