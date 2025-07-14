import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../database/salon.db');
const db = new Database(dbPath);

console.log('Creating test data for dashboard...');

// Get today's date
const today = '2025-07-14';
const yesterday = '2025-07-13';
const tomorrow = '2025-07-15';

console.log('Creating sales data for today and this week...');

// Get a staff member for sales
const salesStaff = db.prepare('SELECT id FROM users WHERE role IN (?, ?, ?) LIMIT 1').get('staff', 'manager', 'cashier');
if (!salesStaff) {
  console.error('No staff member found for sales');
  process.exit(1);
}

// Create some sales for today
const todaySales = [
  { total: 45.00, time: '09:30:00' },
  { total: 85.00, time: '11:45:00' },
  { total: 25.00, time: '14:20:00' }
];

todaySales.forEach((sale, index) => {
  const saleId = uuidv4();
  const saleDateTime = `${today} ${sale.time}`;
  
  try {
    db.prepare(`
      INSERT INTO sales (id, staff_id, subtotal, total, sale_date, status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, 'completed', 'cash', 'Test sale for dashboard')
    `).run(saleId, salesStaff.id, sale.total, sale.total, saleDateTime);
    console.log(`✅ Created sale: $${sale.total} at ${sale.time}`);
  } catch (error) {
    console.error('Error creating sale:', error.message);
  }
});

// Create some sales for this week (July 8-12)
const weekDates = ['2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12'];
weekDates.forEach(date => {
  const saleId = uuidv4();
  const amount = Math.floor(Math.random() * 100) + 30; // Random amount between 30-130
  const saleDateTime = `${date} 12:00:00`;
  
  try {
    db.prepare(`
      INSERT INTO sales (id, staff_id, subtotal, total, sale_date, status, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, 'completed', 'card', 'Weekly test sale')
    `).run(saleId, salesStaff.id, amount, amount, saleDateTime);
    console.log(`✅ Created weekly sale: $${amount} on ${date}`);
  } catch (error) {
    console.error('Error creating weekly sale:', error.message);
  }
});

console.log('Creating recent customers...');

// Create some recent customers (last 7 days)
const recentCustomerDates = ['2025-07-08', '2025-07-10', '2025-07-12', '2025-07-13'];
const customerNames = [
  { first: 'Alex', last: 'Thompson', email: 'alex@email.com', phone: '555-0101' },
  { first: 'Maria', last: 'Garcia', email: 'maria@email.com', phone: '555-0102' },
  { first: 'James', last: 'Wilson', email: 'james@email.com', phone: '555-0103' },
  { first: 'Lisa', last: 'Anderson', email: 'lisa@email.com', phone: '555-0104' }
];

recentCustomerDates.forEach((date, index) => {
  if (index < customerNames.length) {
    const customerId = uuidv4();
    const customer = customerNames[index];
    const createdAt = `${date} 10:00:00`;
    
    try {
      db.prepare(`
        INSERT INTO customers (id, first_name, last_name, email, phone, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(customerId, customer.first, customer.last, customer.email, customer.phone, createdAt);
      console.log(`✅ Created customer: ${customer.first} ${customer.last} on ${date}`);
    } catch (error) {
      console.error('Error creating customer:', error.message);
    }
  }
});

console.log('Creating tomorrow\'s appointments...');

// Create appointments for tomorrow
const customers = db.prepare('SELECT * FROM customers LIMIT 4').all();
const services = db.prepare('SELECT * FROM services LIMIT 3').all();
const workstations = db.prepare('SELECT * FROM workstations LIMIT 3').all();
const staff = db.prepare('SELECT * FROM users WHERE role IN (?, ?) LIMIT 2').all('staff', 'manager');

const tomorrowAppointments = [
  { time: '09:00', status: 'confirmed' },
  { time: '11:30', status: 'pending' },
  { time: '14:00', status: 'confirmed' },
  { time: '16:30', status: 'pending' }
];

tomorrowAppointments.forEach((appt, index) => {
  if (index < customers.length && services.length > 0) {
    const appointmentId = uuidv4();
    const customer = customers[index];
    const service = services[index % services.length];
    const workstation = workstations.length > 0 ? workstations[index % workstations.length] : null;
    const staffMember = staff.length > 0 ? staff[index % staff.length] : null;
    
    try {
      db.prepare(`
        INSERT INTO appointments (
          id, customer_id, service_id, workstation_id, staff_id,
          date, time, duration, total_amount, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        appointmentId,
        customer.id,
        service.id,
        workstation?.id || null,
        staffMember?.id || null,
        tomorrow,
        appt.time,
        60,
        service.price,
        appt.status,
        `Tomorrow's appointment - ${appt.time}`
      );
      console.log(`✅ Created tomorrow appointment: ${customer.first_name} ${customer.last_name} at ${appt.time}`);
    } catch (error) {
      console.error('Error creating tomorrow appointment:', error.message);
    }
  }
});

console.log('\n🎉 Dashboard test data created successfully!');

// Verify the data
console.log('\n📊 Summary:');
const todaySalesCount = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM sales WHERE DATE(sale_date) = ?').get(today);
console.log(`- Today's sales: ${todaySalesCount.count} sales, $${todaySalesCount.total}`);

const weekStart = '2025-07-07'; // Start of current week (Sunday)
const weeklySalesCount = db.prepare(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM sales WHERE DATE(sale_date) >= ? AND status = 'completed'`).get(weekStart);
console.log(`- Weekly sales: ${weeklySalesCount.count} sales, $${weeklySalesCount.total}`);

const recentCustomersCount = db.prepare('SELECT COUNT(*) as count FROM customers WHERE DATE(created_at) >= ?').get('2025-07-08');
console.log(`- Recent customers: ${recentCustomersCount.count} customers`);

const tomorrowApptsCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE date = ?').get(tomorrow);
console.log(`- Tomorrow's appointments: ${tomorrowApptsCount.count} appointments`);

db.close();
