import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('=== TESTING STATISTICS QUERIES ===\n');

try {
  console.log('1. Total Services:');
  const totalServices = db.prepare('SELECT COUNT(*) as count FROM services').get();
  console.log(totalServices);

  console.log('\n2. Active Services:');
  const activeServices = db.prepare('SELECT COUNT(*) as count FROM services WHERE status = "active"').get();
  console.log(activeServices);

  console.log('\n3. Category Stats:');
  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count, AVG(price) as avg_price
    FROM services
    WHERE status = 'active'
    GROUP BY category
    ORDER BY count DESC
  `).all();
  console.log(categoryStats);

  console.log('\n4. Popular Services:');
  const popularServices = db.prepare(`
    SELECT s.name, s.price, s.category, COUNT(a.id) as booking_count
    FROM services s
    LEFT JOIN appointments a ON s.id = a.service_id
    WHERE s.status = 'active'
    GROUP BY s.id, s.name, s.price, s.category
    ORDER BY booking_count DESC
    LIMIT 5
  `).all();
  console.log(popularServices);

} catch (error) {
  console.error('Error:', error);
}

db.close();
