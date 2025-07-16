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
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  TablePagination,
  Tooltip,
  useTheme,
  Fade,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  ContactMail as ContactMailIcon,
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../config/api';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
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
      id={`suppliers-tabpanel-${index}`}
      aria-labelledby={`suppliers-tab-${index}`}
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

const Suppliers: React.FC = () => {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      // Mock data since API_ENDPOINTS might not be available
      const mockSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'Beauty Supply Co.',
          contact_person: 'Sarah Johnson',
          email: 'sarah@beautysupply.com',
          phone: '(555) 123-4567',
          address: '123 Beauty Ave, Salon City, SC 12345',
          status: 'active',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Professional Hair Products',
          contact_person: 'Michael Chen',
          email: 'michael@hairpro.com',
          phone: '(555) 234-5678',
          address: '456 Hair Street, Product Town, PT 67890',
          status: 'active',
          created_at: '2024-01-10'
        },
        {
          id: '3',
          name: 'Nail Art Supplies',
          contact_person: 'Emily Rodriguez',
          email: 'emily@nailart.com',
          phone: '(555) 345-6789',
          address: '789 Nail Boulevard, Art City, AC 54321',
          status: 'active',
          created_at: '2024-01-08'
        },
        {
          id: '4',
          name: 'Spa Equipment Ltd.',
          contact_person: 'David Brown',
          email: 'david@spaequipment.com',
          phone: '(555) 456-7890',
          address: '321 Spa Lane, Equipment City, EC 98765',
          status: 'inactive',
          created_at: '2024-01-05'
        },
        {
          id: '5',
          name: 'Organic Skincare Solutions',
          contact_person: 'Lisa Wilson',
          email: 'lisa@organicskincare.com',
          phone: '(555) 567-8901',
          address: '654 Organic Drive, Natural Town, NT 13579',
          status: 'active',
          created_at: '2024-01-01'
        }
      ];
      
      setSuppliers(mockSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSupplier(null);
  };

  const handleSaveSupplier = async () => {
    try {
      // Mock save operation
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        name: formData.name,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      if (editingSupplier) {
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...newSupplier, id: editingSupplier.id } : s));
      } else {
        setSuppliers(prev => [...prev, newSupplier]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving supplier:', error);
    }
  };

  const handleDeleteSupplier = (supplierId: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    }
  };

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get suppliers by tab
  const getSuppliersByTab = () => {
    switch (tabValue) {
      case 0: return filteredSuppliers; // All suppliers
      case 1: return filteredSuppliers.filter(s => s.status === 'active'); // Active suppliers
      case 2: return filteredSuppliers.filter(s => s.status === 'inactive'); // Inactive suppliers
      case 3: return filteredSuppliers.filter(s => s.email && s.phone); // Complete contact info
      default: return filteredSuppliers;
    }
  };

  const currentSuppliers = getSuppliersByTab();
  const paginatedSuppliers = currentSuppliers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive').length;
  const suppliersWithEmail = suppliers.filter(s => s.email).length;

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Loading suppliers...</Typography>
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
                <BusinessIcon sx={{ fontSize: 28 }} />
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
                  Supplier Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage suppliers and vendor relationships
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
              Add Supplier
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
            <AlertTitle sx={{ fontWeight: 600 }}>Supplier Management</AlertTitle>
            Maintain relationships with your suppliers for inventory and equipment needs
          </Alert>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Suppliers"
            value={totalSuppliers}
            icon={<GroupIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="registered suppliers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Suppliers"
            value={activeSuppliers}
            icon={<ActiveIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="currently active"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Inactive Suppliers"
            value={inactiveSuppliers}
            icon={<InactiveIcon sx={{ fontSize: 28 }} />}
            color="#E74C3C"
            subtitle="currently inactive"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="With Email"
            value={suppliersWithEmail}
            icon={<ContactMailIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="contact available"
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
              placeholder="Search suppliers..."
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
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
          <Tab label={`All Suppliers (${suppliers.length})`} />
          <Tab label={`Active (${activeSuppliers})`} />
          <Tab label={`Inactive (${inactiveSuppliers})`} />
          <Tab label={`Complete Info (${suppliers.filter(s => s.email && s.phone).length})`} />
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
                  <TableCell>Supplier</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSuppliers.map((supplier) => (
                  <TableRow 
                    key={supplier.id}
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
                            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          {supplier.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {supplier.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Added: {new Date(supplier.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {supplier.contact_person || 'Not specified'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {supplier.email || 'Not provided'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {supplier.phone || 'Not provided'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {supplier.address || 'Not provided'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={supplier.status}
                        icon={supplier.status === 'active' ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          backgroundColor: supplier.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                          color: supplier.status === 'active' ? '#27AE60' : '#E74C3C',
                          fontWeight: 500,
                          border: `1px solid ${supplier.status === 'active' ? '#27AE60' : '#E74C3C'}30`,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit Supplier">
                          <IconButton 
                            onClick={() => handleOpenDialog(supplier)} 
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
                        <Tooltip title="Delete Supplier">
                          <IconButton 
                            onClick={() => handleDeleteSupplier(supplier.id)} 
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: '1px solid rgba(139, 69, 19, 0.08)' }}>
            <TablePagination
              component="div"
              count={currentSuppliers.length}
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

      {/* Add/Edit Supplier Dialog */}
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
              {editingSupplier ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingSupplier ? 'Update supplier information' : 'Create a new supplier profile'}
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
                label="Supplier Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                fullWidth
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
                rows={3}
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

            {/* Supplier Preview */}
            {(formData.name || formData.contactPerson) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Supplier Preview
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
                            width: 56,
                            height: 56,
                            background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                          }}
                        >
                          {(formData.name || 'S').charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {formData.name || 'Supplier Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Contact: {formData.contactPerson || 'Not specified'}
                          </Typography>
                        </Box>
                        <Chip
                          label="Active"
                          icon={<ActiveIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            backgroundColor: 'rgba(39, 174, 96, 0.1)',
                            color: '#27AE60',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formData.email || 'No email provided'}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {formData.phone || 'No phone provided'}
                            </Typography>
                          </Box>
                        </Grid>
                        {formData.address && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formData.address}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Supplier Statistics (Edit Mode Only) */}
            {editingSupplier && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Supplier Statistics
                  </Typography>
                  <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)',
                      border: '1px solid rgba(52, 152, 219, 0.2)',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 32, color: '#3498DB', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498DB' }}>
                        {Math.floor(Math.random() * 50) + 10}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Orders Placed
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
                      <InventoryIcon sx={{ fontSize: 32, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F39C12' }}>
                        {Math.floor(Math.random() * 200) + 50}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Products Supplied
                      </Typography>
                    </CardContent>
                  </Card>
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
                      <BusinessIcon sx={{ fontSize: 32, color: '#27AE60', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#27AE60' }}>
                        {Math.floor(Math.random() * 12) + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Months Partnership
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
            onClick={handleSaveSupplier} 
            variant="contained"
            disabled={!formData.name.trim()}
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
            {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Suppliers;