import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:3000/api';

// Types
interface Workstation {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out-of-order';
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  appointment_count: number;
  created_at: string;
}

interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface WorkstationAppointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  service: string;
  status: string;
}

interface WorkstationState {
  workstations: Workstation[];
  currentWorkstation: Workstation | null;
  loading: boolean;
  error: string | null;
  availableStaff: Staff[];
  workstationAppointments: WorkstationAppointment[];
}

interface CreateWorkstationData {
  name: string;
  type: string;
  status?: 'available' | 'occupied' | 'maintenance' | 'out-of-order';
}

interface UpdateWorkstationData {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out-of-order';
}

interface StaffAssignmentData {
  workstationId: string;
  staffId: string;
}

// Async thunks
export const fetchWorkstations = createAsyncThunk(
  'workstations/fetchWorkstations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations`);
      if (!response.ok) {
        throw new Error('Failed to fetch workstations');
      }
      const data = await response.json();
      return data.workstations;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchWorkstationById = createAsyncThunk(
  'workstations/fetchWorkstationById',
  async (workstationId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workstation');
      }
      const data = await response.json();
      return data.workstation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAvailableStaff = createAsyncThunk(
  'workstations/fetchAvailableStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const data = await response.json();
      return data.users.filter((user: Staff) => user.role === 'staff' || user.role === 'manager');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchWorkstationAppointments = createAsyncThunk(
  'workstations/fetchWorkstationAppointments',
  async (workstationId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}/appointments`);
      if (!response.ok) {
        throw new Error('Failed to fetch workstation appointments');
      }
      const data = await response.json();
      return data.appointments;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const createWorkstation = createAsyncThunk(
  'workstations/createWorkstation',
  async (workstationData: CreateWorkstationData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workstationData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create workstation');
      }
      const data = await response.json();
      return data.workstation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateWorkstation = createAsyncThunk(
  'workstations/updateWorkstation',
  async (workstationData: UpdateWorkstationData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = workstationData;
      const response = await fetch(`${API_BASE_URL}/workstations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update workstation');
      }
      const data = await response.json();
      return data.workstation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const deleteWorkstation = createAsyncThunk(
  'workstations/deleteWorkstation',
  async (workstationId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete workstation');
      }
      return workstationId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const assignStaffToWorkstation = createAsyncThunk(
  'workstations/assignStaffToWorkstation',
  async ({ workstationId, staffId }: StaffAssignmentData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}/assign-staff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staffId }),
      });

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to assign staff');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const removeStaffFromWorkstation = createAsyncThunk(
  'workstations/removeStaffFromWorkstation',
  async (workstationId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}/remove-staff`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove staff');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'workstations/updateAppointmentStatus',
  async ({ workstationId, appointmentId, status }: { workstationId: string; appointmentId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workstations/${workstationId}/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appointment status');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

const initialState: WorkstationState = {
  workstations: [],
  currentWorkstation: null,
  loading: false,
  error: null,
  availableStaff: [],
  workstationAppointments: [],
};

const workstationSlice = createSlice({
  name: 'workstations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWorkstationAppointments: (state) => {
      state.workstationAppointments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workstations
      .addCase(fetchWorkstations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkstations.fulfilled, (state, action) => {
        state.loading = false;
        state.workstations = action.payload;
      })
      .addCase(fetchWorkstations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch workstation by ID
      .addCase(fetchWorkstationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkstationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWorkstation = action.payload;
      })
      .addCase(fetchWorkstationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch available staff
      .addCase(fetchAvailableStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.availableStaff = action.payload;
      })
      .addCase(fetchAvailableStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch workstation appointments
      .addCase(fetchWorkstationAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkstationAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.workstationAppointments = action.payload;
      })
      .addCase(fetchWorkstationAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create workstation
      .addCase(createWorkstation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkstation.fulfilled, (state, action) => {
        state.loading = false;
        state.workstations.push(action.payload);
      })
      .addCase(createWorkstation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update workstation
      .addCase(updateWorkstation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkstation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.workstations.findIndex(ws => ws.id === action.payload.id);
        if (index !== -1) {
          state.workstations[index] = action.payload;
        }
        if (state.currentWorkstation && state.currentWorkstation.id === action.payload.id) {
          state.currentWorkstation = action.payload;
        }
      })
      .addCase(updateWorkstation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete workstation
      .addCase(deleteWorkstation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWorkstation.fulfilled, (state, action) => {
        state.loading = false;
        state.workstations = state.workstations.filter(ws => ws.id !== action.payload);
        if (state.currentWorkstation && state.currentWorkstation.id === action.payload) {
          state.currentWorkstation = null;
          state.workstationAppointments = [];
        }
      })
      .addCase(deleteWorkstation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Assign staff to workstation
      .addCase(assignStaffToWorkstation.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignStaffToWorkstation.fulfilled, (state, action) => {
        state.loading = false;
        // Update the workstation in the workstations array
        const { workstationId, staffId } = action.meta.arg;
        const workstationIndex = state.workstations.findIndex(ws => ws.id === workstationId);
        if (workstationIndex !== -1) {
          state.workstations[workstationIndex].assigned_staff_id = staffId;
          // Find staff name from available staff
          const staff = state.availableStaff.find(s => s.id === staffId);
          if (staff) {
            state.workstations[workstationIndex].assigned_staff_name = `${staff.first_name} ${staff.last_name}`;
          }
        }
      })
      .addCase(assignStaffToWorkstation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Remove staff from workstation
      .addCase(removeStaffFromWorkstation.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeStaffFromWorkstation.fulfilled, (state, action) => {
        state.loading = false;
        // Update the workstation in the workstations array
        const workstationId = action.meta.arg;
        const workstationIndex = state.workstations.findIndex(ws => ws.id === workstationId);
        if (workstationIndex !== -1) {
          state.workstations[workstationIndex].assigned_staff_id = undefined;
          state.workstations[workstationIndex].assigned_staff_name = undefined;
        }
      })
      .addCase(removeStaffFromWorkstation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update appointment status
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state) => {
        state.loading = false;
        // Note: The API response doesn't include the new appointment data,
        // so we rely on the caller to refresh the appointments list
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearWorkstationAppointments } = workstationSlice.actions;
export default workstationSlice.reducer;
