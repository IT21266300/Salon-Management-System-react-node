import express from 'express';

const router = express.Router();

// Get all services
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const services = db.prepare(`
      SELECT id, name, description, duration, price, category, status
      FROM services
      WHERE status = 'active'
      ORDER BY category, name
    `).all();

    res.json({ success: true, services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
