import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all services
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const services = db.prepare(`
      SELECT id, name, description, duration, price, category, status, image_url, created_at
      FROM services
      ORDER BY category, name
    `).all();

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
      SELECT id, name, description, duration, price, category, status, image_url, created_at
      FROM services
      WHERE id = ?
    `).get(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ success: true, service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new service
router.post('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, description, price, duration, category, status = 'active' } = req.body;

    // Validation
    if (!name || !price || !duration || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const id = uuidv4();
    const created_at = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO services (id, name, description, price, duration, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, description || '', price, duration, category, status, created_at);

    const newService = db.prepare(`
      SELECT id, name, description, duration, price, category, status, image_url, created_at
      FROM services
      WHERE id = ?
    `).get(id);

    res.status(201).json({ success: true, service: newService });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service
router.put('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, description, price, duration, category, status } = req.body;

    // Check if service exists
    const existingService = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Validation
    if (!name || !price || !duration || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const stmt = db.prepare(`
      UPDATE services
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, status = ?
      WHERE id = ?
    `);

    stmt.run(name, description || '', price, duration, category, status || 'active', req.params.id);

    const updatedService = db.prepare(`
      SELECT id, name, description, duration, price, category, status, image_url, created_at
      FROM services
      WHERE id = ?
    `).get(req.params.id);

    res.json({ success: true, service: updatedService });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service (soft delete by setting status to inactive)
router.delete('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;

    // Check if service exists
    const existingService = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
    if (!existingService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const stmt = db.prepare('UPDATE services SET status = ? WHERE id = ?');
    stmt.run('inactive', req.params.id);

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
