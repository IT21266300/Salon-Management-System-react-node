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
  Alert,
  AlertTitle,
  InputAdornment,
  TablePagination,
  Tooltip,
  useTheme,
  Fade,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  Badge,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  supplier_id: string;
  supplier_name: string;
  purchase_price: number;
  selling_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  status: 'active' | 'inactive';
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
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
  progress?: number;
}> = ({ title, value, icon, color, subtitle, trend, progress }) => {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
        {progress !== undefined && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Stock Level
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: `${color}20`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 3,
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Inventory: React.FC = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: { min: '', max: '' },
    stockRange: { min: '', max: '' },
    createdDateRange: { start: null as any, end: null as any },
    supplierFilter: 'all',
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    supplierId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantityInStock: 0,
    reorderLevel: 10,
    status: 'active' as 'active' | 'inactive',
  });

  const categories = [
    'Hair Care Products',
    'Styling Tools',
    'Nail Care',
    'Skin Care',
    'Makeup',
    'Equipment',
    'Cleaning Supplies',
    'Other'
  ];

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      // Mock data since API might not be available
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Premium Hair Shampoo',
          description: 'Professional grade moisturizing shampoo',
          sku: 'SHP-001',
          category: 'Hair Care Products',
          supplier_id: '1',
          supplier_name: 'Beauty Supply Co.',
          purchase_price: 12.50,
          selling_price: 25.00,
          quantity_in_stock: 45,
          reorder_level: 20,
          status: 'active',
          created_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Hair Conditioner',
          description: 'Deep conditioning treatment',
          sku: 'CON-001',
          category: 'Hair Care Products',
          supplier_id: '1',
          supplier_name: 'Beauty Supply Co.',
          purchase_price: 14.00,
          selling_price: 28.00,
          quantity_in_stock: 8,
          reorder_level: 15,
          status: 'active',
          created_at: '2024-01-10'
        },
        {
          id: '3',
          name: 'Professional Hair Dryer',
          description: 'High-power ionic hair dryer',
          sku: 'DRY-001',
          category: 'Styling Tools',
          supplier_id: '2',
          supplier_name: 'Equipment Ltd.',
          purchase_price: 85.00,
          selling_price: 150.00,
          quantity_in_stock: 12,
          reorder_level: 5,
          status: 'active',
          created_at: '2024-01-08'
        },
        {
          id: '4',
          name: 'Nail Polish Set',
          description: 'Professional nail polish collection',
          sku: 'POL-001',
          category: 'Nail Care',
          supplier_id: '3',
          supplier_name: 'Nail Art Supplies',
          purchase_price: 35.00,
          selling_price: 65.00,
          quantity_in_stock: 3,
          reorder_level: 10,
          status: 'active',
          created_at: '2024-01-05'
        },
        {
          id: '5',
          name: 'Facial Cleanser',
          description: 'Gentle daily facial cleanser',
          sku: 'CLN-001',
          category: 'Skin Care',
          supplier_id: '4',
          supplier_name: 'Organic Solutions',
          purchase_price: 18.00,
          selling_price: 35.00,
          quantity_in_stock: 25,
          reorder_level: 15,
          status: 'inactive',
          created_at: '2024-01-01'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    // Mock suppliers data
    const mockSuppliers: Supplier[] = [
      { id: '1', name: 'Beauty Supply Co.' },
      { id: '2', name: 'Equipment Ltd.' },
      { id: '3', name: 'Nail Art Supplies' },
      { id: '4', name: 'Organic Solutions' }
    ];
    setSuppliers(mockSuppliers);
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        sku: product.sku,
        category: product.category,
        supplierId: product.supplier_id,
        purchasePrice: product.purchase_price,
        sellingPrice: product.selling_price,
        quantityInStock: product.quantity_in_stock,
        reorderLevel: product.reorder_level,
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        sku: '',
        category: '',
        supplierId: '',
        purchasePrice: 0,
        sellingPrice: 0,
        quantityInStock: 0,
        reorderLevel: 10,
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async () => {
    try {
      // Mock save operation
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        category: formData.category,
        supplier_id: formData.supplierId,
        supplier_name: suppliers.find(s => s.id === formData.supplierId)?.name || '',
        purchase_price: formData.purchasePrice,
        selling_price: formData.sellingPrice,
        quantity_in_stock: formData.quantityInStock,
        reorder_level: formData.reorderLevel,
        status: formData.status,
        created_at: new Date().toISOString(),
      };

      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...newProduct, id: editingProduct.id } : p));
      } else {
        setProducts(prev => [...prev, newProduct]);
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    // Advanced filters
    const matchesPriceRange = 
      (!advancedFilters.priceRange.min || product.selling_price >= parseFloat(advancedFilters.priceRange.min)) &&
      (!advancedFilters.priceRange.max || product.selling_price <= parseFloat(advancedFilters.priceRange.max));
    
    const matchesStockRange = 
      (!advancedFilters.stockRange.min || product.quantity_in_stock >= parseInt(advancedFilters.stockRange.min)) &&
      (!advancedFilters.stockRange.max || product.quantity_in_stock <= parseInt(advancedFilters.stockRange.max));
    
    const matchesCreatedDateRange = 
      (!advancedFilters.createdDateRange.start || !advancedFilters.createdDateRange.end) ||
      (dayjs(product.created_at).isAfter(dayjs(advancedFilters.createdDateRange.start).subtract(1, 'day')) &&
       dayjs(product.created_at).isBefore(dayjs(advancedFilters.createdDateRange.end).add(1, 'day')));
    
    const matchesSupplierFilter = advancedFilters.supplierFilter === 'all' || product.supplier_id === advancedFilters.supplierFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriceRange && 
           matchesStockRange && matchesCreatedDateRange && matchesSupplierFilter;
  });

  // Get products by tab
  const getProductsByTab = () => {
    switch (tabValue) {
      case 0: return filteredProducts; // All products
      case 1: return filteredProducts.filter(p => p.status === 'active'); // Active products
      case 2: return filteredProducts.filter(p => p.quantity_in_stock <= p.reorder_level); // Low stock
      case 3: return filteredProducts.filter(p => p.status === 'inactive'); // Inactive products
      default: return filteredProducts;
    }
  };

  const currentProducts = getProductsByTab();
  const paginatedProducts = currentProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    advancedFilters.priceRange.min ||
    advancedFilters.priceRange.max ||
    advancedFilters.stockRange.min ||
    advancedFilters.stockRange.max ||
    advancedFilters.createdDateRange.start ||
    advancedFilters.createdDateRange.end ||
    advancedFilters.supplierFilter !== 'all'
  );

  // Calculate stats
  const lowStockProducts = products.filter(p => p.quantity_in_stock <= p.reorder_level);
  const totalValue = products.reduce((sum, p) => sum + (p.quantity_in_stock * p.purchase_price), 0);
  const activeProducts = products.filter(p => p.status === 'active').length;
  const averageStockLevel = products.length > 0 ? 
    products.reduce((sum, p) => sum + (p.quantity_in_stock / Math.max(p.reorder_level, 1) * 100), 0) / products.length : 0;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Hair Care Products': '#8B4513',
      'Styling Tools': '#E91E63',
      'Nail Care': '#9C27B0',
      'Skin Care': '#2196F3',
      'Makeup': '#F44336',
      'Equipment': '#FF9800',
      'Cleaning Supplies': '#4CAF50',
      'Other': '#607D8B'
    };
    return colors[category as keyof typeof colors] || '#607D8B';
  };

  const getStockStatus = (product: Product) => {
    const percentage = (product.quantity_in_stock / product.reorder_level) * 100;
    if (percentage <= 100) return { label: 'Low Stock', color: '#E74C3C' };
    if (percentage <= 200) return { label: 'Medium Stock', color: '#F39C12' };
    return { label: 'Good Stock', color: '#27AE60' };
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Loading inventory...</Typography>
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
                <InventoryIcon sx={{ fontSize: 28 }} />
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
                  Inventory Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Track products, stock levels, and suppliers
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
              Add Product
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            backgroundColor: 'rgba(243, 156, 18, 0.05)',
            border: '1px solid rgba(243, 156, 18, 0.2)',
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Low Stock Alert</AlertTitle>
          {lowStockProducts.length} product(s) are running low on stock and need to be reordered.
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Products"
            value={products.length}
            icon={<InventoryIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="in inventory"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Low Stock Items"
            value={lowStockProducts.length}
            icon={<WarningIcon sx={{ fontSize: 28 }} />}
            color="#E74C3C"
            subtitle="need reordering"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Products"
            value={activeProducts}
            icon={<ActiveIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="currently active"
            progress={averageStockLevel}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="inventory value"
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
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
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
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
            {hasActiveFilters ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setAdvancedFiltersOpen(true)}
                  sx={{
                    flex: 1,
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
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setAdvancedFilters({
                      priceRange: { min: '', max: '' },
                      stockRange: { min: '', max: '' },
                      createdDateRange: { start: null, end: null },
                      supplierFilter: 'all',
                    });
                  }}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#E74C3C',
                    color: '#E74C3C',
                    '&:hover': {
                      borderColor: '#E74C3C',
                      backgroundColor: 'rgba(231, 76, 60, 0.04)',
                    }
                  }}
                >
                  Clear
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                fullWidth
                onClick={() => setAdvancedFiltersOpen(true)}
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
            )}
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
          <Tab label={`All Products (${products.length})`} />
          <Tab label={`Active (${activeProducts})`} />
          <Tab 
            label={
              <Badge badgeContent={lowStockProducts.length} color="error">
                <span>Low Stock</span>
              </Badge>
            } 
          />
          <Tab label={`Inactive (${products.filter(p => p.status === 'inactive').length})`} />
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
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Purchase Price</TableCell>
                  <TableCell>Selling Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow 
                      key={product.id}
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
                              backgroundColor: getCategoryColor(product.category),
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            {product.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                              {product.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.sku}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            color: '#8B4513',
                            fontWeight: 500,
                            fontFamily: 'monospace'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          size="small"
                          sx={{
                            backgroundColor: `${getCategoryColor(product.category)}15`,
                            color: getCategoryColor(product.category),
                            fontWeight: 500,
                            border: `1px solid ${getCategoryColor(product.category)}30`
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {product.supplier_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          ${product.purchase_price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#27AE60' }}>
                          ${product.selling_price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.quantity_in_stock}
                          </Typography>
                          <Chip
                            label={stockStatus.label}
                            size="small"
                            sx={{
                              backgroundColor: `${stockStatus.color}15`,
                              color: stockStatus.color,
                              fontWeight: 500,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          icon={product.status === 'active' ? <ActiveIcon sx={{ fontSize: 16 }} /> : <InactiveIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            backgroundColor: product.status === 'active' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(149, 165, 166, 0.1)',
                            color: product.status === 'active' ? '#27AE60' : '#95A5A6',
                            fontWeight: 500,
                            border: `1px solid ${product.status === 'active' ? '#27AE60' : '#95A5A6'}30`,
                            textTransform: 'capitalize'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Product">
                            <IconButton 
                              onClick={() => handleOpenDialog(product)} 
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
                          <Tooltip title="Delete Product">
                            <IconButton 
                              onClick={() => handleDeleteProduct(product.id)} 
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
              count={currentProducts.length}
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

      {/* Add/Edit Product Dialog */}
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
              {editingProduct ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingProduct ? 'Update product information' : 'Create a new inventory item'}
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
                Product Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShoppingCartIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                label="SKU"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={formData.supplierId}
                  label="Supplier"
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BusinessIcon sx={{ fontSize: 20, color: '#8B4513' }} />
                        {supplier.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Pricing Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Pricing Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                fullWidth
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

            <Grid item xs={12} md={6}>
              <TextField
                label="Selling Price"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                fullWidth
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

            {/* Stock Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                Stock Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity in Stock"
                type="number"
                value={formData.quantityInStock}
                onChange={(e) => setFormData({ ...formData, quantityInStock: parseInt(e.target.value) || 0 })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            <Grid item xs={12} md={4}>
              <TextField
                label="Reorder Level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WarningIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            <Grid item xs={12} md={4}>
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

            {/* Product Preview */}
            {(formData.name || formData.category) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Product Preview
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
                            backgroundColor: formData.category ? getCategoryColor(formData.category) : '#8B4513',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                          }}
                        >
                          {(formData.name || 'P').charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {formData.name || 'Product Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formData.category || 'Category'} • SKU: {formData.sku || 'Not set'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#27AE60' }}>
                            ${formData.sellingPrice.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cost: ${formData.purchasePrice.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Stock: {formData.quantityInStock} units
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Reorder at: {formData.reorderLevel} units
                          </Typography>
                        </Grid>
                        {formData.description && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {formData.description}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Profit Calculation */}
            {formData.purchasePrice > 0 && formData.sellingPrice > 0 && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Profit Analysis
                  </Typography>
                  <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <TrendingUpIcon sx={{ fontSize: 32, color: '#27AE60', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#27AE60' }}>
                        ${(formData.sellingPrice - formData.purchasePrice).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profit per Unit
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <AssessmentIcon sx={{ fontSize: 32, color: '#3498DB', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498DB' }}>
                        {formData.purchasePrice > 0 ? (((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(1) : 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Profit Margin
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <MoneyIcon sx={{ fontSize: 32, color: '#F39C12', mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#F39C12' }}>
                        ${((formData.sellingPrice - formData.purchasePrice) * formData.quantityInStock).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Profit Potential
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
            onClick={handleSaveProduct} 
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
            {editingProduct ? 'Update Product' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Filters Dialog */}
      <Dialog
        open={advancedFiltersOpen}
        onClose={() => setAdvancedFiltersOpen(false)}
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
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
              }}
            >
              <FilterIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Advanced Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter inventory by specific criteria
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setAdvancedFiltersOpen(false)}
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
            {/* Price Range */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#8B4513' }}>
                Price Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Price"
                type="number"
                value={advancedFilters.priceRange.min}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  priceRange: { ...advancedFilters.priceRange, min: e.target.value }
                })}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Maximum Price"
                type="number"
                value={advancedFilters.priceRange.max}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  priceRange: { ...advancedFilters.priceRange, max: e.target.value }
                })}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Stock Range */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#8B4513' }}>
                Stock Quantity Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Stock"
                type="number"
                value={advancedFilters.stockRange.min}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  stockRange: { ...advancedFilters.stockRange, min: e.target.value }
                })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Maximum Stock"
                type="number"
                value={advancedFilters.stockRange.max}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  stockRange: { ...advancedFilters.stockRange, max: e.target.value }
                })}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">units</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Created Date Range */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#8B4513' }}>
                Created Date Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={advancedFilters.createdDateRange.start}
                onChange={(newValue) => setAdvancedFilters({
                  ...advancedFilters,
                  createdDateRange: { ...advancedFilters.createdDateRange, start: newValue }
                })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                  } 
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="End Date"
                value={advancedFilters.createdDateRange.end}
                onChange={(newValue) => setAdvancedFilters({
                  ...advancedFilters,
                  createdDateRange: { ...advancedFilters.createdDateRange, end: newValue }
                })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                  } 
                }}
              />
            </Grid>

            {/* Supplier Filter */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#8B4513' }}>
                Supplier Filter
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={advancedFilters.supplierFilter}
                  label="Supplier"
                  onChange={(e) => setAdvancedFilters({
                    ...advancedFilters,
                    supplierFilter: e.target.value
                  })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="all">All Suppliers</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            onClick={() => {
              setAdvancedFilters({
                priceRange: { min: '', max: '' },
                stockRange: { min: '', max: '' },
                createdDateRange: { start: null, end: null },
                supplierFilter: 'all',
              });
            }}
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
            Clear All
          </Button>
          <Button 
            onClick={() => setAdvancedFiltersOpen(false)}
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
            onClick={() => setAdvancedFiltersOpen(false)}
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
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;