import Database from 'better-sqlite3';

const db = new Database('../database/salon.db');

console.log('Tables in database:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => console.log(table.name));

console.log('\nUsers table schema:');
try {
  const schema = db.prepare('PRAGMA table_info(users)').all();
  console.log(schema);
} catch (e) {
  console.log('Users table does not exist');
}

db.close();
