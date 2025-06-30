import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

try {
  console.log('Checking customer visit statistics after check-out...');
  
  const customers = db.prepare(`
    SELECT 
      c.first_name, c.last_name,
      COALESCE(visit_stats.total_visits, 0) as total_visits,
      COALESCE(visit_stats.total_spent, 0) as total_spent,
      visit_stats.last_visit
    FROM customers c
    LEFT JOIN (
      SELECT 
        customer_id,
        COUNT(*) as total_visits,
        SUM(total_amount) as total_spent,
        MAX(date) as last_visit
      FROM appointments 
      WHERE status = 'completed'
      GROUP BY customer_id
    ) visit_stats ON c.id = visit_stats.customer_id
    LIMIT 5
  `).all();

  console.log('Customer visit statistics:');
  customers.forEach(customer => {
    console.log(`- ${customer.first_name} ${customer.last_name}:`);
    console.log(`  Total Visits: ${customer.total_visits}`);
    console.log(`  Total Spent: $${customer.total_spent || 0}`);
    console.log(`  Last Visit: ${customer.last_visit || 'Never'}`);
  });

  // Also check appointment statuses
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM appointments 
    GROUP BY status
  `).all();

  console.log('\nAppointment status counts:');
  statusCounts.forEach(({status, count}) => {
    console.log(`  ${status}: ${count}`);
  });

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
