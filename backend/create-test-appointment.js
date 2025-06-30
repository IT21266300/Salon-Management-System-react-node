import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

async function createTestAppointment() {
  try {
    console.log('Creating test appointment for visit tracking...');

    // Get first customer and staff member
    const customer = db.prepare('SELECT id FROM customers LIMIT 1').get();
    const staff = db.prepare("SELECT id FROM users WHERE role IN ('staff', 'manager') LIMIT 1").get();
    const service = db.prepare('SELECT id FROM services LIMIT 1').get();
    const workstation = db.prepare('SELECT id FROM workstations LIMIT 1').get();

    if (!customer || !staff || !service || !workstation) {
      console.error('Missing required data for appointment');
      return;
    }

    const appointmentId = uuidv4();
    
    // Create a confirmed appointment for today
    db.prepare(`INSERT INTO appointments 
      (id, customer_id, service_id, workstation_id, staff_id, date, time, duration, status, total_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        appointmentId, 
        customer.id, 
        service.id, 
        workstation.id, 
        staff.id, 
        '2025-07-01', // Today
        '14:00', 
        60, 
        'confirmed', 
        45.00, 
        'Test appointment for visit tracking'
      );

    console.log(`✅ Created confirmed appointment: ${appointmentId}`);
    console.log('You can now test check-in/check-out functionality!');

    // Also create an in-progress appointment
    const appointmentId2 = uuidv4();
    db.prepare(`INSERT INTO appointments 
      (id, customer_id, service_id, workstation_id, staff_id, date, time, duration, status, total_amount, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        appointmentId2, 
        customer.id, 
        service.id, 
        workstation.id, 
        staff.id, 
        '2025-07-01', // Today
        '15:00', 
        60, 
        'in-progress', 
        45.00, 
        'Test appointment in progress'
      );

    console.log(`✅ Created in-progress appointment: ${appointmentId2}`);

  } catch (error) {
    console.error('Error creating test appointment:', error);
  } finally {
    db.close();
  }
}

createTestAppointment();
