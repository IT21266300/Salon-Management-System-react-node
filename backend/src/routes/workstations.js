import express from 'express';

const router = express.Router();

// Get all workstations
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const workstations = db.prepare(`
      SELECT id, name, type, status
      FROM workstations
      WHERE status = 'available'
      ORDER BY type, name
    `).all();

    res.json({ success: true, workstations });
  } catch (error) {
    console.error('Get workstations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
