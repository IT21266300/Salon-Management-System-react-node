import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all activity logs with filtering
router.get('/', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { 
      page = 1, 
      limit = 50, 
      user, 
      module, 
      status, 
      action, 
      startDate, 
      endDate 
    } = req.query;
    
    let query = `
      SELECT id, user_id, username, action, module, details, 
             ip_address, user_agent, status, created_at
      FROM activity_logs
    `;
    
    let conditions = [];
    let params = [];
    
    if (user) {
      conditions.push('username LIKE ?');
      params.push(`%${user}%`);
    }
    
    if (module && module !== 'all') {
      conditions.push('module = ?');
      params.push(module);
    }
    
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }
    
    if (action) {
      conditions.push('action LIKE ?');
      params.push(`%${action}%`);
    }
    
    if (startDate) {
      conditions.push('DATE(created_at) >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push('DATE(created_at) <= ?');
      params.push(endDate);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC';
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const logs = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM activity_logs';
    let countParams = [];
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams = params.slice(0, -2); // Remove limit and offset
    }
    
    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;
    
    res.json({
      success: true,
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get activity log by ID
router.get('/:id', (req, res) => {
  try {
    const db = req.app.locals.db;
    const log = db.prepare(`
      SELECT id, user_id, username, action, module, details, 
             ip_address, user_agent, status, created_at
      FROM activity_logs
      WHERE id = ?
    `).get(req.params.id);

    if (!log) {
      return res.status(404).json({ success: false, message: 'Activity log not found' });
    }

    res.json({ success: true, log });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create activity log (internal use)
router.post('/', (req, res) => {
  try {
    const {
      user_id,
      username,
      action,
      module,
      details,
      status = 'success'
    } = req.body;

    if (!username || !action || !module) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, action, and module are required' 
      });
    }

    const db = req.app.locals.db;
    const logId = uuidv4();
    
    // Get IP address and user agent from request
    const ip_address = req.ip || req.connection.remoteAddress || 'unknown';
    const user_agent = req.get('User-Agent') || 'unknown';

    db.prepare(`
      INSERT INTO activity_logs (id, user_id, username, action, module, details, ip_address, user_agent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, user_id, username, action, module, details, ip_address, user_agent, status);

    const newLog = db.prepare(`
      SELECT id, user_id, username, action, module, details, 
             ip_address, user_agent, status, created_at
      FROM activity_logs WHERE id = ?
    `).get(logId);

    res.status(201).json({
      success: true,
      message: 'Activity log created successfully',
      log: newLog
    });
  } catch (error) {
    console.error('Create activity log error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get activity log statistics
router.get('/statistics/overview', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get statistics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateParam = thirtyDaysAgo.toISOString().split('T')[0];
    
    const totalLogs = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get();
    const recentLogs = db.prepare(`
      SELECT COUNT(*) as count FROM activity_logs 
      WHERE DATE(created_at) >= ?
    `).get(dateParam);
    
    const logsByStatus = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM activity_logs
      WHERE DATE(created_at) >= ?
      GROUP BY status
      ORDER BY count DESC
    `).all(dateParam);
    
    const logsByModule = db.prepare(`
      SELECT module, COUNT(*) as count
      FROM activity_logs
      WHERE DATE(created_at) >= ?
      GROUP BY module
      ORDER BY count DESC
    `).all(dateParam);
    
    const topUsers = db.prepare(`
      SELECT username, COUNT(*) as count
      FROM activity_logs
      WHERE DATE(created_at) >= ?
      GROUP BY username
      ORDER BY count DESC
      LIMIT 10
    `).all(dateParam);
    
    const recentFailures = db.prepare(`
      SELECT username, action, module, details, created_at
      FROM activity_logs
      WHERE status = 'error' AND DATE(created_at) >= ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(dateParam);

    res.json({
      success: true,
      statistics: {
        totalLogs: totalLogs.count,
        recentLogs: recentLogs.count,
        logsByStatus,
        logsByModule,
        topUsers,
        recentFailures
      }
    });
  } catch (error) {
    console.error('Get activity log statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete old activity logs (cleanup)
router.delete('/cleanup', (req, res) => {
  try {
    const { days = 90 } = req.query;
    const db = req.app.locals.db;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const dateParam = cutoffDate.toISOString().split('T')[0];
    
    const result = db.prepare(`
      DELETE FROM activity_logs 
      WHERE DATE(created_at) < ?
    `).run(dateParam);

    res.json({
      success: true,
      message: `Deleted ${result.changes} activity logs older than ${days} days`
    });
  } catch (error) {
    console.error('Delete old activity logs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to log activity (to be used by other routes)
export const logActivity = (db, {
  user_id = null,
  username,
  action,
  module,
  details = null,
  ip_address = 'unknown',
  user_agent = 'unknown',
  status = 'success'
}) => {
  try {
    const logId = uuidv4();
    db.prepare(`
      INSERT INTO activity_logs (id, user_id, username, action, module, details, ip_address, user_agent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(logId, user_id, username, action, module, details, ip_address, user_agent, status);
    
    return logId;
  } catch (error) {
    console.error('Log activity error:', error);
    return null;
  }
};

export default router;
