// Frontend test - simulate staff assignment
const API_BASE_URL = 'http://localhost:3000/api';

// Test 1: Check if we can fetch workstations
async function testFetchWorkstations() {
  try {
    const response = await fetch(`${API_BASE_URL}/workstations`);
    const data = await response.json();
    console.log('Workstations fetched:', data.workstations.length);
    return data.workstations;
  } catch (error) {
    console.error('Error fetching workstations:', error);
    return [];
  }
}

// Test 2: Check if we can fetch available staff
async function testFetchAvailableStaff() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    const data = await response.json();
    const staff = data.users.filter(user => user.role === 'staff' || user.role === 'manager');
    console.log('Available staff:', staff.length);
    return staff;
  } catch (error) {
    console.error('Error fetching staff:', error);
    return [];
  }
}

// Test 3: Test staff assignment
async function testStaffAssignment() {
  try {
    const workstations = await testFetchWorkstations();
    const staff = await testFetchAvailableStaff();
    
    if (workstations.length === 0) {
      console.error('No workstations available');
      return;
    }
    
    if (staff.length === 0) {
      console.error('No staff available');
      return;
    }
    
    // Find a workstation without assigned staff
    const workstation = workstations.find(ws => !ws.assigned_staff_id);
    if (!workstation) {
      console.log('All workstations have assigned staff');
      return;
    }
    
    const staffToAssign = staff[0];
    console.log(`Assigning ${staffToAssign.first_name} ${staffToAssign.last_name} to ${workstation.name}`);
    
    // Assign staff
    const assignResponse = await fetch(`${API_BASE_URL}/workstations/${workstation.id}/assign-staff`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staffId: staffToAssign.id
      })
    });
    
    const assignResult = await assignResponse.json();
    console.log('Assignment result:', assignResult);
    
    // Verify the assignment
    const updatedWorkstations = await testFetchWorkstations();
    const updatedWorkstation = updatedWorkstations.find(ws => ws.id === workstation.id);
    
    console.log('Updated workstation:', {
      name: updatedWorkstation.name,
      assigned_staff_id: updatedWorkstation.assigned_staff_id,
      assigned_staff_name: updatedWorkstation.assigned_staff_name
    });
    
    if (updatedWorkstation.assigned_staff_id === staffToAssign.id) {
      console.log('✅ Staff assignment successful!');
    } else {
      console.log('❌ Staff assignment failed!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testStaffAssignment();
