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
  useTheme,
  Fade,
  Skeleton,
  Divider,
  IconButton,
  Badge,
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
  Spa as SpaIcon,
  Dashboard as DashboardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowForward as ArrowForwardIcon,
  Circle as CircleIcon,
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

// Enhanced Card Component
const StatsCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  delay?: number;
}> = ({ title, value, icon, color, trend, delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <Fade in timeout={600 + delay}>
      <Card
        sx={{
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 69, 19, 0.08)',
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            '& .stat-icon': {
              transform: 'scale(1.1) rotate(5deg)',
            }
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
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
                  mb: 1
                }}
              >
                {value}
              </Typography>
              {trend !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ArrowUpwardIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: trend >= 0 ? 'success.main' : 'error.main',
                      transform: trend >= 0 ? 'none' : 'rotate(180deg)'
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: trend >= 0 ? 'success.main' : 'error.main',
                      fontWeight: 600
                    }}
                  >
                    {Math.abs(trend)}% vs last period
                  </Typography>
                </Box>
              )}
            </Box>
            <Box
              className="stat-icon"
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
                transition: 'all 0.3s ease',
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// Enhanced Section Card
const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  height?: string;
  headerAction?: React.ReactNode;
}> = ({ title, icon, children, height = '400px', headerAction }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 69, 19, 0.08)',
        borderRadius: 3,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(139, 69, 19, 0.06)',
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, rgba(212, 175, 55, 0.03) 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.2) 100%)',
                color: '#8B4513',
              }}
            >
              {icon}
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              {title}
            </Typography>
          </Box>
          {headerAction}
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {children}
      </Box>
    </Paper>
  );
};

// Quick Action Button
const QuickActionButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  delay?: number;
}> = ({ title, icon, color, action, delay = 0 }) => {
  return (
    <Fade in timeout={400 + delay}>
      <Button
        variant="outlined"
        fullWidth
        startIcon={icon}
        onClick={action}
        sx={{
          py: 2,
          px: 3,
          borderRadius: 2,
          borderWidth: 2,
          borderColor: `${color}`,
          color: `${color}`,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,246,240,0.8) 100%)',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderWidth: 2,
            borderColor: `${color}`,
            background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${color}40`,
          }
        }}
      >
        {title}
      </Button>
    </Fade>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
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
      color: '#8B4513',
      action: () => window.location.href = '/appointments'
    },
    {
      title: 'Add Customer',
      icon: <PersonAddIcon />,
      color: '#27AE60',
      action: () => window.location.href = '/customers'
    },
    {
      title: 'Process Sale',
      icon: <ReceiptIcon />,
      color: '#F39C12',
      action: () => window.location.href = '/sales'
    },
    {
      title: 'Manage Inventory',
      icon: <BuildIcon />,
      color: '#E74C3C',
      action: () => window.location.href = '/inventory'
    }
  ];

  const statsCards = [
    {
      title: 'Daily Sales',
      value: `$${stats.dailyTotal.toFixed(2)}`,
      icon: <MoneyIcon sx={{ fontSize: 28 }} />,
      color: '#8B4513',
      trend: 12.5,
    },
    {
      title: 'Weekly Sales',
      value: `$${stats.weeklyTotal.toFixed(2)}`,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: '#3498DB',
      trend: 8.2,
    },
    {
      title: 'Monthly Sales',
      value: `$${stats.monthlyTotal.toFixed(2)}`,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: '#27AE60',
      trend: 15.7,
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments.toString(),
      icon: <EventIcon sx={{ fontSize: 28 }} />,
      color: '#F39C12',
      trend: -2.1,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'completed': return '#8B4513';
      case 'cancelled': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="30%" height={48} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </Box>
        
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Fade in timeout={300}>
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
              <DashboardIcon sx={{ fontSize: 28 }} />
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
                Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                {dayjs().format('dddd, MMMM D, YYYY')}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...card} delay={index * 100} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Fade in timeout={600}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
            border: '1px solid rgba(139, 69, 19, 0.08)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <StarIcon sx={{ color: '#D4AF37', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Quick Actions
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <QuickActionButton {...action} delay={index * 100} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Fade>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title={`Today's Appointments`}
            icon={<EventIcon />}
            headerAction={
              <Badge badgeContent={appointments.length} color="primary">
                <EventIcon />
              </Badge>
            }
          >
            {appointments.length > 0 ? (
              <List sx={{ py: 0 }}>
                {appointments.slice(0, 6).map((appointment, index) => (
                  <ListItem
                    key={appointment.id}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid rgba(139, 69, 19, 0.08)',
                      background: 'rgba(255, 255, 255, 0.6)',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 69, 19, 0.03)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: getStatusColor(appointment.status),
                          width: 40,
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        {appointment.customer_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${appointment.customer_name}`}
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {appointment.service_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.time} • {appointment.workstation_name || 'No workstation'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Chip
                      label={appointment.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(appointment.status),
                        color: 'white',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <EventIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary" variant="h6">
                  No appointments today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Enjoy the quiet day or schedule some appointments!
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Staff Performance */}
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Top Staff Performance"
            icon={<PeopleIcon />}
            headerAction={
              <Chip label="This Month" size="small" sx={{ bgcolor: 'primary.light', color: 'white' }} />
            }
          >
            {stats.staffPerformance.length > 0 ? (
              <List sx={{ py: 0 }}>
                {stats.staffPerformance.map((staff, index) => (
                  <ListItem
                    key={`${staff.staff_name}-${index}`}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      border: '1px solid rgba(139, 69, 19, 0.08)',
                      background: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: index === 0 ? '#D4AF37' : index === 1 ? '#C0C0C0' : '#CD7F32',
                          color: 'white',
                          fontWeight: 700,
                          width: 40,
                          height: 40,
                        }}
                      >
                        #{index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {staff.staff_name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {staff.completed_appointments} appointments
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#27AE60', fontWeight: 600 }}>
                            ${staff.total_revenue.toFixed(2)} revenue
                          </Typography>
                        </Box>
                      }
                    />
                    {index === 0 && <StarIcon sx={{ color: '#D4AF37' }} />}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary" variant="h6">
                  No performance data
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Popular Services & Tomorrow's Appointments */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={3} sx={{ height: '400px' }}>
            <Grid item xs={12}>
              <SectionCard
                title="Popular Services"
                icon={<StarIcon />}
                height="190px"
              >
                {popularServices.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {popularServices.slice(0, 3).map((service, index) => (
                      <ListItem key={`${service.name}-${index}`} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: index === 0 ? '#D4AF37' : index === 1 ? '#C0C0C0' : '#CD7F32',
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            #{index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={service.name}
                          secondary={`${service.booking_count || 0} bookings • $${service.price}`}
                          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No service data available
                  </Typography>
                )}
              </SectionCard>
            </Grid>
            
            <Grid item xs={12}>
              <SectionCard
                title="Tomorrow's Schedule"
                icon={<ScheduleIcon />}
                height="190px"
                headerAction={
                  <Badge badgeContent={upcomingAppointments.length} color="secondary">
                    <ScheduleIcon />
                  </Badge>
                }
              >
                {upcomingAppointments.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {upcomingAppointments.map((appointment) => (
                      <ListItem key={appointment.id} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#8B4513', width: 32, height: 32, fontSize: '0.8rem' }}>
                            {appointment.customer_name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${appointment.customer_name}`}
                          secondary={`${appointment.service_name} • ${appointment.time}`}
                          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No appointments tomorrow
                  </Typography>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Alerts & Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={3} sx={{ height: '400px' }}>
            <Grid item xs={12}>
              <SectionCard
                title="Stock Alerts"
                icon={<WarningIcon />}
                height="190px"
                headerAction={
                  lowStockProducts.length > 0 ? (
                    <Badge badgeContent={lowStockProducts.length} color="error">
                      <WarningIcon />
                    </Badge>
                  ) : null
                }
              >
                {lowStockProducts.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {lowStockProducts.slice(0, 3).map((product) => (
                      <ListItem key={product.id} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#E74C3C', width: 32, height: 32 }}>
                            <InventoryIcon sx={{ fontSize: '1rem' }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={product.name}
                          secondary={`Stock: ${product.quantity_in_stock} | Reorder: ${product.reorder_level}`}
                          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <InventoryIcon sx={{ fontSize: 32, color: '#27AE60', mb: 1 }} />
                    <Typography color="text.secondary" variant="body2">
                      All products well stocked
                    </Typography>
                  </Box>
                )}
              </SectionCard>
            </Grid>
            
            <Grid item xs={12}>
              <SectionCard
                title="Recent Customers"
                icon={<PeopleIcon />}
                height="190px"
              >
                {stats.recentCustomers.length > 0 ? (
                  <List dense sx={{ py: 0 }}>
                    {stats.recentCustomers.slice(0, 3).map((customer, index) => (
                      <ListItem key={`${customer.first_name}-${customer.last_name}-${index}`} sx={{ py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#8B4513', width: 32, height: 32, fontSize: '0.8rem' }}>
                            {customer.first_name[0]}{customer.last_name[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${customer.first_name} ${customer.last_name}`}
                          secondary={`Added: ${dayjs(customer.created_at).format('MMM DD')}`}
                          primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No recent customers
                  </Typography>
                )}
              </SectionCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;