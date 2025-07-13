import express from 'express';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard-stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get today's sales (using local date, not UTC)
    const currentTime = new Date();
    const localToday = new Date(currentTime.getTime() - (currentTime.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const todayStart = localToday + ' 00:00:00';
    const todayEnd = localToday + ' 23:59:59';
    
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

    // Get today's appointments (using local date, not UTC)
    const now = new Date();
    const today = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
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

// Get enhanced dashboard stats
router.get('/enhanced-stats', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get local date
    const currentTime = new Date();
    const localToday = new Date(currentTime.getTime() - (currentTime.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const todayStart = localToday + ' 00:00:00';
    const todayEnd = localToday + ' 23:59:59';
    const monthStart = new Date().toISOString().slice(0, 7) + '-01 00:00:00';
    
    // Basic stats (existing)
    const dailySalesResult = db.prepare(`SELECT COALESCE(SUM(total), 0) as daily_total
                                        FROM sales
                                        WHERE sale_date BETWEEN ? AND ? AND status = 'completed'`).get(todayStart, todayEnd);

    const monthlySalesResult = db.prepare(`SELECT COALESCE(SUM(total), 0) as monthly_total
                                          FROM sales
                                          WHERE sale_date >= ? AND status = 'completed'`).get(monthStart);

    const customerCountResult = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    const todayAppointmentsResult = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(localToday);

    // New enhanced stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0] + ' 00:00:00';
    
    const weeklySalesResult = db.prepare(`SELECT COALESCE(SUM(total), 0) as weekly_total
                                         FROM sales
                                         WHERE sale_date >= ? AND status = 'completed'`).get(weekStartStr);

    // Staff performance (top 3 staff by completed appointments this month)
    const staffPerformance = db.prepare(`
      SELECT u.first_name || ' ' || u.last_name as staff_name, 
             COUNT(a.id) as completed_appointments,
             0 as total_revenue
      FROM users u
      LEFT JOIN appointments a ON u.id = a.staff_id AND a.status = 'completed' 
                               AND a.date >= ?
      WHERE u.role IN ('staff', 'manager')
      GROUP BY u.id, u.first_name, u.last_name
      ORDER BY completed_appointments DESC
      LIMIT 3
    `).all(localToday.slice(0, 7) + '-01');

    // Service popularity (this month)
    const popularServices = db.prepare(`
      SELECT s.name, s.price, COUNT(a.id) as booking_count
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id 
                               AND a.date >= ?
      GROUP BY s.id, s.name, s.price
      ORDER BY booking_count DESC
      LIMIT 5
    `).all(localToday.slice(0, 7) + '-01');

    // Recent customers (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentCustomers = db.prepare(`
      SELECT first_name, last_name, email, phone, created_at
      FROM customers 
      WHERE DATE(created_at) >= ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(sevenDaysAgoStr);

    // Workstation utilization (this month)
    const workstationStats = db.prepare(`
      SELECT w.name as workstation_name, COUNT(a.id) as usage_count
      FROM workstations w
      LEFT JOIN appointments a ON w.id = a.workstation_id 
                               AND a.date >= ?
      GROUP BY w.id, w.name
      ORDER BY usage_count DESC
    `).all(localToday.slice(0, 7) + '-01');

    res.json({
      success: true,
      stats: {
        // Basic stats
        dailyTotal: dailySalesResult?.daily_total || 0,
        monthlyTotal: monthlySalesResult?.monthly_total || 0,
        weeklyTotal: weeklySalesResult?.weekly_total || 0,
        totalCustomers: customerCountResult?.count || 0,
        todayAppointments: todayAppointmentsResult?.count || 0,
        // Enhanced stats
        staffPerformance,
        popularServices,
        recentCustomers,
        workstationStats
      }
    });
  } catch (error) {
    console.error('Get enhanced dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;