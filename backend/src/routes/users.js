import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

// Create new user
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if username or email already exists
    const existingUser = db.prepare(`
      SELECT id FROM users WHERE username = ? OR email = ?
    `).get(username, email);

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    stmt.run(userId, username, email, passwordHash, firstName, lastName, role);

    // Return created user (without password)
    const newUser = db.prepare(`
      SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `).get(userId);

    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username or email already exists for other users
    const duplicateUser = db.prepare(`
      SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?
    `).get(username, email, id);

    if (duplicateUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Prepare update query
    let updateQuery = `
      UPDATE users 
      SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
    `;
    let params = [username, email, firstName, lastName, role];

    // Add password update if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      updateQuery += ', password_hash = ?';
      params.push(passwordHash);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const stmt = db.prepare(updateQuery);
    stmt.run(...params);

    // Return updated user
    const updatedUser = db.prepare(`
      SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user status
router.patch('/:id/status', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active or inactive' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update status
    const stmt = db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, id);

    // Return updated user
    const updatedUser = db.prepare(`
      SELECT id, username, email, first_name, last_name, role, status, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;