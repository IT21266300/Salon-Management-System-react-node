import { createClient } from '@libsql/client';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database/salon.db');
const db = createClient({ url: `file:${dbPath}` });

console.log('Initializing database...');

async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'cashier')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        date_of_birth DATE,
        gender TEXT CHECK (gender IN ('male', 'female', 'other')),
        notes TEXT,
        total_visits INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        last_visit DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        price REAL NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        workstation_id TEXT,
        staff_id TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')),
        total_amount REAL NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `;

    const createWorkstationsTable = `
      CREATE TABLE IF NOT EXISTS workstations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSuppliersTable = `
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        contact_person TEXT,
        payment_terms TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        brand TEXT,
        unit TEXT NOT NULL,
        cost_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 10,
        supplier_id TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
      )
    `;

    const createSalesTable = `
      CREATE TABLE IF NOT EXISTS sales (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        staff_id TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer')),
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
        sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `;

    const createSaleItemsTable = `
      CREATE TABLE IF NOT EXISTS sale_items (
        id TEXT PRIMARY KEY,
        sale_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `;

    // Execute table creation
    console.log('Creating users table...');
    await db.execute(createUsersTable);
    console.log('Creating customers table...');
    await db.execute(createCustomersTable);
    console.log('Creating services table...');
    await db.execute(createServicesTable);
    console.log('Creating appointments table...');
    await db.execute(createAppointmentsTable);
    console.log('Creating workstations table...');
    await db.execute(createWorkstationsTable);
    console.log('Creating suppliers table...');
    await db.execute(createSuppliersTable);
    console.log('Creating products table...');
    await db.execute(createProductsTable);
    console.log('Creating sales table...');
    await db.execute(createSalesTable);
    console.log('Creating sale_items table...');
    await db.execute(createSaleItemsTable);

    // Create default admin user if it doesn't exist
    console.log('Checking for admin user...');
    const adminCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: ['admin']
    });

    if (adminCheck.rows.length === 0) {
      console.log('Creating default admin user...');
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await db.execute({
        sql: `INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [adminId, 'admin', 'admin@salon.com', hashedPassword, 'System', 'Administrator', 'admin']
      });
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

initializeDatabase();
