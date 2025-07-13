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
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
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

interface DashboardStats {
  dailyTotal: number;
  monthlyTotal: number;
  totalCustomers: number;
  todayAppointments: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    dailyTotal: 0,
    monthlyTotal: 0,
    totalCustomers: 0,
    todayAppointments: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:3000/api/reports/dashboard-stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch appointments for today
      const appointmentsResponse = await fetch('http://localhost:3000/api/appointments');
      const appointmentsData = await appointmentsResponse.json();
      if (appointmentsData.success) {
        const today = dayjs().format('YYYY-MM-DD');
        const todayAppointments = appointmentsData.appointments.filter((apt: Appointment) => 
          apt.date === today
        );
        setAppointments(todayAppointments);
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

  const statsCards = [
    {
      title: 'Daily Sales',
      value: `$${stats.dailyTotal.toFixed(2)}`,
      icon: <MoneyIcon />,
      color: 'primary.main',
      bgColor: 'primary.light',
    },
    {
      title: 'Monthly Sales',
      value: `$${stats.monthlyTotal.toFixed(2)}`,
      icon: <TrendingUpIcon />,
      color: 'success.main',
      bgColor: 'success.light',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: <PeopleIcon />,
      color: 'info.main',
      bgColor: 'info.light',
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
    return <Typography>Loading dashboard...</Typography>;
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
            <Card sx={{ height: '100%' }}>
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

      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} md={6}>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon />
              Today's Appointments
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
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No appointments scheduled for today
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon />
              Low Stock Alerts
            </Typography>
            {lowStockProducts.length > 0 ? (
              <List>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.light' }}>
                        <InventoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={product.name}
                      secondary={`Stock: ${product.quantity_in_stock} | Reorder Level: ${product.reorder_level}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                All products are well stocked
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
