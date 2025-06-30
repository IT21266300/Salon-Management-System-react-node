import fetch from 'node-fetch';

async function testCustomerVisitTracking() {
  try {
    console.log('Testing Customer Visit Tracking...');

    // Test 1: Get customers with visit statistics
    console.log('\n1. Testing customer visit statistics...');
    const customersResponse = await fetch('http://localhost:3001/api/customers');
    const customersData = await customersResponse.json();
    
    if (customersData.success) {
      console.log('✅ Customers API working');
      console.log('Customer visit statistics:');
      customersData.customers.slice(0, 3).forEach(customer => {
        console.log(`- ${customer.first_name} ${customer.last_name}:`);
        console.log(`  Total Visits: ${customer.total_visits}`);
        console.log(`  Total Spent: $${customer.total_spent || 0}`);
        console.log(`  Last Visit: ${customer.last_visit || 'Never'}`);
      });
    } else {
      console.error('❌ Customers API failed');
    }

    // Test 2: Check appointments for check-in/check-out functionality
    console.log('\n2. Testing appointments for check-in/check-out...');
    const appointmentsResponse = await fetch('http://localhost:3001/api/appointments');
    const appointmentsData = await appointmentsResponse.json();
    
    if (appointmentsData.success) {
      console.log('✅ Appointments API working');
      console.log('Appointment statuses:');
      const statusCounts = {};
      appointmentsData.appointments.forEach(apt => {
        statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
      });
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} appointments`);
      });
    } else {
      console.error('❌ Appointments API failed');
    }

    // Test 3: Test check-in functionality (if there are confirmed appointments)
    const confirmedAppointments = appointmentsData.appointments?.filter(apt => apt.status === 'confirmed');
    if (confirmedAppointments && confirmedAppointments.length > 0) {
      console.log('\n3. Testing check-in functionality...');
      const testAppointment = confirmedAppointments[0];
      console.log(`Testing check-in for appointment: ${testAppointment.id}`);
      
      const checkinResponse = await fetch(`http://localhost:3001/api/appointments/${testAppointment.id}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (checkinResponse.ok) {
        console.log('✅ Check-in API working');
        
        // Test check-out
        console.log('Testing check-out...');
        const checkoutResponse = await fetch(`http://localhost:3001/api/appointments/${testAppointment.id}/checkout`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (checkoutResponse.ok) {
          console.log('✅ Check-out API working');
          console.log('✅ Customer visit should be recorded now!');
        } else {
          console.error('❌ Check-out API failed');
        }
      } else {
        console.error('❌ Check-in API failed');
      }
    } else {
      console.log('\n3. No confirmed appointments found to test check-in/out');
    }

    console.log('\n--- Customer Visit Tracking Test Complete ---');

  } catch (error) {
    console.error('Error testing customer visit tracking:', error);
  }
}

testCustomerVisitTracking();
