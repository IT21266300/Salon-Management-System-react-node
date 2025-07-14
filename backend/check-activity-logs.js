import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

try {
  console.log('=== Activity Log Investigation ===');
  
  // Check all tables
  console.log('\nAll tables in database:');
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  tables.forEach(table => console.log(' - ' + table.name));
  
  // Check if there's any activity log related table
  const activityTableExists = tables.find(t => 
    t.name.includes('log') || 
    t.name.includes('activity') || 
    t.name.includes('audit')
  );
  
  if (activityTableExists) {
    console.log('\n✅ Activity log table found:', activityTableExists.name);
    const schema = db.prepare(`PRAGMA table_info(${activityTableExists.name})`).all();
    console.log('Schema:', schema);
  } else {
    console.log('\n❌ No activity log table found in database');
    console.log('The activity log functionality appears to be missing backend implementation');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
