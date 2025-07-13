import Database from 'better-sqlite3';

const db = new Database('../database/salon.db');

console.log('All tables:');
console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());

console.log('\nSales table exists?');
try {
  console.log(db.prepare('SELECT * FROM sales LIMIT 3').all());
} catch (e) {
  console.log('Sales table does not exist:', e.message);
}

console.log('\nAppointments sample data:');
console.log(db.prepare('SELECT * FROM appointments WHERE status = "completed" LIMIT 3').all());

db.close();
