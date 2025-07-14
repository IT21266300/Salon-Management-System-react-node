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

// Get comprehensive analytics data
router.get('/analytics', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { period = 'month' } = req.query;
    
    // Get local date
    const currentTime = new Date();
    const localToday = new Date(currentTime.getTime() - (currentTime.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    // Simple date parameter for filtering
    let salesDateParam = localToday.slice(0, 7) + '-01'; // First day of current month

    // Revenue trends (daily data for last 30 days)
    const revenueTrends = db.prepare(`
      SELECT DATE(sale_date) as date, 
             COALESCE(SUM(total), 0) as revenue,
             COUNT(*) as transaction_count
      FROM sales 
      WHERE DATE(sale_date) >= DATE('now', '-30 days') AND status = 'completed'
      GROUP BY DATE(sale_date)
      ORDER BY date ASC
    `).all();

    // Payment method breakdown
    const paymentMethods = db.prepare(`
      SELECT payment_method, 
             COUNT(*) as count,
             COALESCE(SUM(total), 0) as total_amount
      FROM sales 
      WHERE DATE(sale_date) >= ? AND status = 'completed'
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `).all(salesDateParam);

    // Service performance (simplified - just service data)
    const servicePerformance = db.prepare(`
      SELECT s.name as service_name,
             s.price,
             COUNT(a.id) as bookings,
             COALESCE(SUM(s.price), 0) as total_revenue,
             AVG(s.price) as avg_price
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE a.date >= ?
      GROUP BY s.id, s.name, s.price
      ORDER BY bookings DESC
    `).all(salesDateParam);

    // Staff performance (simplified)
    const staffPerformance = db.prepare(`
      SELECT u.first_name || ' ' || u.last_name as staff_name,
             u.role,
             COUNT(a.id) as appointments_completed,
             COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count,
             COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_count,
             0 as total_revenue
      FROM users u
      LEFT JOIN appointments a ON u.id = a.staff_id
      WHERE u.role IN ('staff', 'manager', 'cashier') AND (a.date >= ? OR a.date IS NULL)
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY completed_count DESC
    `).all(salesDateParam);

    // Customer analytics (simple counts)
    const customerAnalytics = db.prepare(`
      SELECT COUNT(DISTINCT c.id) as total_customers,
             COUNT(DISTINCT CASE WHEN DATE(c.created_at) >= DATE('now', '-30 days') THEN c.id END) as new_customers_30d,
             COUNT(DISTINCT CASE WHEN DATE(c.created_at) >= DATE('now', '-7 days') THEN c.id END) as new_customers_7d,
             0 as total_appointments,
             0 as avg_transaction_value
      FROM customers c
    `).get();

    // Peak hours analysis
    const peakHours = db.prepare(`
      SELECT CAST(strftime('%H', a.time) AS INTEGER) as hour,
             COUNT(*) as appointment_count
      FROM appointments a
      WHERE a.date >= ?
      GROUP BY hour
      ORDER BY hour ASC
    `).all(salesDateParam);

    // Monthly comparison (this month vs last month)
    const thisMonth = localToday.slice(0, 7) + '-01';
    const lastMonth = new Date(new Date(thisMonth).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].slice(0, 7) + '-01';
    
    const monthlyComparison = {
      thisMonth: db.prepare(`
        SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as transactions
        FROM sales 
        WHERE DATE(sale_date) >= ? AND status = 'completed'
      `).get(thisMonth),
      lastMonth: db.prepare(`
        SELECT COALESCE(SUM(total), 0) as revenue, COUNT(*) as transactions
        FROM sales 
        WHERE DATE(sale_date) >= ? AND DATE(sale_date) < ? AND status = 'completed'
      `).get(lastMonth, thisMonth)
    };

    // Top customers by spending (simplified)
    const topCustomers = db.prepare(`
      SELECT c.first_name || ' ' || c.last_name as customer_name,
             c.email,
             c.phone,
             COUNT(a.id) as total_appointments,
             COALESCE(SUM(s.total), 0) as total_spent,
             MAX(DATE(s.sale_date)) as last_visit
      FROM customers c
      LEFT JOIN appointments a ON c.id = a.customer_id
      LEFT JOIN sales s ON c.id = s.customer_id
      WHERE s.sale_date >= ? OR s.sale_date IS NULL
      GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone
      ORDER BY total_spent DESC
      LIMIT 10
    `).all(salesDateParam);

    // Workstation utilization (simplified)
    const workstationAnalytics = db.prepare(`
      SELECT w.name as workstation_name,
             COUNT(a.id) as total_bookings,
             COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_bookings,
             0 as revenue_generated,
             0 as avg_revenue_per_booking
      FROM workstations w
      LEFT JOIN appointments a ON w.id = a.workstation_id
      WHERE a.date >= ? OR a.date IS NULL
      GROUP BY w.id, w.name
      ORDER BY completed_bookings DESC
    `).all(salesDateParam);

    res.json({
      success: true,
      analytics: {
        revenueTrends,
        paymentMethods,
        servicePerformance,
        staffPerformance,
        customerAnalytics,
        peakHours,
        monthlyComparison,
        topCustomers,
        workstationAnalytics,
        period,
        dateRange: [salesDateParam]
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get sales trends for specific time period
router.get('/sales-trends', (req, res) => {
  try {
    const db = req.app.locals.db;
    const { period = 'daily', days = 30 } = req.query;
    
    let groupBy = '';
    let dateFormat = '';
    
    switch (period) {
      case 'hourly':
        groupBy = "strftime('%Y-%m-%d %H', sale_date)";
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'daily':
        groupBy = "DATE(sale_date)";
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = "strftime('%Y-W%W', sale_date)";
        dateFormat = 'Week %W, %Y';
        break;
      case 'monthly':
        groupBy = "strftime('%Y-%m', sale_date)";
        dateFormat = '%Y-%m';
        break;
      default:
        groupBy = "DATE(sale_date)";
        dateFormat = '%Y-%m-%d';
    }

    const trends = db.prepare(`
      SELECT ${groupBy} as period,
             strftime('${dateFormat}', sale_date) as formatted_date,
             COALESCE(SUM(total), 0) as revenue,
             COUNT(*) as transaction_count,
             AVG(total) as avg_transaction_value
      FROM sales 
      WHERE DATE(sale_date) >= DATE('now', '-${days} days') AND status = 'completed'
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `).all();

    res.json({
      success: true,
      trends,
      period,
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Get sales trends error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer retention metrics
router.get('/customer-retention', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Customer retention analysis
    const retentionMetrics = db.prepare(`
      WITH customer_visits AS (
        SELECT c.id,
               c.first_name || ' ' || c.last_name as customer_name,
               COUNT(a.id) as total_visits,
               MIN(DATE(a.date)) as first_visit,
               MAX(DATE(a.date)) as last_visit,
               julianday('now') - julianday(MAX(DATE(a.date))) as days_since_last_visit
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id AND a.status = 'completed'
        GROUP BY c.id, c.first_name, c.last_name
      )
      SELECT 
        COUNT(CASE WHEN total_visits = 1 THEN 1 END) as one_time_customers,
        COUNT(CASE WHEN total_visits BETWEEN 2 AND 5 THEN 1 END) as regular_customers,
        COUNT(CASE WHEN total_visits > 5 THEN 1 END) as loyal_customers,
        COUNT(CASE WHEN days_since_last_visit <= 30 THEN 1 END) as active_customers,
        COUNT(CASE WHEN days_since_last_visit BETWEEN 31 AND 90 THEN 1 END) as at_risk_customers,
        COUNT(CASE WHEN days_since_last_visit > 90 THEN 1 END) as churned_customers,
        AVG(total_visits) as avg_visits_per_customer,
        AVG(days_since_last_visit) as avg_days_since_last_visit
      FROM customer_visits
      WHERE total_visits > 0
    `).get();

    // Customer segments
    const customerSegments = db.prepare(`
      WITH customer_spending AS (
        SELECT c.id,
               c.first_name || ' ' || c.last_name as customer_name,
               COUNT(a.id) as total_appointments,
               COALESCE(SUM(s.total), 0) as total_spent,
               MAX(DATE(a.date)) as last_visit
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id
        LEFT JOIN sales s ON a.id = s.appointment_id AND s.status = 'completed'
        GROUP BY c.id, c.first_name, c.last_name
      )
      SELECT customer_name,
             total_appointments,
             total_spent,
             last_visit,
             CASE 
               WHEN total_spent >= 500 THEN 'High Value'
               WHEN total_spent >= 200 THEN 'Medium Value'
               WHEN total_spent > 0 THEN 'Low Value'
               ELSE 'No Purchases'
             END as customer_segment
      FROM customer_spending
      ORDER BY total_spent DESC
      LIMIT 20
    `).all();

    res.json({
      success: true,
      retentionMetrics,
      customerSegments
    });
  } catch (error) {
    console.error('Get customer retention error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get revenue forecasting data
router.get('/revenue-forecast', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get last 12 months revenue data for trend analysis
    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', sale_date) as month,
             COALESCE(SUM(total), 0) as revenue,
             COUNT(*) as transaction_count
      FROM sales 
      WHERE DATE(sale_date) >= DATE('now', '-12 months') AND status = 'completed'
      GROUP BY strftime('%Y-%m', sale_date)
      ORDER BY month ASC
    `).all();

    // Calculate growth rates and predict next 3 months
    const growthRates = [];
    for (let i = 1; i < monthlyRevenue.length; i++) {
      const current = monthlyRevenue[i].revenue;
      const previous = monthlyRevenue[i - 1].revenue;
      const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      growthRates.push(growthRate);
    }

    const avgGrowthRate = growthRates.length > 0 
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length 
      : 0;

    // Generate forecasts
    const lastMonthRevenue = monthlyRevenue.length > 0 
      ? monthlyRevenue[monthlyRevenue.length - 1].revenue 
      : 0;

    const forecasts = [];
    let forecastRevenue = lastMonthRevenue;
    
    for (let i = 1; i <= 3; i++) {
      forecastRevenue = forecastRevenue * (1 + avgGrowthRate / 100);
      const forecastMonth = new Date();
      forecastMonth.setMonth(forecastMonth.getMonth() + i);
      
      forecasts.push({
        month: forecastMonth.toISOString().slice(0, 7),
        predicted_revenue: Math.round(forecastRevenue),
        confidence: Math.max(0.6, 1 - (i * 0.15)) // Decreasing confidence
      });
    }

    res.json({
      success: true,
      historicalData: monthlyRevenue,
      growthRate: avgGrowthRate,
      forecasts
    });
  } catch (error) {
    console.error('Get revenue forecast error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service profitability analysis
router.get('/service-profitability', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Analyze service profitability considering time spent
    const serviceProfitability = db.prepare(`
      SELECT s.name as service_name,
             s.price,
             s.duration as duration_minutes,
             COUNT(a.id) as total_bookings,
             COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price ELSE 0 END), 0) as total_revenue,
             COALESCE(SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancellations,
             ROUND(AVG(s.price / (s.duration / 60.0)), 2) as revenue_per_hour,
             ROUND((COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0)), 2) as completion_rate
      FROM services s
      LEFT JOIN appointments a ON s.id = a.service_id
      WHERE a.date >= DATE('now', '-90 days') OR a.id IS NULL
      GROUP BY s.id, s.name, s.price, s.duration
      ORDER BY revenue_per_hour DESC
    `).all();

    // Market analysis - popular times and service combinations
    const peakTimeAnalysis = db.prepare(`
      SELECT strftime('%H', time) as hour,
             COUNT(*) as appointment_count,
             COUNT(DISTINCT customer_id) as unique_customers,
             AVG(s.price) as avg_service_price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE DATE(a.date) >= DATE('now', '-30 days') AND a.status = 'completed'
      GROUP BY strftime('%H', time)
      ORDER BY appointment_count DESC
    `).all();

    res.json({
      success: true,
      serviceProfitability,
      peakTimeAnalysis
    });
  } catch (error) {
    console.error('Get service profitability error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer lifetime value analysis
router.get('/customer-lifetime-value', (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Calculate CLV metrics (simplified without appointment-sales link)
    const clvAnalysis = db.prepare(`
      WITH customer_metrics AS (
        SELECT c.id,
               c.first_name || ' ' || c.last_name as customer_name,
               COUNT(a.id) as total_visits,
               COALESCE(SUM(s.total), 0) as total_spent_sales,
               COALESCE(SUM(a.total_amount), 0) as total_spent_appointments,
               MIN(DATE(a.date)) as first_visit,
               MAX(DATE(a.date)) as last_visit,
               ROUND(julianday('now') - julianday(MIN(DATE(a.date)))) as customer_age_days
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id AND a.status = 'completed'
        LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
        GROUP BY c.id, c.first_name, c.last_name
      )
      SELECT customer_name,
             total_visits,
             (total_spent_sales + total_spent_appointments) as total_spent,
             CASE 
               WHEN total_visits > 0 THEN ROUND((total_spent_sales + total_spent_appointments) / total_visits, 2)
               ELSE 0 
             END as avg_order_value,
             customer_age_days,
             first_visit,
             last_visit,
             CASE 
               WHEN customer_age_days > 0 THEN ROUND(total_visits * 365.0 / customer_age_days, 2)
               ELSE 0 
             END as visit_frequency_per_year,
             CASE 
               WHEN customer_age_days > 0 THEN ROUND((total_spent_sales + total_spent_appointments) * 365.0 / customer_age_days, 2)
               ELSE 0 
             END as annual_value
      FROM customer_metrics
      WHERE total_visits > 0
      ORDER BY total_spent DESC
      LIMIT 50
    `).all();

    // CLV segments (simplified)
    const clvSegments = db.prepare(`
      WITH customer_clv AS (
        SELECT CASE 
                 WHEN (COALESCE(SUM(s.total), 0) + COALESCE(SUM(a.total_amount), 0)) >= 1000 THEN 'VIP'
                 WHEN (COALESCE(SUM(s.total), 0) + COALESCE(SUM(a.total_amount), 0)) >= 500 THEN 'High Value'
                 WHEN (COALESCE(SUM(s.total), 0) + COALESCE(SUM(a.total_amount), 0)) >= 200 THEN 'Medium Value'
                 WHEN (COALESCE(SUM(s.total), 0) + COALESCE(SUM(a.total_amount), 0)) > 0 THEN 'Low Value'
                 ELSE 'No Purchases'
               END as segment,
               (COALESCE(SUM(s.total), 0) + COALESCE(SUM(a.total_amount), 0)) as total_spent
        FROM customers c
        LEFT JOIN appointments a ON c.id = a.customer_id AND a.status = 'completed'
        LEFT JOIN sales s ON c.id = s.customer_id AND s.status = 'completed'
        GROUP BY c.id
      )
      SELECT segment,
             COUNT(*) as customer_count,
             AVG(total_spent) as avg_value
      FROM customer_clv
      GROUP BY segment
      ORDER BY avg_value DESC
    `).all();

    res.json({
      success: true,
      customerAnalysis: clvAnalysis,
      segments: clvSegments
    });
  } catch (error) {
    console.error('Get customer lifetime value error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;