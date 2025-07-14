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
  Avatar,
  Divider,
  TablePagination,
  InputAdornment,
  Tooltip,
  Badge,
  useTheme,
  Fade,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  Build as WorkstationIcon,
  Star as StarIcon,
  Warning as WarningIcon,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: number;
}> = ({ title, value, icon, color, subtitle, trend }) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 69, 19, 0.08)',
        borderRadius: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.2,
                mb: subtitle ? 1 : 0
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
              border: `2px solid ${color}20`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Appointments: React.FC = () => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [workstations, setWorkstations] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

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
        status: formData.status,
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
      }
    } catch (error) {
      console.error('Error checking out appointment:', error);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return { color: '#27AE60', bg: 'rgba(39, 174, 96, 0.1)', label: 'Confirmed' };
      case 'pending': 
        return { color: '#F39C12', bg: 'rgba(243, 156, 18, 0.1)', label: 'Pending' };
      case 'in-progress': 
        return { color: '#3498DB', bg: 'rgba(52, 152, 219, 0.1)', label: 'In Progress' };
      case 'completed': 
        return { color: '#8B4513', bg: 'rgba(139, 69, 19, 0.1)', label: 'Completed' };
      case 'cancelled': 
        return { color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.1)', label: 'Cancelled' };
      default: 
        return { color: '#95A5A6', bg: 'rgba(149, 165, 166, 0.1)', label: status };
    }
  };

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.staff_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get appointments by tab
  const getAppointmentsByTab = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    
    switch (tabValue) {
      case 0: return filteredAppointments;
      case 1: return filteredAppointments.filter(apt => apt.date === today);
      case 2: return filteredAppointments.filter(apt => apt.date === tomorrow);
      case 3: return filteredAppointments.filter(apt => dayjs(apt.date).isAfter(dayjs(), 'day'));
      default: return filteredAppointments;
    }
  };

  const currentAppointments = getAppointmentsByTab();
  const paginatedAppointments = currentAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Calculate stats
  const todayAppointments = appointments.filter(apt => apt.date === dayjs().format('YYYY-MM-DD'));
  const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmed');
  const pendingToday = todayAppointments.filter(apt => apt.status === 'pending');
  const totalRevenue = todayAppointments.reduce((sum, apt) => sum + apt.total_amount, 0);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Loading appointments...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                  color: 'white',
                }}
              >
                <CalendarIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #2C3E50 0%, #8B4513 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2
                  }}
                >
                  Appointments
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage and track all salon appointments
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                px: 3,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Book Appointment
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Total"
            value={todayAppointments.length}
            icon={<EventIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="appointments scheduled"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Confirmed"
            value={confirmedToday.length}
            icon={<StarIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="ready to serve"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending"
            value={pendingToday.length}
            icon={<WarningIcon sx={{ fontSize: 28 }} />}
            color="#F39C12"
            subtitle="awaiting confirmation"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="potential earnings"
          />
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
          border: '1px solid rgba(139, 69, 19, 0.08)',
          borderRadius: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': {
                  borderColor: '#8B4513',
                  backgroundColor: 'rgba(139, 69, 19, 0.04)',
                }
              }}
            >
              Advanced Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
          border: '1px solid rgba(139, 69, 19, 0.08)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid rgba(139, 69, 19, 0.08)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#8B4513',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8B4513',
              height: 3,
            }
          }}
        >
          <Tab label={`All Appointments (${appointments.length})`} />
          <Tab label={`Today (${todayAppointments.length})`} />
          <Tab label={`Tomorrow (${appointments.filter(apt => apt.date === dayjs().add(1, 'day').format('YYYY-MM-DD')).length})`} />
          <Tab label={`Upcoming (${appointments.filter(apt => dayjs(apt.date).isAfter(dayjs(), 'day')).length})`} />
        </Tabs>

        {/* Table */}
        <TabPanel value={tabValue} index={tabValue}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: 'rgba(139, 69, 19, 0.03)',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      color: 'text.primary',
                      borderBottom: '2px solid rgba(139, 69, 19, 0.1)',
                    }
                  }}
                >
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Workstation</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAppointments.map((appointment, index) => {
                  const statusConfig = getStatusConfig(appointment.status);
                  return (
                    <TableRow 
                      key={appointment.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(139, 69, 19, 0.02)',
                        },
                        '& .MuiTableCell-root': {
                          borderBottom: '1px solid rgba(139, 69, 19, 0.06)',
                        }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: '#8B4513',
                              fontSize: '0.9rem'
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {dayjs(appointment.date).format('MMM DD, YYYY')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimeIcon sx={{ fontSize: 12 }} />
                              {appointment.time}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: statusConfig.color,
                              fontSize: '0.8rem'
                            }}
                          >
                            {appointment.customer_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {appointment.customer_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {appointment.service_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {appointment.staff_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WorkstationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {appointment.workstation_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${appointment.duration} min`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            color: '#8B4513',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#27AE60' }}>
                          ${appointment.total_amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 500,
                            border: `1px solid ${statusConfig.color}30`
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Appointment">
                            <IconButton 
                              onClick={() => handleOpenDialog(appointment)} 
                              size="small"
                              sx={{
                                color: '#8B4513',
                                '&:hover': {
                                  backgroundColor: 'rgba(139, 69, 19, 0.1)'
                                }
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          {appointment.status === 'confirmed' && (
                            <Tooltip title="Check In Customer">
                              <IconButton 
                                onClick={() => handleCheckIn(appointment.id)} 
                                size="small"
                                sx={{
                                  color: '#27AE60',
                                  '&:hover': {
                                    backgroundColor: 'rgba(39, 174, 96, 0.1)'
                                  }
                                }}
                              >
                                <CheckInIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {appointment.status === 'in-progress' && (
                            <Tooltip title="Check Out Customer">
                              <IconButton 
                                onClick={() => handleCheckOut(appointment.id)} 
                                size="small"
                                sx={{
                                  color: '#3498DB',
                                  '&:hover': {
                                    backgroundColor: 'rgba(52, 152, 219, 0.1)'
                                  }
                                }}
                              >
                                <CheckOutIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid rgba(139, 69, 19, 0.08)' }}>
            <TablePagination
              component="div"
              count={currentAppointments.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  backgroundColor: 'rgba(139, 69, 19, 0.02)',
                },
                '& .MuiTablePagination-selectIcon': {
                  color: '#8B4513',
                },
                '& .MuiIconButton-root': {
                  color: '#8B4513',
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                  }
                }
              }}
            />
          </Box>
        </TabPanel>
      </Paper>

      {/* Add/Edit Appointment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 69, 19, 0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid rgba(139, 69, 19, 0.08)',
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, rgba(212, 175, 55, 0.03) 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              }}
            >
              {editingAppointment ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingAppointment ? 'Edit Appointment' : 'Book New Appointment'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingAppointment ? 'Update appointment details' : 'Schedule a new salon appointment'}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                color: '#8B4513',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {!editingAppointment && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                backgroundColor: 'rgba(52, 152, 219, 0.05)',
                border: '1px solid rgba(52, 152, 219, 0.2)',
              }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>Booking a New Appointment</AlertTitle>
              Please fill in all required fields to schedule the appointment. The total amount will be calculated automatically based on the selected service.
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Customer Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer *</InputLabel>
                <Select
                  value={formData.customerId}
                  label="Customer *"
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#8B4513' }}>
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </Avatar>
                        {customer.first_name} {customer.last_name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Service Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Service *</InputLabel>
                <Select
                  value={formData.serviceId}
                  label="Service *"
                  onChange={(e) => {
                    const service = services.find(s => s.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      serviceId: e.target.value,
                      duration: service?.duration || 60,
                      totalAmount: service?.price || 0
                    });
                  }}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>{service.name}</Typography>
                        <Typography sx={{ color: '#27AE60', fontWeight: 600 }}>
                          ${service.price}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Staff Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Staff Member *</InputLabel>
                <Select
                  value={formData.staffId}
                  label="Staff Member *"
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {staff.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#27AE60' }}>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </Avatar>
                        {member.first_name} {member.last_name}
                        <Chip 
                          label={member.role} 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            bgcolor: 'rgba(139, 69, 19, 0.1)', 
                            color: '#8B4513',
                            fontSize: '0.7rem'
                          }} 
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Workstation Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Workstation *</InputLabel>
                <Select
                  value={formData.workstationId}
                  label="Workstation *"
                  onChange={(e) => setFormData({ ...formData, workstationId: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {workstations.map((workstation) => (
                    <MenuItem key={workstation.id} value={workstation.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WorkstationIcon sx={{ fontSize: 20, color: '#8B4513' }} />
                        {workstation.name}
                        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                          ({workstation.type})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Date Selection */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Appointment Date *"
                value={formData.date}
                onChange={(newValue) => setFormData({ ...formData, date: newValue || dayjs() })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }
                  } 
                }}
              />
            </Grid>

            {/* Time Selection */}
            <Grid item xs={12} md={6}>
              <TimePicker
                label="Appointment Time *"
                value={formData.time}
                onChange={(newValue) => setFormData({ ...formData, time: newValue || dayjs() })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }
                  } 
                }}
              />
            </Grid>

            {/* Duration */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Total Amount */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Total Amount"
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                fullWidth
                InputProps={{ 
                  startAdornment: <InputAdornment position="start">$</InputAdornment> 
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="pending">
                    <Chip 
                      label="Pending" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(243, 156, 18, 0.1)', color: '#F39C12' }} 
                    />
                  </MenuItem>
                  <MenuItem value="confirmed">
                    <Chip 
                      label="Confirmed" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' }} 
                    />
                  </MenuItem>
                  <MenuItem value="in-progress">
                    <Chip 
                      label="In Progress" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(52, 152, 219, 0.1)', color: '#3498DB' }} 
                    />
                  </MenuItem>
                  <MenuItem value="completed">
                    <Chip 
                      label="Completed" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' }} 
                    />
                  </MenuItem>
                  <MenuItem value="cancelled">
                    <Chip 
                      label="Cancelled" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C' }} 
                    />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label="Notes (Optional)"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                placeholder="Add any special instructions or notes for this appointment..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(139, 69, 19, 0.08)',
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, rgba(212, 175, 55, 0.02) 100%)',
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(139, 69, 19, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAppointment} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(139, 69, 19, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {editingAppointment ? 'Update Appointment' : 'Book Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Appointments;