import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('🗃️  Database Tables and Data\n');

// Get all table names
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

console.log('📋 Available Tables:');
tables.forEach((table, index) => {
  console.log(`${index + 1}. ${table.name}`);
});

console.log('\n' + '='.repeat(50) + '\n');

// Display data from each table
tables.forEach(table => {
  const tableName = table.name;
  console.log(`📊 Table: ${tableName.toUpperCase()}`);
  console.log('-'.repeat(30));
  
  try {
    // Get table structure
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    console.log('Columns:', columns.map(col => `${col.name} (${col.type})`).join(', '));
    
    // Get row count
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    console.log(`Total rows: ${count.count}`);
    
    // Get sample data (first 5 rows)
    if (count.count > 0) {
      const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT 5`).all();
      console.log('\nSample data:');
      console.table(rows);
    } else {
      console.log('No data in this table.\n');
    }
  } catch (error) {
    console.log(`Error reading table ${tableName}:`, error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
});

db.close();
