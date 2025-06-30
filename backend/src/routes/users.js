import express from 'express';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.prepare(`
      SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;