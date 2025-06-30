import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import appointmentSlice from './appointmentSlice';
import customerSlice from './customerSlice';
import inventorySlice from './inventorySlice';
import salesSlice from './salesSlice';
import workstationSlice from './workstationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointments: appointmentSlice,
    customers: customerSlice,
    inventory: inventorySlice,
    sales: salesSlice,
    workstations: workstationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;