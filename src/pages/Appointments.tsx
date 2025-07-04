import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

interface Appointment {
  id: string;
  customer_id: string;
  customer_name: string;
  service_id: string;
  service_name: string;
  workstation_id: string;
  workstation_name: string;
  staff_id: string;
  staff_name: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  total_amount: number;
  notes?: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workstations, setWorkstations] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerId: '',
    serviceId: '',
    workstationId: '',
    staffId: '',
    date: dayjs(),
    time: dayjs(),
    duration: 60,
    status: 'pending' as 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
    totalAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
    fetchServices();
    fetchWorkstations();
    fetchStaff();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/appointments');
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to mock data if API fails
      setServices([
        { id: '1', name: 'Haircut & Style', price: 45, duration: 60 },
        { id: '2', name: 'Hair Color', price: 85, duration: 120 },
        { id: '3', name: 'Manicure', price: 25, duration: 45 },
      ]);
    }
  };

  const fetchWorkstations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/workstations');
      const data = await response.json();
      if (data.success) {
        setWorkstations(data.workstations);
      }
    } catch (error) {
      console.error('Error fetching workstations:', error);
      // Fallback to mock data if API fails
      setWorkstations([
        { id: '1', name: 'Station 1', type: 'Hair Styling' },
        { id: '2', name: 'Station 2', type: 'Hair Styling' },
        { id: '3', name: 'Nail Station 1', type: 'Nail Care' },
      ]);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      const data = await response.json();
      if (data.success) {
        setStaff(data.users.filter((user: any) => user.role === 'staff' || user.role === 'manager'));
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        customerId: appointment.customer_id,
        serviceId: appointment.service_id,
        workstationId: appointment.workstation_id,
        staffId: appointment.staff_id,
        date: dayjs(appointment.date),
        time: dayjs(`2000-01-01 ${appointment.time}`),
        duration: appointment.duration,
        status: appointment.status,
        totalAmount: appointment.total_amount,
        notes: appointment.notes || '',
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        customerId: '',
        serviceId: '',
        workstationId: '',
        staffId: '',
        date: dayjs(),
        time: dayjs(),
        duration: 60,
        status: 'pending' as 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled',
        totalAmount: 0,
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
  };

  const handleSaveAppointment = async () => {
    try {
      const appointmentData = {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        workstationId: formData.workstationId,
        staffId: formData.staffId,
        date: formData.date.format('YYYY-MM-DD'),
        time: formData.time.format('HH:mm'),
        duration: formData.duration,
        totalAmount: formData.totalAmount,
        status: formData.status, // Include status
        notes: formData.notes,
      };

      const url = editingAppointment 
        ? `http://localhost:3000/api/appointments/${editingAppointment.id}`
        : 'http://localhost:3000/api/appointments';
      
      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        fetchAppointments();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/checkin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        console.error('Error checking in appointment');
      }
    } catch (error) {
      console.error('Error checking in appointment:', error);
    }
  };

  const handleCheckOut = async (appointmentId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/checkout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        console.error('Error checking out appointment');
      }
    } catch (error) {
      console.error('Error checking out appointment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const todayAppointments = appointments.filter(apt => 
    apt.date === dayjs().format('YYYY-MM-DD')
  );

  if (loading) {
    return <Typography>Loading appointments...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Appointments Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Book Appointment
        </Button>
      </Box>

      {/* Today's Appointments Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {todayAppointments.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Today's Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {todayAppointments.filter(apt => apt.status === 'confirmed').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Confirmed Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {todayAppointments.filter(apt => apt.status === 'pending').length}
                  </Typography>
                  <Typography color="text.secondary">
                    Pending Today
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Appointments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Workstation</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {dayjs(appointment.date).format('MMM DD, YYYY')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {appointment.time}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{appointment.customer_name}</TableCell>
                <TableCell>{appointment.service_name}</TableCell>
                <TableCell>{appointment.staff_name}</TableCell>
                <TableCell>{appointment.workstation_name}</TableCell>
                <TableCell>{appointment.duration} min</TableCell>
                <TableCell>${appointment.total_amount}</TableCell>
                <TableCell>
                  <Chip
                    label={appointment.status}
                    color={getStatusColor(appointment.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(appointment)} size="small">
                    <EditIcon />
                  </IconButton>
                  {appointment.status === 'confirmed' && (
                    <IconButton 
                      onClick={() => handleCheckIn(appointment.id)} 
                      size="small" 
                      color="primary"
                      title="Check In Customer"
                    >
                      <CheckInIcon />
                    </IconButton>
                  )}
                  {appointment.status === 'in-progress' && (
                    <IconButton 
                      onClick={() => handleCheckOut(appointment.id)} 
                      size="small" 
                      color="success"
                      title="Check Out Customer"
                    >
                      <CheckOutIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Service</InputLabel>
                <Select
                  value={formData.serviceId}
                  onChange={(e) => {
                    const service = services.find(s => s.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      serviceId: e.target.value,
                      duration: service?.duration || 60,
                      totalAmount: service?.price || 0
                    });
                  }}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Staff</InputLabel>
                <Select
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                >
                  {staff.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Workstation</InputLabel>
                <Select
                  value={formData.workstationId}
                  onChange={(e) => setFormData({ ...formData, workstationId: e.target.value })}
                >
                  {workstations.map((workstation) => (
                    <MenuItem key={workstation.id} value={workstation.id}>
                      {workstation.name} ({workstation.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || dayjs() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Time"
                value={formData.time}
                onChange={(newValue) => setFormData({ ...formData, time: newValue || dayjs() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Total Amount"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                fullWidth
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAppointment} variant="contained">
            {editingAppointment ? 'Update' : 'Book'} Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;
