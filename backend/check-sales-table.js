import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('📊 Sales table structure:');
const salesInfo = db.prepare("PRAGMA table_info(sales)").all();
salesInfo.forEach(column => {
  console.log(`  ${column.name}: ${column.type} ${column.pk ? ' PRIMARY KEY' : ''} ${column.notnull ? ' NOT NULL' : ''}`);
});

console.log('\n👥 Staff members available:');
const staff = db.prepare('SELECT id, first_name, last_name, role FROM users').all();
staff.forEach(s => {
  console.log(`  ${s.id}: ${s.first_name} ${s.last_name} (${s.role})`);
});

db.close();
