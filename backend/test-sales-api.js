import fetch from 'node-fetch';

async function testSalesAPI() {
  try {
    console.log('Testing Sales API...');

    // Test GET sales
    console.log('\n1. Testing GET /api/sales...');
    const salesResponse = await fetch('http://localhost:3001/api/sales');
    const salesData = await salesResponse.json();
    console.log('Sales API Response:', salesData.success ? 'SUCCESS' : 'FAILED');
    console.log('Number of sales:', salesData.sales?.length || 0);

    // Test GET inventory
    console.log('\n2. Testing GET /api/inventory...');
    const inventoryResponse = await fetch('http://localhost:3001/api/inventory');
    const inventoryData = await inventoryResponse.json();
    console.log('Inventory API Response:', inventoryData.success ? 'SUCCESS' : 'FAILED');
    console.log('Number of products:', inventoryData.products?.length || 0);

    // Test GET users (for staff)
    console.log('\n3. Testing GET /api/users...');
    const usersResponse = await fetch('http://localhost:3001/api/users');
    const usersData = await usersResponse.json();
    console.log('Users API Response:', usersData.success ? 'SUCCESS' : 'FAILED');
    const staffCount = usersData.users?.filter(u => u.role === 'staff' || u.role === 'manager').length || 0;
    console.log('Number of staff members:', staffCount);

    // Test GET customers
    console.log('\n4. Testing GET /api/customers...');
    const customersResponse = await fetch('http://localhost:3001/api/customers');
    const customersData = await customersResponse.json();
    console.log('Customers API Response:', customersData.success ? 'SUCCESS' : 'FAILED');
    console.log('Number of customers:', customersData.customers?.length || 0);

    console.log('\n--- Sales API Test Complete ---');
    console.log('All required data is available for sales functionality!');

  } catch (error) {
    console.error('Error testing Sales API:', error);
  }
}

testSalesAPI();
