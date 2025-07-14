import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all services
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status = 'all', category } = req.query;
    
    let query = `
      SELECT id, name, description, duration, price, category, status, created_at
      FROM services
    `;
    
    let conditions = [];
    let params = [];
    
    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY category, name';
    
    const services = db.prepare(query).all(...params);

    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service by ID
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const service = db.prepare(`
      SELECT id, name, description, duration, price, category, status, created_at
      FROM services
      WHERE id = ?
    `).get(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Get service usage statistics
    const appointmentCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM appointments
      WHERE service_id = ?
    `).get(req.params.id);

    const totalRevenue = db.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM appointments
      WHERE service_id = ? AND status = 'completed'
    `).get(req.params.id);

    service.appointment_count = appointmentCount.count;
    service.total_revenue = totalRevenue.revenue;

    res.json({ success: true, service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create service
router.post('/', [
  body('name').notEmpty().trim().withMessage('Service name is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().trim().withMessage('Category is required'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, duration, price, category, status = 'active' } = req.body;
    const db = req.app.locals.db;

    // Check if service name already exists
    const existingService = db.prepare('SELECT id FROM services WHERE name = ?').get(name);
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Service name already exists' });
    }

    const serviceId = uuidv4();
    db.prepare(`
      INSERT INTO services (id, name, description, duration, price, category, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(serviceId, name, description, duration, price, category, status);

    const newService = db.prepare(`
      SELECT id, name, description, duration, price, category, status, created_at
      FROM services WHERE id = ?
    `).get(serviceId);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service: newService
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service
router.put('/:id', [
  body('name').notEmpty().trim().withMessage('Service name is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().trim().withMessage('Category is required'),
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, duration, price, category, status } = req.body;
    const db = req.app.locals.db;

    // Check if service exists
    const existingService = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!existingService) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if name conflicts with other services
    const nameConflict = db.prepare('SELECT id FROM services WHERE name = ? AND id != ?').get(name, req.params.id);
    if (nameConflict) {
      return res.status(400).json({ success: false, message: 'Service name already exists' });
    }

    db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, duration = ?, price = ?, category = ?, status = ?
      WHERE id = ?
    `).run(name, description, duration, price, category, status, req.params.id);

    const updatedService = db.prepare(`
      SELECT id, name, description, duration, price, category, status, created_at
      FROM services WHERE id = ?
    `).get(req.params.id);

    res.json({ success: true, service: updatedService });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service
router.delete('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;

    // Check if service exists
    const service = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if service has appointments
    const appointmentCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE service_id = ? AND status IN ('pending', 'confirmed', 'in-progress')
    `).get(req.params.id);

    if (appointmentCount.count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete service with active appointments. Please complete or cancel them first.' 
      });
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service categories
router.get('/categories/list', (req, res) => {
  try {
    const db = req.app.locals.db;
    const categories = db.prepare(`
      SELECT DISTINCT category 
      FROM services 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `).all();

    res.json({ success: true, categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service statistics
router.get('/statistics/overview', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const activeServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE status = ?').get('active');
    const inactiveServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE status = ?').get('inactive');
    
    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count, AVG(price) as avg_price
      FROM services
      WHERE status = 'active'
      GROUP BY category
      ORDER BY count DESC
    `).all();

    const popularServices = db.prepare(`
      SELECT s.name, s.price, s.category, COUNT(a.id) as booking_count
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE s.status = 'active'
      GROUP BY s.id, s.name, s.price, s.category
      ORDER BY booking_count DESC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      statistics: {
        totalServices: totalServices.count,
        activeServices: activeServices.count,
        inactiveServices: inactiveServices.count,
        categoryStats,
        popularServices
      }
    });
  } catch (error) {
    console.error('Get service statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
