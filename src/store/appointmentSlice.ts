import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  workstationId: string;
  workstationName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount: number;
}

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
}

const initialState: AppointmentState = {
  appointments: [],
  loading: false,
  error: null,
  selectedDate: new Date().toISOString().split('T')[0],
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    deleteAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setSelectedDate,
  setError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;