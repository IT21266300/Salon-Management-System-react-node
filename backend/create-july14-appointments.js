import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('Creating test appointments for July 14, 2025...');

// Use July 14, 2025 explicitly
const targetDate = '2025-07-14';
console.log('Target date:', targetDate);

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

if (customers.length === 0 || services.length === 0) {
  console.log('❌ Insufficient data to create appointments');
  process.exit(1);
}

// Create test appointments for July 14th
const testAppointments = [
  {
    customerId: customers[0].id,
    serviceId: services[0].id,
    workstationId: workstations.length > 0 ? workstations[0].id : null,
    staffId: staff.length > 0 ? staff[0].id : null,
    time: '09:00',
    duration: 60,
    totalAmount: services[0].price,
    status: 'confirmed',
    notes: 'Morning appointment for July 14th'
  },
  {
    customerId: customers[1] ? customers[1].id : customers[0].id,
    serviceId: services[1] ? services[1].id : services[0].id,
    workstationId: workstations.length > 1 ? workstations[1].id : (workstations.length > 0 ? workstations[0].id : null),
    staffId: staff.length > 1 ? staff[1].id : (staff.length > 0 ? staff[0].id : null),
    time: '11:30',
    duration: 90,
    totalAmount: services[1] ? services[1].price : services[0].price,
    status: 'pending',
    notes: 'Mid-morning appointment for July 14th'
  },
  {
    customerId: customers[2] ? customers[2].id : customers[0].id,
    serviceId: services[2] ? services[2].id : services[0].id,
    workstationId: workstations.length > 2 ? workstations[2].id : (workstations.length > 0 ? workstations[0].id : null),
    staffId: staff.length > 0 ? staff[0].id : null,
    time: '14:00',
    duration: 75,
    totalAmount: services[2] ? services[2].price : services[0].price,
    status: 'confirmed',
    notes: 'Afternoon appointment for July 14th'
  },
  {
    customerId: customers[0].id,
    serviceId: services[0].id,
    workstationId: workstations.length > 0 ? workstations[0].id : null,
    staffId: staff.length > 1 ? staff[1].id : (staff.length > 0 ? staff[0].id : null),
    time: '16:30',
    duration: 60,
    totalAmount: services[0].price,
    status: 'completed',
    notes: 'Late afternoon appointment for July 14th'
  }
];

// Insert test appointments
let createdCount = 0;
for (const appointment of testAppointments) {
  try {
    const appointmentId = uuidv4();
    
    db.prepare(`
      INSERT INTO appointments (
        id, customer_id, service_id, workstation_id, staff_id, 
        date, time, duration, total_amount, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      appointmentId,
      appointment.customerId,
      appointment.serviceId,
      appointment.workstationId,
      appointment.staffId,
      targetDate,
      appointment.time,
      appointment.duration,
      appointment.totalAmount,
      appointment.status,
      appointment.notes
    );
    
    console.log(`✅ Created appointment: ${appointment.time} - ${appointment.status}`);
    createdCount++;
  } catch (error) {
    console.error('❌ Error creating appointment:', error.message);
  }
}

console.log(`🎉 Successfully created ${createdCount} test appointments for ${targetDate}`);

// Verify appointments were created for July 14th
const july14Appointments = db.prepare(`
  SELECT a.*, 
         c.first_name || ' ' || c.last_name as customer_name,
         s.name as service_name
  FROM appointments a
  LEFT JOIN customers c ON a.customer_id = c.id
  LEFT JOIN services s ON a.service_id = s.id
  WHERE a.date = ?
  ORDER BY a.time
`).all(targetDate);

console.log(`📋 July 14th appointments (${july14Appointments.length} total):`);
july14Appointments.forEach(apt => {
  console.log(`- ${apt.time}: ${apt.customer_name} - ${apt.service_name} (${apt.status})`);
});

db.close();
