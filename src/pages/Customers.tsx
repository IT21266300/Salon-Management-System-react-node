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
  Chip,
  InputAdornment,
  TablePagination,
  Tooltip,
  Badge,
  useTheme,
  Fade,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Cake as CakeIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  PersonOutline as PersonOutlineIcon,
  Notes as NotesIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  gender: 'male' | 'female' | 'other';
  notes: string;
  total_visits: number;
  total_spent: number;
  created_at: string;
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
      id={`customers-tabpanel-${index}`}
      aria-labelledby={`customers-tab-${index}`}
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

const Customers: React.FC = () => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customers');
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        dateOfBirth: '',
        gender: customer.gender,
        notes: customer.notes,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSaveCustomer = async () => {
    try {
      const url = editingCustomer 
        ? `http://localhost:3000/api/customers/${editingCustomer.id}`
        : 'http://localhost:3000/api/customers';
      
      const method = editingCustomer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCustomers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/customers/${customerId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchCustomers();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  // Filter customers based on search and gender
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesGender = genderFilter === 'all' || customer.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  // Get customers by tab
  const getCustomersByTab = () => {
    switch (tabValue) {
      case 0: return filteredCustomers; // All customers
      case 1: return filteredCustomers.filter(c => c.total_visits >= 5); // Loyal customers (5+ visits)
      case 2: return filteredCustomers.filter(c => c.total_visits === 0); // New customers (no visits)
      case 3: return filteredCustomers.filter(c => c.total_spent > 200); // VIP customers ($200+ spent)
      default: return filteredCustomers;
    }
  };

  const currentCustomers = getCustomersByTab();
  const paginatedCustomers = currentCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Calculate stats
  const totalCustomers = customers.length;
  const customersWithEmail = customers.filter(c => c.email).length;
  const customersWithPhone = customers.filter(c => c.phone).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case 'male': return <MaleIcon sx={{ fontSize: 16, color: '#3498DB' }} />;
      case 'female': return <FemaleIcon sx={{ fontSize: 16, color: '#E91E63' }} />;
      default: return <PersonOutlineIcon sx={{ fontSize: 16, color: '#95A5A6' }} />;
    }
  };

  const getCustomerTier = (spent: number) => {
    if (spent >= 500) return { label: 'VIP', color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.1)' };
    if (spent >= 200) return { label: 'Gold', color: '#F39C12', bg: 'rgba(243, 156, 18, 0.1)' };
    if (spent >= 50) return { label: 'Silver', color: '#95A5A6', bg: 'rgba(149, 165, 166, 0.1)' };
    return { label: 'New', color: '#27AE60', bg: 'rgba(39, 174, 96, 0.1)' };
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Loading customers...</Typography>
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
                <PeopleIcon sx={{ fontSize: 28 }} />
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
                  Customer Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage customer relationships and track loyalty
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
              Add Customer
            </Button>
          </Box>
          
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              backgroundColor: 'rgba(52, 152, 219, 0.05)',
              border: '1px solid rgba(52, 152, 219, 0.2)',
            }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Automatic Updates</AlertTitle>
            Visit counts and spending are automatically updated when appointments are completed via check-out
          </Alert>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Customers"
            value={totalCustomers}
            icon={<PeopleIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="registered customers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="With Email"
            value={customersWithEmail}
            icon={<EmailIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="marketing reach"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="With Phone"
            value={customersWithPhone}
            icon={<PhoneIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="contact available"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon sx={{ fontSize: 28 }} />}
            color="#F39C12"
            subtitle="customer lifetime value"
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
              placeholder="Search customers..."
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
              <InputLabel>Gender Filter</InputLabel>
              <Select
                value={genderFilter}
                label="Gender Filter"
                onChange={(e) => setGenderFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="all">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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
          <Tab label={`All Customers (${customers.length})`} />
          <Tab label={`Loyal (${customers.filter(c => c.total_visits >= 5).length})`} />
          <Tab label={`New (${customers.filter(c => c.total_visits === 0).length})`} />
          <Tab label={`VIP (${customers.filter(c => c.total_spent > 200).length})`} />
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
                  <TableCell>Customer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Visits</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCustomers.map((customer) => {
                  const tier = getCustomerTier(customer.total_spent || 0);
                  return (
                    <TableRow 
                      key={customer.id}
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
                              width: 48,
                              height: 48,
                              background: `linear-gradient(135deg, ${tier.color} 0%, ${tier.color}CC 100%)`,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {customer.first_name} {customer.last_name}
                            </Typography>
                            {customer.address && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationIcon sx={{ fontSize: 12 }} />
                                {customer.address}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {customer.email && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              {customer.email}
                            </Typography>
                          )}
                          {customer.phone && (
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              {customer.phone}
                            </Typography>
                          )}
                          {!customer.email && !customer.phone && (
                            <Typography variant="caption" color="text.secondary">
                              No contact info
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getGenderIcon(customer.gender)}
                          <Typography variant="body2">
                            {customer.gender ? customer.gender.charAt(0).toUpperCase() + customer.gender.slice(1) : 'Not specified'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {customer.total_visits}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#27AE60' }}>
                          ${(customer.total_spent || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tier.label}
                          size="small"
                          sx={{
                            backgroundColor: tier.bg,
                            color: tier.color,
                            fontWeight: 600,
                            border: `1px solid ${tier.color}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(customer.created_at).format('MMM DD, YYYY')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Customer">
                            <IconButton 
                              onClick={() => handleOpenDialog(customer)} 
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
                          <Tooltip title="Delete Customer">
                            <IconButton 
                              onClick={() => handleDeleteCustomer(customer.id)} 
                              size="small"
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
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid rgba(139, 69, 19, 0.08)' }}>
            <TablePagination
              component="div"
              count={currentCustomers.length}
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

      {/* Add/Edit Customer Dialog */}
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
              {editingCustomer ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingCustomer ? 'Update customer information' : 'Create a new customer profile'}
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
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              <TextField
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            <Grid item xs={12}>
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                fullWidth
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonOutlineIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      Not specified
                    </Box>
                  </MenuItem>
                  <MenuItem value="male">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MaleIcon sx={{ fontSize: 20, color: '#3498DB' }} />
                      Male
                    </Box>
                  </MenuItem>
                  <MenuItem value="female">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <FemaleIcon sx={{ fontSize: 20, color: '#E91E63' }} />
                      Female
                    </Box>
                  </MenuItem>
                  <MenuItem value="other">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonOutlineIcon sx={{ fontSize: 20, color: '#95A5A6' }} />
                      Other
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth (Optional)"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CakeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            {/* Additional Notes */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Additional Notes
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                fullWidth
                placeholder="Add any special preferences, allergies, or important notes about this customer..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <NotesIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            {/* Customer Stats (Edit Mode Only) */}
            {editingCustomer && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Customer Statistics
                  </Typography>
                  <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)',
                      border: '1px solid rgba(39, 174, 96, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <EventIcon sx={{ fontSize: 32, color: '#27AE60', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#27AE60' }}>
                        {editingCustomer.total_visits}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Visits
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.05) 100%)',
                      border: '1px solid rgba(243, 156, 18, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <MoneyIcon sx={{ fontSize: 32, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F39C12' }}>
                        ${(editingCustomer.total_spent || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%)',
                      border: '1px solid rgba(139, 69, 19, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <StarIcon sx={{ fontSize: 32, color: '#8B4513', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B4513' }}>
                        {getCustomerTier(editingCustomer.total_spent || 0).label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer Tier
                      </Typography>
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
            onClick={handleSaveCustomer} 
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
            {editingCustomer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;