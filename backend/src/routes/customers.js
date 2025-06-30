import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all customers
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const customers = db.prepare(`
      SELECT * FROM customers
      ORDER BY created_at DESC
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

    const deleteCustomer = db.prepare('DELETE FROM customers WHERE id = ?');
    deleteCustomer.run(id);

    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;