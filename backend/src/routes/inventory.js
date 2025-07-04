import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const products = db.prepare(`
      SELECT p.*, s.name as supplier_name
      FROM products p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.created_at DESC
    `).all();

    res.json({ success: true, products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create product
router.post('/', (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, purchasePrice, sellingPrice, quantityInStock, reorderLevel, supplierId } = req.body;
    const db = req.app.locals.db;

    const productId = uuidv4();
    db.prepare(`INSERT INTO products (id, name, description, category, purchase_price, selling_price, quantity_in_stock, reorder_level, supplier_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(productId, name, description, category, purchasePrice, sellingPrice, quantityInStock, reorderLevel, supplierId);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update product
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, purchasePrice, sellingPrice, quantityInStock, reorderLevel, supplierId, status } = req.body;
    const db = req.app.locals.db;

    db.prepare(`UPDATE products SET name = ?, description = ?, category = ?, 
                purchase_price = ?, selling_price = ?, quantity_in_stock = ?, reorder_level = ?, 
                supplier_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(name, description, category, purchasePrice, sellingPrice, quantityInStock, reorderLevel, supplierId, status, id);

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;