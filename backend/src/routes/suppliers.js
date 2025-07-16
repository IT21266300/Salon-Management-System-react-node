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
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('contactPerson').optional(),
  body('email').optional().custom((value) => {
    if (value && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Invalid email format');
    }
    return true;
  }),
  body('phone').optional(),
  body('address').optional(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, contactPerson, email, phone, address } = req.body;
    const db = req.app.locals.db;

    const supplierId = uuidv4();
    const insertSupplier = db.prepare(`INSERT INTO suppliers (id, name, contact_person, email, phone, address, status)
                                       VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertSupplier.run(supplierId, name, contactPerson || null, email || null, phone || null, address || null, 'active');

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

// Get supplier by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const result = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json({ success: true, supplier: result });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update supplier
router.put('/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('contactPerson').optional(),
  body('email').optional().custom((value) => {
    if (value && value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('Invalid email format');
    }
    return true;
  }),
  body('phone').optional(),
  body('address').optional(),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, contactPerson, email, phone, address, status } = req.body;
    const db = req.app.locals.db;

    // Check if supplier exists
    const existingSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!existingSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const updateSupplier = db.prepare(`
      UPDATE suppliers 
      SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateSupplier.run(
      name, 
      contactPerson || null, 
      email || null, 
      phone || null, 
      address || null, 
      status || existingSupplier.status,
      id
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully',
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete supplier
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Check if supplier exists
    const existingSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!existingSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    // Check if supplier is referenced by any products
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE supplier_id = ?').get(id);
    if (productCount.count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete supplier: supplier is referenced by existing products' 
      });
    }

    const deleteSupplier = db.prepare('DELETE FROM suppliers WHERE id = ?');
    deleteSupplier.run(id);

    res.json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle supplier status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or inactive' });
    }

    // Check if supplier exists
    const existingSupplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
    if (!existingSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const updateStatus = db.prepare('UPDATE suppliers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateStatus.run(status, id);

    res.json({
      success: true,
      message: `Supplier ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle supplier status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;