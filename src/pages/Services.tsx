import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  FormHelperText,
  InputAdornment,
  TablePagination,
  Avatar,
  useTheme,
  Fade,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Build as ServiceIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config/api';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  status: 'active' | 'inactive';
  created_at: string;
  appointment_count?: number;
  total_revenue?: number;
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  status: 'active' | 'inactive';
}

interface ServiceStatistics {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  categoryStats: Array<{
    category: string;
    count: number;
    avg_price: number;
  }>;
  popularServices: Array<{
    name: string;
    price: number;
    category: string;
    booking_count: number;
  }>;
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
      id={`services-tabpanel-${index}`}
      aria-labelledby={`services-tab-${index}`}
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

const Services: React.FC = () => {
  const theme = useTheme();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<ServiceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: '',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const defaultCategories = [
    'Hair Styling',
    'Hair Coloring',
    'Hair Treatment',
    'Nail Care',
    'Facial Treatment',
    'Body Treatment',
    'Makeup',
    'Massage',
    'Spa Treatment',
    'Other'
  ];

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);
      
      // Mock data for demonstration since API_ENDPOINTS might not be available
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'Classic Haircut & Style',
          description: 'Professional haircut with styling',
          duration: 60,
          price: 45,
          category: 'Hair Styling',
          status: 'active',
          created_at: '2024-01-15',
          appointment_count: 120,
          total_revenue: 5400
        },
        {
          id: '2',
          name: 'Hair Color & Highlights',
          description: 'Full color service with highlights',
          duration: 180,
          price: 150,
          category: 'Hair Coloring',
          status: 'active',
          created_at: '2024-01-10',
          appointment_count: 85,
          total_revenue: 12750
        },
        {
          id: '3',
          name: 'Deep Conditioning Treatment',
          description: 'Intensive hair treatment for damaged hair',
          duration: 45,
          price: 35,
          category: 'Hair Treatment',
          status: 'active',
          created_at: '2024-01-08',
          appointment_count: 95,
          total_revenue: 3325
        },
        {
          id: '4',
          name: 'Classic Manicure',
          description: 'Professional nail care and polish',
          duration: 45,
          price: 25,
          category: 'Nail Care',
          status: 'active',
          created_at: '2024-01-05',
          appointment_count: 150,
          total_revenue: 3750
        },
        {
          id: '5',
          name: 'Facial Cleansing',
          description: 'Deep cleansing facial treatment',
          duration: 75,
          price: 65,
          category: 'Facial Treatment',
          status: 'inactive',
          created_at: '2024-01-01',
          appointment_count: 45,
          total_revenue: 2925
        }
      ];
      
      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching services',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategories(defaultCategories);
  };

  const fetchStatistics = async () => {
    // Mock statistics
    setStatistics({
      totalServices: 5,
      activeServices: 4,
      inactiveServices: 1,
      categoryStats: [
        { category: 'Hair Styling', count: 1, avg_price: 45 },
        { category: 'Hair Coloring', count: 1, avg_price: 150 },
        { category: 'Hair Treatment', count: 1, avg_price: 35 },
        { category: 'Nail Care', count: 1, avg_price: 25 },
        { category: 'Facial Treatment', count: 1, avg_price: 65 }
      ],
      popularServices: [
        { name: 'Classic Manicure', price: 25, category: 'Nail Care', booking_count: 150 },
        { name: 'Classic Haircut & Style', price: 45, category: 'Hair Styling', booking_count: 120 },
        { name: 'Deep Conditioning Treatment', price: 35, category: 'Hair Treatment', booking_count: 95 }
      ]
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Service name is required';
    }
    if (formData.duration < 1) {
      errors.duration = 'Duration must be at least 1 minute';
    }
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveService = async () => {
    if (!validateForm()) return;

    try {
      // Mock save operation
      const newService: Service = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
        appointment_count: 0,
        total_revenue: 0
      };

      if (editingService) {
        setServices(prev => prev.map(s => s.id === editingService.id ? { ...newService, id: editingService.id } : s));
      } else {
        setServices(prev => [...prev, newService]);
      }

      fetchStatistics();
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: `Service ${editingService ? 'updated' : 'created'} successfully`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving service:', error);
      setSnackbar({
        open: true,
        message: 'Error saving service',
        severity: 'error',
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      fetchStatistics();
      setSnackbar({
        open: true,
        message: 'Service deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting service',
        severity: 'error',
      });
    }
  };

  const handleViewService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setViewingService(service);
      setViewDialogOpen(true);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      category: service.category,
      status: service.status,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: '',
      status: 'active',
    });
    setFormErrors({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Hair Styling': '#8B4513',
      'Hair Coloring': '#E91E63',
      'Hair Treatment': '#27AE60',
      'Nail Care': '#9C27B0',
      'Facial Treatment': '#2196F3',
      'Body Treatment': '#FF9800',
      'Makeup': '#F44336',
      'Massage': '#4CAF50',
      'Spa Treatment': '#00BCD4',
      'Other': '#607D8B'
    };
    return colors[category as keyof typeof colors] || '#607D8B';
  };

  // Filter services based on search and tab
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get services by tab
  const getServicesByTab = () => {
    switch (tabValue) {
      case 0: return filteredServices; // All services
      case 1: return filteredServices.filter(s => s.status === 'active'); // Active services
      case 2: return filteredServices.filter(s => s.status === 'inactive'); // Inactive services
      case 3: return filteredServices.filter(s => (s.appointment_count || 0) >= 50); // Popular services (50+ bookings)
      default: return filteredServices;
    }
  };

  const currentServices = getServicesByTab();
  const paginatedServices = currentServices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
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
                <ServiceIcon sx={{ fontSize: 28 }} />
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
                  Service Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage salon services and pricing
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
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
              Add Service
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Services"
              value={statistics.totalServices}
              icon={<ServiceIcon sx={{ fontSize: 28 }} />}
              color="#8B4513"
              subtitle="available services"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Active Services"
              value={statistics.activeServices}
              icon={<ActiveIcon sx={{ fontSize: 28 }} />}
              color="#27AE60"
              subtitle="currently offered"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Categories"
              value={statistics.categoryStats.length}
              icon={<CategoryIcon sx={{ fontSize: 28 }} />}
              color="#3498DB"
              subtitle="service categories"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Avg. Price"
              value={formatCurrency(
                statistics.categoryStats.reduce((sum, cat) => sum + cat.avg_price, 0) /
                statistics.categoryStats.length || 0
              )}
              icon={<MoneyIcon sx={{ fontSize: 28 }} />}
              color="#F39C12"
              subtitle="average service price"
            />
          </Grid>
        </Grid>
      )}

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
              placeholder="Search services..."
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
              <InputLabel>Category Filter</InputLabel>
              <Select
                value={filters.category}
                label="Category Filter"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
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
          <Tab label={`All Services (${services.length})`} />
          <Tab label={`Active (${services.filter(s => s.status === 'active').length})`} />
          <Tab label={`Inactive (${services.filter(s => s.status === 'inactive').length})`} />
          <Tab label={`Popular (${services.filter(s => (s.appointment_count || 0) >= 50).length})`} />
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
                  <TableCell>Service</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bookings</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedServices.map((service) => (
                  <TableRow 
                    key={service.id}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: getCategoryColor(service.category),
                            fontSize: '0.9rem'
                          }}
                        >
                          <ServiceIcon sx={{ fontSize: 20 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {service.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {service.description || 'No description'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={service.category} 
                        size="small"
                        sx={{
                          backgroundColor: `${getCategoryColor(service.category)}15`,
                          color: getCategoryColor(service.category),
                          fontWeight: 500,
                          border: `1px solid ${getCategoryColor(service.category)}30`
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDuration(service.duration)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#27AE60' }}>
                        {formatCurrency(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={service.status}
                        size="small"
                        icon={service.status === 'active' ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          backgroundColor: service.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(149, 165, 166, 0.1)',
                          color: service.status === 'active' ? '#27AE60' : '#95A5A6',
                          fontWeight: 500,
                          border: `1px solid ${service.status === 'active' ? '#27AE60' : '#95A5A6'}30`
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {service.appointment_count || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#F39C12' }}>
                        {formatCurrency(service.total_revenue || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewService(service.id)}
                            sx={{
                              color: '#3498DB',
                              '&:hover': {
                                backgroundColor: 'rgba(52, 152, 219, 0.1)'
                              }
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Service">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditService(service)}
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
                        <Tooltip title="Delete Service">
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteService(service.id)}
                            sx={{
                              color: '#E74C3C',
                              '&:hover': {
                                backgroundColor: 'rgba(231, 76, 60, 0.1)'
                              }
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid rgba(139, 69, 19, 0.08)' }}>
            <TablePagination
              component="div"
              count={currentServices.length}
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

      {/* Add/Edit Service Dialog */}
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
              {editingService ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingService ? 'Update service information' : 'Create a new salon service'}
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
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                Service Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ServiceIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(category),
                          }}
                        />
                        {category}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Pricing and Duration */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Pricing & Duration
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: "0.01" }}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Description and Status */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Additional Details
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this service includes..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="active">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ActiveIcon sx={{ fontSize: 20, color: '#27AE60' }} />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <InactiveIcon sx={{ fontSize: 20, color: '#95A5A6' }} />
                      Inactive
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Service Preview */}
            {(formData.name || formData.category || formData.price > 0) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Service Preview
                  </Typography>
                  <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                </Grid>

                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                      border: '1px solid rgba(139, 69, 19, 0.1)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: formData.category ? getCategoryColor(formData.category) : '#8B4513',
                          }}
                        >
                          <ServiceIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formData.name || 'Service Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formData.category || 'Category'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27AE60' }}>
                            {formatCurrency(formData.price)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDuration(formData.duration)}
                          </Typography>
                        </Box>
                      </Box>
                      {formData.description && (
                        <Typography variant="body2" color="text.secondary">
                          {formData.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
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
            onClick={handleSaveService} 
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
            {editingService ? 'Update Service' : 'Create Service'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Service Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
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
                backgroundColor: viewingService ? getCategoryColor(viewingService.category) : '#8B4513',
              }}
            >
              <ViewIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Service Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View complete service information
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setViewDialogOpen(false)}
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
          {viewingService && (
            <Grid container spacing={3}>
              {/* Service Overview */}
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(139, 69, 19, 0.1)',
                    borderRadius: 2,
                    mb: 3,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          backgroundColor: getCategoryColor(viewingService.category),
                        }}
                      >
                        <ServiceIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                          {viewingService.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={viewingService.category}
                            sx={{
                              backgroundColor: `${getCategoryColor(viewingService.category)}15`,
                              color: getCategoryColor(viewingService.category),
                              fontWeight: 500,
                            }}
                          />
                          <Chip
                            label={viewingService.status}
                            icon={viewingService.status === 'active' ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              backgroundColor: viewingService.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(149, 165, 166, 0.1)',
                              color: viewingService.status === 'active' ? '#27AE60' : '#95A5A6',
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#27AE60' }}>
                          {formatCurrency(viewingService.price)}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {formatDuration(viewingService.duration)}
                        </Typography>
                      </Box>
                    </Box>
                    {viewingService.description && (
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        {viewingService.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Service Statistics */}
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#3498DB', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498DB' }}>
                      {viewingService.appointment_count || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 40, color: '#F39C12', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#F39C12' }}>
                      {formatCurrency(viewingService.total_revenue || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <StarIcon sx={{ fontSize: 40, color: '#8B4513', mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
                      {viewingService.appointment_count && viewingService.appointment_count > 0 ? 
                        ((viewingService.total_revenue || 0) / viewingService.appointment_count).toFixed(0) : '0'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. per Booking
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Service Details */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                  Service Information
                </Typography>
                <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Created Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(viewingService.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(139, 69, 19, 0.08)',
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, rgba(212, 175, 55, 0.02) 100%)',
          }}
        >
          <Button 
            onClick={() => setViewDialogOpen(false)}
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
            Close
          </Button>
          {viewingService && (
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                handleEditService(viewingService);
              }}
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
              Edit Service
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Services;