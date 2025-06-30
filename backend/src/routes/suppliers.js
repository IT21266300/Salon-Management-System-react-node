import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all suppliers
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = db.prepare(`
      SELECT * FROM suppliers
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, suppliers: result });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create supplier
router.post('/', (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, contactPerson, email, phone, address } = req.body;
    const db = req.app.locals.db;

    const supplierId = uuidv4();
    const insertSupplier = db.prepare(`INSERT INTO suppliers (id, name, contact_person, email, phone, address)
                                       VALUES (?, ?, ?, ?, ?, ?)`);
    insertSupplier.run(supplierId, name, contactPerson, email, phone, address);

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplierId,
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;