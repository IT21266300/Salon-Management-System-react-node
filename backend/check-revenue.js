import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('=== CHECKING DATABASE CONTENT ===\n');

console.log('=== SERVICES ===');
const services = db.prepare('SELECT id, name, price FROM services LIMIT 5').all();
console.log(services);

console.log('\n=== APPOINTMENTS ===');
const appointments = db.prepare('SELECT id, service_id, total_amount, status FROM appointments LIMIT 5').all();
console.log(appointments);

console.log('\n=== SALES ===');
const sales = db.prepare('SELECT id, total FROM sales LIMIT 3').all();
console.log(sales);

console.log('\n=== SERVICE REVENUE CHECK ===');
const serviceRevenue = db.prepare(`
  SELECT s.name, s.price, COUNT(a.id) as appointments, 
         COALESCE(SUM(CASE WHEN a.status = 'completed' THEN a.total_amount ELSE 0 END), 0) as revenue
  FROM services s
  LEFT JOIN appointments a ON s.id = a.service_id
  GROUP BY s.id, s.name, s.price
  LIMIT 5
`).all();
console.log(serviceRevenue);

console.log('\n=== APPOINTMENT STATUS BREAKDOWN ===');
const statusBreakdown = db.prepare(`
  SELECT status, COUNT(*) as count, SUM(total_amount) as total_amount
  FROM appointments 
  GROUP BY status
`).all();
console.log(statusBreakdown);

db.close();
