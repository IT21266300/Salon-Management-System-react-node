import Database from 'better-sqlite3';

const db = new Database('../database/salon.db');

// Check current time formats
console.log('=== Time Comparison ===');
console.log('JavaScript Date:', new Date().toISOString());
console.log('JavaScript Local:', new Date().toLocaleString());

// Check what's in the database
const logs = db.prepare('SELECT created_at FROM activity_logs LIMIT 3').all();
console.log('\nDatabase timestamps:');
logs.forEach((log, index) => {
  console.log(`${index + 1}. ${log.created_at}`);
});

// Check SQLite current time
const currentTime = db.prepare("SELECT datetime('now') as current_time, datetime('now', 'localtime') as local_time").get();
console.log('\nSQLite times:');
console.log('UTC:', currentTime.current_time);
console.log('Local:', currentTime.local_time);

db.close();
