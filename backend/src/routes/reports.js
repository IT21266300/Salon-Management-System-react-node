import express from 'express';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard-stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get today's sales
    const todayStart = new Date().toISOString().split('T')[0] + ' 00:00:00';
    const todayEnd = new Date().toISOString().split('T')[0] + ' 23:59:59';
    
    const dailySalesResult = db.prepare(`SELECT COALESCE(SUM(total), 0) as daily_total
                                        FROM sales
                                        WHERE sale_date BETWEEN ? AND ? AND status = 'completed'`).get(todayStart, todayEnd);

    // Get this month's sales
    const monthStart = new Date().toISOString().slice(0, 7) + '-01 00:00:00';
    const monthlySalesResult = db.prepare(`SELECT COALESCE(SUM(total), 0) as monthly_total
                                          FROM sales
                                          WHERE sale_date >= ? AND status = 'completed'`).get(monthStart);

    // Get customer count
    const customerCountResult = db.prepare('SELECT COUNT(*) as count FROM customers').get();

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointmentsResult = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(today);

    res.json({
      success: true,
      stats: {
        dailyTotal: dailySalesResult?.daily_total || 0,
        monthlyTotal: monthlySalesResult?.monthly_total || 0,
        totalCustomers: customerCountResult?.count || 0,
        todayAppointments: todayAppointmentsResult?.count || 0,
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;