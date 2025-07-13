import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('=== Date Debug Analysis ===');

// Check what Node.js thinks "today" is
const nodeToday = new Date().toISOString().split('T')[0];
console.log('Node.js today:', nodeToday);

// Check appointments by date
const allAppointments = db.prepare('SELECT date, COUNT(*) as count FROM appointments GROUP BY date ORDER BY date').all();
console.log('\nAppointments by date:');
allAppointments.forEach(row => {
  console.log(`  ${row.date}: ${row.count} appointments`);
});

// Check specifically for different possible "today" dates
const possibleTodayDates = ['2025-07-13', '2025-07-14'];
console.log('\nAppointment counts for possible "today" dates:');
possibleTodayDates.forEach(date => {
  const count = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(date);
  console.log(`  ${date}: ${count?.count || 0} appointments`);
});

// Check the specific query from the backend
const backendQuery = 'SELECT COUNT(*) as count FROM appointments WHERE date = ?';
const backendResult = db.prepare(backendQuery).get(nodeToday);
console.log(`\nBackend query result for "${nodeToday}": ${backendResult?.count || 0} appointments`);

db.close();
