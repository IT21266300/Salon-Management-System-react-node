// Frontend Debug Script - paste this into browser console
// This will help debug the workstation staff assignment issue

console.log('=== WORKSTATION STAFF ASSIGNMENT DEBUG ===');

// Check if Redux store is accessible
if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('✅ Redux DevTools available');
} else {
  console.log('❌ Redux DevTools not available');
}

// Test API endpoints directly
async function debugWorkstationAssignment() {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  try {
    console.log('1. Testing workstations API...');
    const workstationsResponse = await fetch(`${API_BASE_URL}/workstations`);
    const workstationsData = await workstationsResponse.json();
    console.log('Workstations:', workstationsData.workstations.length);
    
    console.log('2. Testing users API...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const usersData = await usersResponse.json();
    const staff = usersData.users.filter(user => user.role === 'staff' || user.role === 'manager');
    console.log('Available staff:', staff.length);
    
    console.log('3. Available staff for assignment:');
    staff.forEach(s => {
      console.log(`- ${s.first_name} ${s.last_name} (${s.role})`);
    });
    
    console.log('4. Current workstation assignments:');
    workstationsData.workstations.forEach(ws => {
      if (ws.assigned_staff_id) {
        console.log(`- ${ws.name}: ${ws.assigned_staff_name}`);
      } else {
        console.log(`- ${ws.name}: No staff assigned`);
      }
    });
    
    // Find unassigned workstation and available staff
    const unassignedWorkstation = workstationsData.workstations.find(ws => !ws.assigned_staff_id);
    const assignedStaffIds = workstationsData.workstations
      .filter(ws => ws.assigned_staff_id)
      .map(ws => ws.assigned_staff_id);
    const availableStaff = staff.filter(s => !assignedStaffIds.includes(s.id));
    
    console.log('5. Unassigned workstations:', unassignedWorkstation ? unassignedWorkstation.name : 'None');
    console.log('6. Available staff for assignment:', availableStaff.length);
    
    if (unassignedWorkstation && availableStaff.length > 0) {
      console.log('7. Testing assignment...');
      const testStaff = availableStaff[0];
      
      const assignResponse = await fetch(`${API_BASE_URL}/workstations/${unassignedWorkstation.id}/assign-staff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: testStaff.id
        })
      });
      
      const assignResult = await assignResponse.json();
      console.log('Assignment result:', assignResult);
      
      if (assignResult.success) {
        console.log('✅ API assignment successful!');
      } else {
        console.log('❌ API assignment failed:', assignResult.message);
      }
    } else {
      console.log('❌ No unassigned workstations or available staff');
    }
    
  } catch (error) {
    console.error('Debug test failed:', error);
  }
}

// Run the debug test
debugWorkstationAssignment();

// Instructions for manual testing
console.log('=== MANUAL TESTING INSTRUCTIONS ===');
console.log('1. Open the workstations page');
console.log('2. Click "Assign Staff" on any workstation without assigned staff');
console.log('3. Check if the dialog opens');
console.log('4. Check if staff dropdown is populated');
console.log('5. Select a staff member and click "Assign"');
console.log('6. Check browser console for any errors');
console.log('7. Check if workstation shows assigned staff after assignment');
