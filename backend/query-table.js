import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

// Function to query a specific table
function queryTable(tableName, limit = 10) {
  console.log(`\n📊 Table: ${tableName.toUpperCase()}`);
  console.log('='.repeat(50));
  
  try {
    // Get table structure
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    console.log('Columns:');
    columns.forEach(col => {
      console.log(`  - ${col.name} (${col.type}${col.pk ? ', PRIMARY KEY' : ''}${col.notnull ? ', NOT NULL' : ''})`);
    });
    
    // Get row count
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
    console.log(`\nTotal rows: ${count.count}`);
    
    // Get data
    if (count.count > 0) {
      const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ${limit}`).all();
      console.log(`\nData (showing ${Math.min(limit, count.count)} rows):`);
      console.table(rows);
    } else {
      console.log('\nNo data in this table.');
    }
  } catch (error) {
    console.log(`Error reading table ${tableName}:`, error.message);
  }
}

// Get command line arguments
const tableName = process.argv[2];
const limit = parseInt(process.argv[3]) || 10;

if (tableName) {
  queryTable(tableName, limit);
} else {
  console.log('Usage: node query-table.js <table_name> [limit]');
  console.log('\nAvailable tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
  });
  console.log('\nExample: node query-table.js users 5');
}

db.close();
