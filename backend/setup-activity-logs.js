import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

try {
  console.log('Creating activity_logs table...');
  
  // Create activity_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'success',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  console.log('✅ Activity logs table created successfully');

  // Create an index for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_module ON activity_logs(module);
  `);

  console.log('✅ Indexes created successfully');

  // Insert some sample activity logs
  const sampleLogs = [
    {
      id: '1',
      user_id: null,
      username: 'Admin User',
      action: 'User Login',
      module: 'Authentication',
      details: 'Successful login',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '2',
      user_id: null,
      username: 'Jane Smith',
      action: 'Create Appointment',
      module: 'Appointments',
      details: 'Created appointment for John Doe',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '3',
      user_id: null,
      username: 'Admin User',
      action: 'Update Product',
      module: 'Inventory',
      details: 'Updated stock for Shampoo XYZ',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '4',
      user_id: null,
      username: 'Staff Member',
      action: 'Complete Sale',
      module: 'Sales',
      details: 'Processed sale #12345 - $125.50',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success'
    },
    {
      id: '5',
      user_id: null,
      username: 'Manager User',
      action: 'Delete Customer',
      module: 'Customers',
      details: 'Deleted customer record for inactive account',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'warning'
    },
    {
      id: '6',
      user_id: null,
      username: 'System',
      action: 'Failed Login',
      module: 'Authentication',
      details: 'Failed login attempt - invalid credentials',
      ip_address: '192.168.1.200',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'error'
    }
  ];

  const insertLog = db.prepare(`
    INSERT OR REPLACE INTO activity_logs 
    (id, user_id, username, action, module, details, ip_address, user_agent, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' hours'))
  `);

  sampleLogs.forEach((log, index) => {
    insertLog.run(
      log.id,
      log.user_id,
      log.username,
      log.action,
      log.module,
      log.details,
      log.ip_address,
      log.user_agent,
      log.status,
      index // Hours ago
    );
  });

  console.log('✅ Sample activity logs inserted');

  // Verify the logs were created
  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get();
  console.log(`📊 Total activity logs: ${logCount.count}`);

  const recentLogs = db.prepare(`
    SELECT username, action, module, status, created_at
    FROM activity_logs
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  console.log('\n📋 Recent activity logs:');
  recentLogs.forEach(log => {
    console.log(`- ${log.username}: ${log.action} (${log.module}) - ${log.status} at ${log.created_at}`);
  });

} catch (error) {
  console.error('❌ Error creating activity logs table:', error);
} finally {
  db.close();
}
