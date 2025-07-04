import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all customers
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get customers with calculated visit statistics
    const customers = db.prepare(`
      SELECT 
        c.*,
        COALESCE(visit_stats.total_visits, 0) as total_visits,
        COALESCE(visit_stats.total_spent, 0) as total_spent,
        visit_stats.last_visit
      FROM customers c
      LEFT JOIN (
        SELECT 
          customer_id,
          COUNT(*) as total_visits,
          SUM(total_amount) as total_spent,
          MAX(date) as last_visit
        FROM appointments 
        WHERE status = 'completed'
        GROUP BY customer_id
      ) visit_stats ON c.id = visit_stats.customer_id
      ORDER BY c.created_at DESC
    `).all();

    res.json({ success: true, customers });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create customer
router.post('/', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, address, dateOfBirth, gender, notes } = req.body;
    const db = req.app.locals.db;

    const customerId = uuidv4();
    const insertCustomer = db.prepare(`
      INSERT INTO customers (id, first_name, last_name, email, phone, address, date_of_birth, gender, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCustomer.run(customerId, firstName, lastName, email, phone, address, dateOfBirth, gender, notes);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customerId,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, dateOfBirth, gender, notes } = req.body;
    const db = req.app.locals.db;

    const updateCustomer = db.prepare(`
      UPDATE customers SET 
        first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, 
        date_of_birth = ?, gender = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateCustomer.run(firstName, lastName, email, phone, address, dateOfBirth, gender, notes, id);

    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    db.pragma('foreign_keys = ON'); // Ensure FK enforcement is ON for this connection
    db.exec('BEGIN TRANSACTION');
    // Delete all appointments for this customer first
    db.prepare('DELETE FROM appointments WHERE customer_id = ?').run(id);
    // Now delete the customer
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    db.exec('COMMIT');
    res.json({ success: true, message: 'Customer and related appointments deleted successfully' });
  } catch (error) {
    try { req.app.locals.db.exec('ROLLBACK'); } catch (e) {}
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;