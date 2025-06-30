# Brilliance Salon Management System

A comprehensive salon management system built with React.js, Node.js, and SQLite. This system helps manage appointments, customers, inventory, sales, and staff for beauty salons.

## Features

### 🏢 Administration
- User management with role-based access control
- Activity logging and audit trails
- System configuration and settings

### 📅 Appointments Management
- Calendar-based appointment booking
- Workstation and staff assignment
- Appointment status tracking
- Customer notifications

### 👤 Customer Management
- Customer profiles and contact information
- Service history and preferences
- Customer analytics and insights

### 🚚 Supplier Management
- Supplier database and contact management
- Purchase order tracking
- Supplier performance analytics

### 📦 Inventory Management
- Product catalog with categories
- Real-time stock tracking
- Low stock alerts and reorder management
- Inventory valuation reports

### 💰 Sales Management
- Point-of-sale system
- Invoice generation and printing
- Multiple payment methods
- Sales returns and refunds
- Discount management

### 📊 Reports & Analytics
- Daily, weekly, and monthly sales reports
- Stock movement reports
- Customer analytics
- Staff performance metrics
- Financial summaries

## Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Material-UI (MUI) v5** for UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Chart.js** for data visualization
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **SQLite** database with better-sqlite3
- **JWT** authentication
- **bcrypt** for password hashing
- **Winston** for logging

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd salon-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Run setup script**
```bash
npm run setup
```

4. **Install backend dependencies**
```bash
cd backend && npm install
```

5. **Start the application**
```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 3001) simultaneously.

## Default Login Credentials

- **Username:** admin
- **Password:** admin123

## Project Structure

```
salon-management-system/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── store/             # Redux store and slices
│   ├── theme/             # Material-UI theme configuration
│   └── types/             # TypeScript type definitions
├── backend/               # Backend Node.js application
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
├── database/              # SQLite database and migrations
├── scripts/               # Setup and utility scripts
└── docs/                  # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Customers
- `GET /api/customers` - Get customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Inventory
- `GET /api/inventory` - Get products
- `POST /api/inventory` - Add product
- `PUT /api/inventory/:id` - Update product
- `DELETE /api/inventory/:id` - Delete product

### Sales
- `GET /api/sales` - Get sales records
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

### Reports
- `GET /api/reports/dashboard-stats` - Get dashboard statistics
- `GET /api/reports/sales-summary` - Get sales summary
- `GET /api/reports/inventory-report` - Get inventory report

## User Roles

1. **Admin** - Full system access
2. **Manager** - Access to all modules except user management
3. **Staff** - Access to appointments, customers, and inventory
4. **Cashier** - Access to sales and customer information

## Development

### Adding New Features

1. Create new React components in `src/components/`
2. Add new API routes in `backend/src/routes/`
3. Update database schema if needed
4. Add new Redux slices for state management

### Database Migrations

Database tables are automatically created when the server starts. To modify the schema:

1. Update table definitions in `backend/src/app.js`
2. Restart the server to apply changes

### Environment Variables

Backend environment variables (`.env`):
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## Deployment

### Local Deployment

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
cd backend && npm start
```

### Database Backup

The SQLite database file is located at `database/salon.db`. Regular backups of this file are recommended.

## Support

For support and questions, please refer to the documentation in the `docs/` directory or contact the development team.

## License

This project is proprietary software developed for Brilliance Salon.