import Database from 'better-sqlite3';

const db = new Database('../database/salon.db');

try {
  console.log('Updating activity_logs table to use local time...');
  
  // Backup current table
  db.exec(`
    CREATE TABLE activity_logs_backup AS SELECT * FROM activity_logs
  `);
  
  // Drop the original table
  db.exec('DROP TABLE activity_logs');
  
  // Create new table with local time default
  db.exec(`
    CREATE TABLE activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Copy data back, updating timestamps to local time
  db.exec(`
    INSERT INTO activity_logs (id, user_id, username, action, module, details, ip_address, user_agent, status, created_at)
    SELECT id, user_id, username, action, module, details, ip_address, user_agent, status, 
           datetime(created_at, 'localtime') as created_at
    FROM activity_logs_backup
  `);
  
  // Recreate indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON activity_logs(module);
  `);
  
  console.log('✅ Activity logs table updated successfully');
  
  // Test the new default
  const testResult = db.prepare("SELECT datetime('now', 'localtime') as local_time").get();
  console.log('New default time format:', testResult.local_time);
  
  // Show some sample data
  const sampleLogs = db.prepare('SELECT username, action, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 3').all();
  console.log('\nSample logs with new timestamps:');
  sampleLogs.forEach((log, index) => {
    console.log(`${index + 1}. ${log.username}: ${log.action} at ${log.created_at}`);
  });
  
  // Clean up backup table
  db.exec('DROP TABLE activity_logs_backup');
  
} catch (error) {
  console.error('Error updating table:', error);
} finally {
  db.close();
}
