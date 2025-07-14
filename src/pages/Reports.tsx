import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Type definitions for analytics data
interface Forecast {
  month: string;
  predicted_revenue: number;
  confidence: number;
}

interface ForecastingData {
  historicalData: RevenueTrend[];
  growthRate: number;
  forecasts: Forecast[];
}

interface ServiceProfitabilityItem {
  service_name: string;
  price: number;
  duration_minutes: number;
  total_bookings: number;
  total_revenue: number;
  cancellations: number;
  revenue_per_hour: number;
  completion_rate: number;
}

interface PeakTimeAnalysis {
  hour: string;
  appointment_count: number;
  unique_customers: number;
  avg_service_price: number;
}

interface ProfitabilityData {
  serviceProfitability: ServiceProfitabilityItem[];
  peakTimeAnalysis: PeakTimeAnalysis[];
}

interface CLVCustomer {
  customer_name: string;
  total_visits: number;
  total_spent: number;
  avg_order_value: number;
  customer_age_days: number;
  first_visit: string;
  last_visit: string;
  visit_frequency_per_year: number;
  annual_value: number;
}

interface CLVSegment {
  segment: string;
  customer_count: number;
  avg_value: number;
}

interface CLVData {
  customerAnalysis: CLVCustomer[];
  segments: CLVSegment[];
}

interface RevenueTrend {
  date: string;
  revenue: number;
  transaction_count: number;
}

interface PaymentMethod {
  payment_method: string;
  count: number;
  total_amount: number;
}

interface ServicePerformance {
  service_name: string;
  price: number;
  bookings: number;
  total_revenue: number;
  avg_price: number;
}

interface StaffPerformance {
  staff_name: string;
  role: string;
  appointments_completed: number;
  completed_count: number;
  cancelled_count: number;
  total_revenue: number;
}

interface CustomerAnalytics {
  total_customers: number;
  new_customers_30d: number;
  new_customers_7d: number;
  total_appointments: number;
  avg_transaction_value: number;
}

interface PeakHour {
  hour: number;
  appointment_count: number;
}

interface MonthlyComparison {
  thisMonth: {
    revenue: number;
    transactions: number;
  };
  lastMonth: {
    revenue: number;
    transactions: number;
  };
  growth_percentage: number;
}

interface TopCustomer {
  customer_name: string;
  total_spent: number;
  visit_count: number;
  total_appointments: number;
  last_visit: string;
}

interface WorkstationAnalytic {
  workstation_name: string;
  utilization_rate: number;
  total_bookings: number;
  completed_bookings: number;
  revenue: number;
  revenue_generated: number;
  avg_revenue_per_booking: number;
}

interface AnalyticsData {
  revenueTrends: RevenueTrend[];
  paymentMethods: PaymentMethod[];
  servicePerformance: ServicePerformance[];
  staffPerformance: StaffPerformance[];
  customerAnalytics: CustomerAnalytics;
  peakHours: PeakHour[];
  monthlyComparison: MonthlyComparison;
  topCustomers: TopCustomer[];
  workstationAnalytics: WorkstationAnalytic[];
  period: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Reports: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [advancedAnalytics, setAdvancedAnalytics] = useState<{
    forecasting: ForecastingData | null;
    profitability: ProfitabilityData | null;
    clv: CLVData | null;
  }>({
    forecasting: null,
    profitability: null,
    clv: null
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: reportPeriod,
        ...(customDateRange.startDate && customDateRange.endDate && {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        })
      });
      
      const response = await fetch(`http://localhost:3000/api/reports/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [reportPeriod, customDateRange.startDate, customDateRange.endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      fetchAnalytics();
    }
  };

  const exportAnalyticsData = () => {
    if (!analytics) return;
    
    const exportData = {
      reportPeriod,
      dateRange: customDateRange.startDate && customDateRange.endDate 
        ? `${customDateRange.startDate} to ${customDateRange.endDate}`
        : `Last ${reportPeriod}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalRevenue: analytics.revenueTrends.reduce((sum, trend) => sum + trend.revenue, 0),
        totalTransactions: analytics.revenueTrends.reduce((sum, trend) => sum + trend.transaction_count, 0),
        totalCustomers: analytics.customerAnalytics.total_customers,
        newCustomers: analytics.customerAnalytics.new_customers_30d,
      },
      detailedData: analytics
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salon-analytics-${reportPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchAdvancedAnalytics = useCallback(async () => {
    try {
      const [forecastRes, profitabilityRes, clvRes] = await Promise.all([
        fetch('http://localhost:3000/api/reports/revenue-forecast'),
        fetch('http://localhost:3000/api/reports/service-profitability'),
        fetch('http://localhost:3000/api/reports/customer-lifetime-value')
      ]);
      
      const [forecastData, profitabilityData, clvData] = await Promise.all([
        forecastRes.json(),
        profitabilityRes.json(),
        clvRes.json()
      ]);
      
      if (forecastData.success && profitabilityData.success && clvData.success) {
        setAdvancedAnalytics({
          forecasting: forecastData,
          profitability: profitabilityData,
          clv: clvData
        });
      }
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    }
  }, []);

  useEffect(() => {
    if (tabValue === 4) { // Advanced Analytics tab
      fetchAdvancedAnalytics();
    }
  }, [tabValue, fetchAdvancedAnalytics]);

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        typeof row[header] === 'string' && row[header].includes(',') 
          ? `"${row[header]}"` 
          : row[header]
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateRevenueChartData = () => {
    if (!analytics?.revenueTrends) return { labels: [], datasets: [] };
    
    const last30Days = analytics.revenueTrends.slice(-30);
    
    return {
      labels: last30Days.map(item => dayjs(item.date).format('MMM DD')),
      datasets: [
        {
          label: 'Daily Revenue',
          data: last30Days.map(item => item.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'Transactions',
          data: last30Days.map(item => item.transaction_count),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const generatePaymentMethodsData = () => {
    if (!analytics?.paymentMethods) return { labels: [], datasets: [] };
    
    return {
      labels: analytics.paymentMethods.map(method => 
        method.payment_method.charAt(0).toUpperCase() + method.payment_method.slice(1)
      ),
      datasets: [
        {
          data: analytics.paymentMethods.map(method => method.total_amount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const generateServicePerformanceData = () => {
    if (!analytics?.servicePerformance) return { labels: [], datasets: [] };
    
    const topServices = analytics.servicePerformance.slice(0, 8);
    
    return {
      labels: topServices.map(service => service.service_name),
      datasets: [
        {
          label: 'Bookings',
          data: topServices.map(service => service.bookings),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Revenue',
          data: topServices.map(service => service.total_revenue),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const generatePeakHoursData = () => {
    if (!analytics?.peakHours) return { labels: [], datasets: [] };
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const hourlyData = hours.map(hour => {
      const hourData = analytics.peakHours.find(h => h.hour === hour);
      return hourData ? hourData.appointment_count : 0;
    });
    
    return {
      labels: hours.map(hour => `${hour}:00`),
      datasets: [
        {
          label: 'Appointments',
          data: hourlyData,
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Analytics...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchAnalytics}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Reports & Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>
          
          {reportPeriod === 'custom' && (
            <>
              <TextField
                type="date"
                label="Start Date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="End Date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" onClick={handleCustomDateSubmit}>
                Apply
              </Button>
            </>
          )}
          
          <IconButton 
            onClick={fetchAnalytics}
            disabled={loading}
            title="Refresh Analytics Data"
          >
            <RefreshIcon />
          </IconButton>
          
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={exportAnalyticsData}
            disabled={!analytics}
          >
            Export JSON
          </Button>
          <IconButton 
            onClick={() => fetchAnalytics()} 
            disabled={loading}
            title="Refresh Data"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      {analytics?.monthlyComparison && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <MoneyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      ${analytics.monthlyComparison.thisMonth.revenue.toFixed(2)}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Monthly Revenue
                    </Typography>
                    <Chip
                      label={`${calculateGrowthPercentage(
                        analytics.monthlyComparison.thisMonth.revenue,
                        analytics.monthlyComparison.lastMonth.revenue
                      )}%`}
                      color={analytics.monthlyComparison.thisMonth.revenue >= analytics.monthlyComparison.lastMonth.revenue ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {analytics.monthlyComparison.thisMonth.transactions}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Transactions
                    </Typography>
                    <Chip
                      label={`${calculateGrowthPercentage(
                        analytics.monthlyComparison.thisMonth.transactions,
                        analytics.monthlyComparison.lastMonth.transactions
                      )}%`}
                      color={analytics.monthlyComparison.thisMonth.transactions >= analytics.monthlyComparison.lastMonth.transactions ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {analytics.customerAnalytics.total_customers}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Total Customers
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      +{analytics.customerAnalytics.new_customers_30d} this month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      ${analytics.customerAnalytics.avg_transaction_value?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Avg Transaction
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics.customerAnalytics.total_appointments} appointments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs for different analytics views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<ShowChartIcon />} label="Revenue Trends" />
          <Tab icon={<BarChartIcon />} label="Services & Staff" />
          <Tab icon={<GroupIcon />} label="Customers" />
          <Tab icon={<AccessTimeIcon />} label="Operations" />
          <Tab icon={<AssessmentIcon />} label="Advanced Analytics" />
        </Tabs>
      </Paper>

      {/* Revenue Trends Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Trends (Last 30 Days)
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Line 
                    data={generateRevenueChartData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index' as const,
                        intersect: false,
                      },
                      scales: {
                        x: {
                          display: true,
                          title: {
                            display: true,
                            text: 'Date'
                          }
                        },
                        y: {
                          type: 'linear' as const,
                          display: true,
                          position: 'left' as const,
                          title: {
                            display: true,
                            text: 'Revenue ($)'
                          }
                        },
                        y1: {
                          type: 'linear' as const,
                          display: true,
                          position: 'right' as const,
                          grid: {
                            drawOnChartArea: false,
                          },
                          title: {
                            display: true,
                            text: 'Transactions'
                          }
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Methods
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Doughnut 
                    data={generatePaymentMethodsData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Services & Staff Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Performance
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar 
                    data={generateServicePerformanceData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Bookings'
                          }
                        },
                        y1: {
                          type: 'linear' as const,
                          display: true,
                          position: 'right' as const,
                          grid: {
                            drawOnChartArea: false,
                          },
                          title: {
                            display: true,
                            text: 'Revenue ($)'
                          }
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Staff Performance
                </Typography>
                <List>
                  {analytics?.staffPerformance.slice(0, 5).map((staff, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'grey.300',
                          color: 'text.primary'
                        }}>
                          #{index + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={staff.staff_name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              {staff.appointments_completed} appointments
                            </Typography>
                            <Typography variant="body2" color="success.main">
                              ${staff.total_revenue.toFixed(2)} revenue
                            </Typography>
                            <Typography variant="caption">
                              {staff.completed_count} completed | {staff.cancelled_count} cancelled
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Workstation Analytics
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Workstation</TableCell>
                        <TableCell align="right">Total Bookings</TableCell>
                        <TableCell align="right">Completed</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Avg Revenue/Booking</TableCell>
                        <TableCell align="right">Utilization</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics?.workstationAnalytics.map((workstation, index) => (
                        <TableRow key={index}>
                          <TableCell>{workstation.workstation_name}</TableCell>
                          <TableCell align="right">{workstation.total_bookings}</TableCell>
                          <TableCell align="right">{workstation.completed_bookings}</TableCell>
                          <TableCell align="right">${workstation.revenue_generated.toFixed(2)}</TableCell>
                          <TableCell align="right">${workstation.avg_revenue_per_booking || 0}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={workstation.total_bookings > 0 ? (workstation.completed_bookings / workstation.total_bookings) * 100 : 0}
                                sx={{ width: 60 }}
                              />
                              <Typography variant="body2">
                                {workstation.total_bookings > 0 ? 
                                  Math.round((workstation.completed_bookings / workstation.total_bookings) * 100) : 0}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Customers Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Customers by Spending
                </Typography>
                <List>
                  {analytics?.topCustomers.slice(0, 8).map((customer, index) => (
                    <ListItem key={index} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {customer.customer_name.split(' ').map((n: string) => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={customer.customer_name}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              ${customer.total_spent.toFixed(2)} spent | {customer.total_appointments} visits
                            </Typography>
                            <Typography variant="caption">
                              Last visit: {customer.last_visit ? dayjs(customer.last_visit).format('MMM DD, YYYY') : 'Never'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>New Customers</Typography>
                    <Typography variant="h4" color="primary">
                      {analytics?.customerAnalytics.new_customers_30d}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 30 days (+{analytics?.customerAnalytics.new_customers_7d} this week)
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Customer Metrics</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="h6">{analytics?.customerAnalytics.total_customers}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Customers</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6">{analytics?.customerAnalytics.total_appointments}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider />
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Average Transaction Value</Typography>
                    <Typography variant="h5" color="success.main">
                      ${analytics?.customerAnalytics.avg_transaction_value?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Operations Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Peak Hours Analysis
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Bar 
                    data={generatePeakHoursData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Appointments'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Hour of Day'
                          }
                        }
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Business Insights
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Busiest Hour</Typography>
                    <Typography variant="h5">
                      {analytics?.peakHours.reduce((max, hour) => 
                        hour.appointment_count > max.appointment_count ? hour : max, 
                        { hour: 0, appointment_count: 0 }
                      ).hour}:00
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total Services Performed</Typography>
                    <Typography variant="h5">
                      {analytics?.servicePerformance.reduce((sum, service) => sum + service.bookings, 0)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Most Popular Service</Typography>
                    <Typography variant="h6">
                      {analytics?.servicePerformance[0]?.service_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {analytics?.servicePerformance[0]?.bookings || 0} bookings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Advanced Analytics Tab */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          {/* Revenue Forecasting */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <TrendingUpIcon color="primary" />
                  <Typography variant="h6">Revenue Forecasting</Typography>
                  <Button 
                    size="small" 
                    onClick={() => advancedAnalytics.forecasting && exportToCSV(
                      advancedAnalytics.forecasting.forecasts as unknown as Record<string, unknown>[], 
                      'revenue-forecast'
                    )}
                    disabled={!advancedAnalytics.forecasting}
                  >
                    Export CSV
                  </Button>
                </Box>
                
                {advancedAnalytics.forecasting ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Based on historical data, projected growth rate: {advancedAnalytics.forecasting.growthRate.toFixed(2)}%
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      {advancedAnalytics.forecasting.forecasts.map((forecast: Forecast, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body2">{forecast.month}</Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="bold">
                              ${forecast.predicted_revenue.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(forecast.confidence * 100).toFixed(0)}% confidence
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Service Profitability */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6">Service Profitability</Typography>
                  <Button 
                    size="small" 
                    onClick={() => advancedAnalytics.profitability && exportToCSV(
                      advancedAnalytics.profitability.serviceProfitability as unknown as Record<string, unknown>[], 
                      'service-profitability'
                    )}
                    disabled={!advancedAnalytics.profitability}
                  >
                    Export CSV
                  </Button>
                </Box>
                
                {advancedAnalytics.profitability ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Service</TableCell>
                          <TableCell align="right">Revenue/Hour</TableCell>
                          <TableCell align="right">Completion Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {advancedAnalytics.profitability.serviceProfitability.slice(0, 5).map((service: ServiceProfitabilityItem, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{service.service_name}</TableCell>
                            <TableCell align="right">${service.revenue_per_hour}</TableCell>
                            <TableCell align="right">
                              <Chip 
                                label={`${service.completion_rate}%`}
                                color={service.completion_rate >= 90 ? 'success' : service.completion_rate >= 75 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Customer Lifetime Value */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">Customer Lifetime Value Analysis</Typography>
                  <Button 
                    size="small" 
                    onClick={() => advancedAnalytics.clv && exportToCSV(
                      advancedAnalytics.clv.customerAnalysis as unknown as Record<string, unknown>[], 
                      'customer-lifetime-value'
                    )}
                    disabled={!advancedAnalytics.clv}
                  >
                    Export CSV
                  </Button>
                </Box>
                
                {advancedAnalytics.clv ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Customer Segments</Typography>
                      {advancedAnalytics.clv.segments.map((segment: CLVSegment, index: number) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                          <Typography variant="body2">{segment.segment}</Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {segment.customer_count} customers
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Avg: ${segment.avg_value.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>Top Value Customers</Typography>
                      <List dense>
                        {advancedAnalytics.clv.customerAnalysis.slice(0, 5).map((customer: CLVCustomer, index: number) => (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar>{customer.customer_name.charAt(0)}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={customer.customer_name}
                              secondary={`$${customer.total_spent} total • ${customer.total_visits} visits • $${customer.annual_value.toFixed(2)}/year`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Reports;
