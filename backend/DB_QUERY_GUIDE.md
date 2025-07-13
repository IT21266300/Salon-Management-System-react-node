# Database Query Helper Scripts

## Using the Node.js scripts (Recommended)

### View all tables:
```bash
node view-tables.js
```

### Query specific table:
```bash
node query-table.js <table_name> [limit]
```

Examples:
```bash
node query-table.js users 5
node query-table.js products 10
node query-table.js sales
```

## Available Tables:
1. **users** - System users (admin, staff, etc.)
2. **customers** - Customer information
3. **services** - Available salon services
4. **workstations** - Salon workstations
5. **suppliers** - Product suppliers
6. **products** - Inventory items
7. **sales** - Sales transactions
8. **sale_items** - Individual items in sales
9. **appointments** - Customer appointments

## Common Queries:

### Check admin user:
```bash
node query-table.js users 1
```

### View recent sales:
```bash
node query-table.js sales 5
```

### Check product inventory:
```bash
node query-table.js products
```

### View upcoming appointments:
```bash
node query-table.js appointments
```

## SQLite CLI (if you have sqlite3 installed):
```bash
sqlite3 ../database/salon.db
```

Then use SQL commands:
```sql
.tables
.schema users
SELECT * FROM users LIMIT 5;
.quit
```
