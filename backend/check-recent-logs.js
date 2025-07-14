import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

try {
  console.log('=== Recent Activity Logs ===');
  
  const logs = db.prepare('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5').all();
  console.log(`Total logs found: ${logs.length}`);
  
  logs.forEach((log, index) => {
    console.log(`${index + 1}. ${log.username}: ${log.action} (${log.module})`);
    console.log(`   Details: ${log.details}`);
    console.log(`   Time: ${log.created_at}`);
    console.log(`   Status: ${log.status}`);
    console.log('');
  });
  
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
