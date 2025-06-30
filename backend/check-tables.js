import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('🔍 Checking current table structures...');

try {
  // Check users table structure
  console.log('\n👥 Users table structure:');
  const usersInfo = db.prepare("PRAGMA table_info(users)").all();
  usersInfo.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });

  // Check appointments table structure
  console.log('\n📅 Appointments table structure:');
  const appointmentsInfo = db.prepare("PRAGMA table_info(appointments)").all();
  appointmentsInfo.forEach(col => {
    console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });

  // Check if sections table exists
  console.log('\n🔍 Checking for sections table:');
  const sectionsExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sections'").get();
  if (sectionsExists) {
    console.log('  ✓ Sections table exists');
    const sectionsInfo = db.prepare("PRAGMA table_info(sections)").all();
    sectionsInfo.forEach(col => {
      console.log(`    ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
  } else {
    console.log('  ❌ Sections table does not exist');
  }

} catch (error) {
  console.error('❌ Error checking tables:', error);
} finally {
  db.close();
}
