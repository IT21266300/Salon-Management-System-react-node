import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';
import reportRoutes from './routes/reports.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize SQLite database with better-sqlite3
const dbPath = join(__dirname, '../../database/salon.db');
const db = new Database(dbPath);

// Make database available to routes
app.locals.db = db;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// Initialize database tables and create default admin user
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

    const createServicesTable = `
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        duration INTEGER NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createWorkstationsTable = `
      CREATE TABLE IF NOT EXISTS workstations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
        assigned_staff_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSuppliersTable = `
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
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
        sku TEXT UNIQUE,
        category TEXT,
        supplier_id TEXT,
        purchase_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 10,
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

    // Execute table creation using better-sqlite3
    db.exec(createUsersTable);
    db.exec(createCustomersTable);
    db.exec(createAppointmentsTable);
    db.exec(createServicesTable);
    db.exec(createWorkstationsTable);
    db.exec(createSuppliersTable);
    db.exec(createProductsTable);
    db.exec(createSalesTable);
    db.exec(createSaleItemsTable);

    // Create default admin user if it doesn't exist
    const adminCheck = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

    if (!adminCheck) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const insertAdmin = db.prepare(`INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)`);
      insertAdmin.run(adminId, 'admin', 'admin@brilliancesalon.com', hashedPassword, 'Admin', 'User', 'admin');
      
      logger.info('Default admin user created');
    }

    // Create sample data
    createSampleData(db);

    logger.info('Database tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Create sample data for demonstration
function createSampleData(db) {
  try {
    // Check if sample data already exists
    const customerCheck = db.prepare('SELECT COUNT(*) as count FROM customers').get();
    if (customerCheck.count > 0) return;

    // Sample customers
    const customers = [
      { id: uuidv4(), firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@email.com', phone: '+1234567890' },
      { id: uuidv4(), firstName: 'Michael', lastName: 'Brown', email: 'michael@email.com', phone: '+1234567891' },
      { id: uuidv4(), firstName: 'Emma', lastName: 'Davis', email: 'emma@email.com', phone: '+1234567892' },
    ];

    const insertCustomer = db.prepare(`INSERT INTO customers (id, first_name, last_name, email, phone)
                                       VALUES (?, ?, ?, ?, ?)`);
    for (const customer of customers) {
      insertCustomer.run(customer.id, customer.firstName, customer.lastName, customer.email, customer.phone);
    }

    // Sample suppliers
    const suppliers = [
      { id: uuidv4(), name: 'Beauty Supply Co', contactPerson: 'John Smith', email: 'john@beautysupply.com', phone: '+1234567893' },
      { id: uuidv4(), name: 'Professional Hair Products', contactPerson: 'Jane Doe', email: 'jane@hairpro.com', phone: '+1234567894' },
    ];

    const insertSupplier = db.prepare(`INSERT INTO suppliers (id, name, contact_person, email, phone)
                                       VALUES (?, ?, ?, ?, ?)`);
    for (const supplier of suppliers) {
      insertSupplier.run(supplier.id, supplier.name, supplier.contactPerson, supplier.email, supplier.phone);
    }

    // Sample products
    const products = [
      { id: uuidv4(), name: 'Premium Shampoo', category: 'Hair Care', supplierId: suppliers[0].id, purchasePrice: 15.00, sellingPrice: 25.00, stock: 50, reorderLevel: 10 },
      { id: uuidv4(), name: 'Hair Conditioner', category: 'Hair Care', supplierId: suppliers[0].id, purchasePrice: 12.00, sellingPrice: 20.00, stock: 30, reorderLevel: 8 },
      { id: uuidv4(), name: 'Hair Styling Gel', category: 'Styling', supplierId: suppliers[1].id, purchasePrice: 8.00, sellingPrice: 15.00, stock: 5, reorderLevel: 10 },
    ];

    const insertProduct = db.prepare(`INSERT INTO products (id, name, category, supplier_id, purchase_price, selling_price, quantity_in_stock, reorder_level)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const product of products) {
      insertProduct.run(product.id, product.name, product.category, product.supplierId, product.purchasePrice, product.sellingPrice, product.stock, product.reorderLevel);
    }

    // Sample services
    const services = [
      { id: uuidv4(), name: 'Haircut & Style', description: 'Professional haircut with styling', price: 45.00, duration: 60, category: 'Hair Services' },
      { id: uuidv4(), name: 'Hair Color', description: 'Full hair coloring service', price: 85.00, duration: 120, category: 'Hair Services' },
      { id: uuidv4(), name: 'Manicure', description: 'Professional nail care', price: 25.00, duration: 45, category: 'Nail Services' },
    ];

    const insertService = db.prepare(`INSERT INTO services (id, name, description, price, duration, category)
                                     VALUES (?, ?, ?, ?, ?, ?)`);
    for (const service of services) {
      insertService.run(service.id, service.name, service.description, service.price, service.duration, service.category);
    }

    // Sample workstations
    const workstations = [
      { id: uuidv4(), name: 'Station 1', type: 'Hair Styling' },
      { id: uuidv4(), name: 'Station 2', type: 'Hair Styling' },
      { id: uuidv4(), name: 'Nail Station 1', type: 'Nail Care' },
    ];

    const insertWorkstation = db.prepare(`INSERT INTO workstations (id, name, type)
                                         VALUES (?, ?, ?)`);
    for (const workstation of workstations) {
      insertWorkstation.run(workstation.id, workstation.name, workstation.type);
    }

    logger.info('Sample data created successfully');
  } catch (error) {
    logger.error('Failed to create sample data:', error);
  }
}

// Start server
app.listen(PORT, () => {
  initializeDatabase();
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Salon Management System API running on http://localhost:${PORT}`);
});

export default app;