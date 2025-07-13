import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarTodayIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

interface Appointment {
  id: string;
  date: string;
  time: string;
  customer_name: string;
  service_name: string;
  workstation_name?: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  quantity_in_stock: number;
  reorder_level: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  email?: string;
  phone?: string;
}

interface DashboardStats {
  dailyTotal: number;
  monthlyTotal: number;
  weeklyTotal: number;
  totalCustomers: number;
  todayAppointments: number;
  staffPerformance: StaffPerformance[];
  popularServices: PopularService[];
  recentCustomers: Customer[];
  workstationStats: WorkstationStat[];
}

interface StaffPerformance {
  staff_name: string;
  completed_appointments: number;
  total_revenue: number;
}

interface PopularService {
  name: string;
  price: number;
  booking_count: number;
}

interface WorkstationStat {
  workstation_name: string;
  usage_count: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    dailyTotal: 0,
    monthlyTotal: 0,
    weeklyTotal: 0,
    totalCustomers: 0,
    todayAppointments: 0,
    staffPerformance: [],
    popularServices: [],
    recentCustomers: [],
    workstationStats: [],
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch enhanced dashboard stats
      const statsResponse = await fetch('http://localhost:3000/api/reports/enhanced-stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setRecentCustomers(statsData.stats.recentCustomers);
        setPopularServices(statsData.stats.popularServices);
      }

      // Fetch appointments for today and upcoming
      const appointmentsResponse = await fetch('http://localhost:3000/api/appointments');
      const appointmentsData = await appointmentsResponse.json();
      if (appointmentsData.success) {
        const today = dayjs().format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
        
        const todayAppointments = appointmentsData.appointments.filter((apt: Appointment) => 
          apt.date === today
        );
        
        const upcomingAppts = appointmentsData.appointments.filter((apt: Appointment) => 
          apt.date === tomorrow
        ).slice(0, 3);
        
        setAppointments(todayAppointments);
        setUpcomingAppointments(upcomingAppts);
      }

      // Fetch products for low stock alerts
      const productsResponse = await fetch('http://localhost:3000/api/inventory');
      const productsData = await productsResponse.json();
      if (productsData.success) {
        const lowStock = productsData.products.filter((product: Product) => 
          product.quantity_in_stock <= product.reorder_level
        );
        setLowStockProducts(lowStock);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'New Appointment',
      icon: <CalendarTodayIcon />,
      color: 'primary',
      action: () => window.location.href = '/appointments'
    },
    {
      title: 'Add Customer',
      icon: <PersonAddIcon />,
      color: 'success',
      action: () => window.location.href = '/customers'
    },
    {
      title: 'Process Sale',
      icon: <ReceiptIcon />,
      color: 'warning',
      action: () => window.location.href = '/sales'
    },
    {
      title: 'Manage Inventory',
      icon: <BuildIcon />,
      color: 'error',
      action: () => window.location.href = '/inventory'
    }
  ];

  const statsCards = [
    {
      title: 'Daily Sales',
      value: `$${stats.dailyTotal.toFixed(2)}`,
      icon: <MoneyIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Weekly Sales',
      value: `$${stats.weeklyTotal.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      color: 'info.main',
      bgColor: 'info.light',
    },
    {
      title: 'Monthly Sales',
      value: `$${stats.monthlyTotal.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: <EventIcon />,
      color: 'warning.main',
      bgColor: 'warning.light',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, mb: 4 }}>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon />
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={action.action}
                sx={{ 
                  py: 2,
                  borderColor: `${action.color}.main`,
                  color: `${action.color}.main`,
                  '&:hover': {
                    backgroundColor: `${action.color}.light`,
                    borderColor: `${action.color}.main`,
                  }
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon />
              Today's Appointments ({appointments.length})
            </Typography>
            {appointments.length > 0 ? (
              <List>
                {appointments.slice(0, 5).map((appointment) => (
                  <ListItem key={appointment.id} divider>
                    <ListItemText
                      primary={`${appointment.customer_name} - ${appointment.service_name}`}
                      secondary={`${appointment.time} | ${appointment.workstation_name || 'No workstation'}`}
                    />
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={
                        appointment.status === 'confirmed' ? 'success' :
                        appointment.status === 'pending' ? 'warning' :
                        appointment.status === 'completed' ? 'primary' : 'default'
                      }
                    />
                  </ListItem>
                ))}
                {appointments.length > 5 && (
                  <ListItem>
                    <ListItemText 
                      primary={`... and ${appointments.length - 5} more appointments`}
                      sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                    />
                  </ListItem>
                )}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No appointments scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Staff Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon />
              Top Staff Performance (This Month)
            </Typography>
            {stats.staffPerformance.length > 0 ? (
              <List>
                {stats.staffPerformance.map((staff, index) => (
                  <ListItem key={`${staff.staff_name}-${index}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: index === 0 ? 'success.main' : index === 1 ? 'primary.main' : 'info.main',
                        color: 'white'
                      }}>
                        #{index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={staff.staff_name}
                      secondary={`${staff.completed_appointments} appointments | $${staff.total_revenue.toFixed(2)} revenue`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No staff performance data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Popular Services */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StarIcon />
              Popular Services
            </Typography>
            {popularServices.length > 0 ? (
              <List>
                {popularServices.map((service, index) => (
                  <ListItem key={`${service.name}-${index}`}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'grey.300',
                        color: 'text.primary'
                      }}>
                        #{index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={service.name}
                      secondary={`${service.booking_count || 0} bookings | $${service.price}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No service data available
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Tomorrow's Appointments & Recent Customers */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} sx={{ height: '400px' }}>
            {/* Tomorrow's Appointments */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '180px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                  <ScheduleIcon />
                  Tomorrow's Appointments ({upcomingAppointments.length})
                </Typography>
                {upcomingAppointments.length > 0 ? (
                  <List dense>
                    {upcomingAppointments.map((appointment) => (
                      <ListItem key={appointment.id} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={`${appointment.customer_name} - ${appointment.service_name}`}
                          secondary={`${appointment.time}`}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                    No appointments for tomorrow
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Recent Customers */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '200px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                  <PeopleIcon />
                  Recent Customers ({stats.recentCustomers.length})
                </Typography>
                {stats.recentCustomers.length > 0 ? (
                  <List dense>
                    {stats.recentCustomers.slice(0, 3).map((customer, index) => (
                      <ListItem key={`${customer.first_name}-${customer.last_name}-${index}`} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
                            {customer.first_name[0]}{customer.last_name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${customer.first_name} ${customer.last_name}`}
                          secondary={`Added: ${dayjs(customer.created_at).format('MMM DD')}`}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                    No recent customers
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Low Stock & Workstation Stats */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} sx={{ height: '400px' }}>
            {/* Low Stock Alerts */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '180px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                  <WarningIcon />
                  Low Stock Alerts ({lowStockProducts.length})
                </Typography>
                {lowStockProducts.length > 0 ? (
                  <List dense>
                    {lowStockProducts.slice(0, 3).map((product) => (
                      <ListItem key={product.id} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light', width: 32, height: 32 }}>
                            <InventoryIcon sx={{ fontSize: '1rem' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`Stock: ${product.quantity_in_stock} | Reorder: ${product.reorder_level}`}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                    All products are well stocked
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Workstation Utilization */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '200px', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem' }}>
                  <BuildIcon />
                  Workstation Usage (This Month)
                </Typography>
                {stats.workstationStats.length > 0 ? (
                  <List dense>
                    {stats.workstationStats.slice(0, 3).map((workstation, index) => (
                      <ListItem key={`${workstation.workstation_name}-${index}`} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
                            <BuildIcon sx={{ fontSize: '1rem' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={workstation.workstation_name}
                          secondary={`${workstation.usage_count} appointments`}
                          primaryTypographyProps={{ fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: '0.9rem' }}>
                    No workstation data available
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
