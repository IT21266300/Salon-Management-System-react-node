import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('Creating test appointments for today...');

// Get today's date
const today = new Date().toISOString().split('T')[0];
console.log('Today\'s date:', today);

// Get some sample customers, services, workstations, and staff
const customers = db.prepare('SELECT * FROM customers LIMIT 3').all();
const services = db.prepare('SELECT * FROM services LIMIT 3').all();
const workstations = db.prepare('SELECT * FROM workstations LIMIT 3').all();
const staff = db.prepare('SELECT * FROM users WHERE role IN (?, ?) LIMIT 2').all('staff', 'manager');

console.log('Available data:');
console.log('- Customers:', customers.length);
console.log('- Services:', services.length);
console.log('- Workstations:', workstations.length);
console.log('- Staff:', staff.length);

if (customers.length === 0 || services.length === 0 || workstations.length === 0 || staff.length === 0) {
  console.log('❌ Insufficient data to create appointments');
  process.exit(1);
}

// Create test appointments for today
const testAppointments = [
  {
    customerId: customers[0].id,
    serviceId: services[0].id,
    workstationId: workstations[0].id,
    staffId: staff[0].id,
    time: '09:00',
    duration: 60,
    totalAmount: services[0].price,
    status: 'confirmed',
    notes: 'Morning appointment - auto-generated for testing'
  },
  {
    customerId: customers[1].id,
    serviceId: services[1].id,
    workstationId: workstations[1].id,
    staffId: staff[0].id,
    time: '11:30',
    duration: 90,
    totalAmount: services[1].price,
    status: 'pending',
    notes: 'Midday appointment - auto-generated for testing'
  },
  {
    customerId: customers[2].id,
    serviceId: services[2].id,
    workstationId: workstations[2].id,
    staffId: staff.length > 1 ? staff[1].id : staff[0].id,
    time: '14:00',
    duration: 45,
    totalAmount: services[2].price,
    status: 'confirmed',
    notes: 'Afternoon appointment - auto-generated for testing'
  }
];

// Insert appointments
const insertStmt = db.prepare(`
  INSERT INTO appointments (id, customer_id, service_id, workstation_id, staff_id, date, time, duration, total_amount, status, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let created = 0;
for (const apt of testAppointments) {
  try {
    const appointmentId = uuidv4();
    insertStmt.run(
      appointmentId,
      apt.customerId,
      apt.serviceId,
      apt.workstationId,
      apt.staffId,
      today,
      apt.time,
      apt.duration,
      apt.totalAmount,
      apt.status,
      apt.notes
    );
    created++;
    console.log(`✅ Created appointment: ${apt.time} - ${apt.status}`);
  } catch (error) {
    console.log(`❌ Failed to create appointment: ${error.message}`);
  }
}

console.log(`\n🎉 Successfully created ${created} test appointments for today (${today})`);

// Verify the appointments were created
const todayAppointments = db.prepare(`
  SELECT a.*, 
         c.first_name || ' ' || c.last_name as customer_name,
         s.name as service_name,
         w.name as workstation_name
  FROM appointments a
  LEFT JOIN customers c ON a.customer_id = c.id
  LEFT JOIN services s ON a.service_id = s.id
  LEFT JOIN workstations w ON a.workstation_id = w.id
  WHERE a.date = ?
  ORDER BY a.time
`).all(today);

console.log(`\n📋 Today's appointments (${todayAppointments.length} total):`);
todayAppointments.forEach(apt => {
  console.log(`- ${apt.time}: ${apt.customer_name} - ${apt.service_name} (${apt.status})`);
});

db.close();
