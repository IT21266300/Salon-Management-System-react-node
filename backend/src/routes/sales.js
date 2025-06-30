import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all sales
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get sales with customer and staff information
    const sales = db.prepare(`
      SELECT s.*, 
             c.first_name as customer_first_name, 
             c.last_name as customer_last_name,
             u.first_name as staff_first_name, 
             u.last_name as staff_last_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.staff_id = u.id
      ORDER BY s.sale_date DESC
    `).all();

    // Get sale items for each sale
    for (let sale of sales) {
      const items = db.prepare(`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
      `).all(sale.id);
      
      sale.items = items;
      sale.customer_name = sale.customer_first_name ? 
        `${sale.customer_first_name} ${sale.customer_last_name}` : null;
      sale.staff_name = `${sale.staff_first_name} ${sale.staff_last_name}`;
    }

    res.json({ success: true, sales });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create sale
router.post('/', [
  body('items').isArray().withMessage('Items array is required'),
  body('staffId').notEmpty().withMessage('Staff ID is required'),
  body('total').isNumeric().withMessage('Total must be a number'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, staffId, items, subtotal, discount = 0, tax = 0, total, paymentMethod, notes } = req.body;
    const db = req.app.locals.db;

    const saleId = uuidv4();
    
    // Insert sale
    const insertSale = db.prepare(`
      INSERT INTO sales (id, customer_id, staff_id, subtotal, discount, tax, total, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSale.run(saleId, customerId, staffId, subtotal, discount, tax, total, paymentMethod, notes);

    // Insert sale items and update product stock
    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products SET quantity_in_stock = quantity_in_stock - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const item of items) {
      const itemId = uuidv4();
      const itemTotal = item.quantity * item.unitPrice;
      insertSaleItem.run(itemId, saleId, item.productId, item.quantity, item.unitPrice, itemTotal);
      
      // Update product stock
      updateProductStock.run(item.quantity, item.productId);
    }

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      saleId,
    });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
