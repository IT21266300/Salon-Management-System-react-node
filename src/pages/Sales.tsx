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
  Grid,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  Alert,
  Badge,
  LinearProgress,
  Fade,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  PointOfSale as SalesIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  LocalOffer as DiscountIcon,
  AccountBalance as TaxIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  Inventory as ProductIcon,
  Today as TodayIcon,
  CalendarMonth as MonthIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

interface Sale {
  id: string;
  customer_id?: string;
  customer_name?: string;
  staff_id: string;
  staff_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'completed' | 'refunded';
  sale_date: string;
  notes?: string;
  items: SaleItem[];
}

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Product {
  id: string;
  name: string;
  selling_price: number;
  quantity_in_stock: number;
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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
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
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUpIcon 
                  sx={{ 
                    fontSize: 16, 
                    color: trend > 0 ? '#27AE60' : '#E74C3C' 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: trend > 0 ? '#27AE60' : '#E74C3C',
                    fontWeight: 600 
                  }}
                >
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              </Box>
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
                Target Progress
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

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    amountRange: { min: '', max: '' },
    dateRange: { start: null as any, end: null as any },
    staffFilter: 'all',
    customerFilter: 'all',
  });

  const [currentSale, setCurrentSale] = useState<{
    customerId: string;
    staffId: string;
    items: SaleItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paymentMethod: 'cash' | 'card' | 'transfer';
    notes: string;
  }>({
    customerId: '',
    staffId: '',
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: '',
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = async () => {
    setLoading(true);
    
    // Mock data since API might not be available
    const mockSales: Sale[] = [
      {
        id: '1',
        customer_id: '1',
        customer_name: 'Sarah Johnson',
        staff_id: '1',
        staff_name: 'Emily Davis',
        subtotal: 150.00,
        discount: 15.00,
        tax: 13.50,
        total: 148.50,
        payment_method: 'card',
        status: 'completed',
        sale_date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        notes: 'VIP customer discount applied',
        items: [
          {
            id: '1',
            product_id: '1',
            product_name: 'Premium Hair Shampoo',
            quantity: 2,
            unit_price: 25.00,
            total_price: 50.00
          },
          {
            id: '2',
            product_id: '2',
            product_name: 'Hair Conditioner',
            quantity: 3,
            unit_price: 28.00,
            total_price: 84.00
          }
        ]
      },
      {
        id: '2',
        customer_name: 'Walk-in Customer',
        staff_id: '2',
        staff_name: 'Michael Chen',
        subtotal: 75.00,
        discount: 0,
        tax: 7.50,
        total: 82.50,
        payment_method: 'cash',
        status: 'completed',
        sale_date: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        items: [
          {
            id: '3',
            product_id: '4',
            product_name: 'Nail Polish Set',
            quantity: 1,
            unit_price: 65.00,
            total_price: 65.00
          }
        ]
      },
      {
        id: '3',
        customer_id: '3',
        customer_name: 'David Wilson',
        staff_id: '1',
        staff_name: 'Emily Davis',
        subtotal: 35.00,
        discount: 5.00,
        tax: 3.00,
        total: 33.00,
        payment_method: 'transfer',
        status: 'completed',
        sale_date: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        items: [
          {
            id: '4',
            product_id: '5',
            product_name: 'Facial Cleanser',
            quantity: 1,
            unit_price: 35.00,
            total_price: 35.00
          }
        ]
      }
    ];

    const mockProducts: Product[] = [
      { id: '1', name: 'Premium Hair Shampoo', selling_price: 25.00, quantity_in_stock: 45 },
      { id: '2', name: 'Hair Conditioner', selling_price: 28.00, quantity_in_stock: 8 },
      { id: '3', name: 'Professional Hair Dryer', selling_price: 150.00, quantity_in_stock: 12 },
      { id: '4', name: 'Nail Polish Set', selling_price: 65.00, quantity_in_stock: 3 },
      { id: '5', name: 'Facial Cleanser', selling_price: 35.00, quantity_in_stock: 25 }
    ];

    const mockCustomers = [
      { id: '1', first_name: 'Sarah', last_name: 'Johnson' },
      { id: '2', first_name: 'Jennifer', last_name: 'Brown' },
      { id: '3', first_name: 'David', last_name: 'Wilson' }
    ];

    const mockStaff = [
      { id: '1', first_name: 'Emily', last_name: 'Davis' },
      { id: '2', first_name: 'Michael', last_name: 'Chen' },
      { id: '3', first_name: 'Lisa', last_name: 'Rodriguez' }
    ];

    setSales(mockSales);
    setProducts(mockProducts.filter(p => p.quantity_in_stock > 0));
    setCustomers(mockCustomers);
    setStaff(mockStaff);
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setCurrentSale({
      customerId: '',
      staffId: '',
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      paymentMethod: 'cash',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct('');
    setQuantity(1);
  };

  const addItemToSale = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (quantity > product.quantity_in_stock) {
      alert(`Only ${product.quantity_in_stock} units available in stock`);
      return;
    }

    const existingItemIndex = currentSale.items.findIndex(item => item.product_id === selectedProduct);
    
    let newItems;
    if (existingItemIndex >= 0) {
      const totalQty = currentSale.items[existingItemIndex].quantity + quantity;
      if (totalQty > product.quantity_in_stock) {
        alert(`Total quantity would exceed available stock (${product.quantity_in_stock})`);
        return;
      }
      newItems = [...currentSale.items];
      newItems[existingItemIndex].quantity = totalQty;
      newItems[existingItemIndex].total_price = totalQty * product.selling_price;
    } else {
      const newItem: SaleItem = {
        id: Date.now().toString(),
        product_id: selectedProduct,
        product_name: product.name,
        quantity,
        unit_price: product.selling_price,
        total_price: quantity * product.selling_price,
      };
      newItems = [...currentSale.items, newItem];
    }

    const subtotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal - currentSale.discount + currentSale.tax;

    setCurrentSale({
      ...currentSale,
      items: newItems,
      subtotal,
      total,
    });

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItemFromSale = (itemId: string) => {
    const newItems = currentSale.items.filter(item => item.id !== itemId);
    const subtotal = newItems.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal - currentSale.discount + currentSale.tax;

    setCurrentSale({
      ...currentSale,
      items: newItems,
      subtotal,
      total,
    });
  };

  const handleSaveSale = async () => {
    try {
      if (!currentSale.staffId) {
        alert('Please select a staff member');
        return;
      }

      if (currentSale.items.length === 0) {
        alert('Please add at least one item to the sale');
        return;
      }

      // Mock save operation
      const newSale: Sale = {
        id: Date.now().toString(),
        customer_id: currentSale.customerId || undefined,
        customer_name: currentSale.customerId ? 
          customers.find(c => c.id === currentSale.customerId)?.first_name + ' ' + 
          customers.find(c => c.id === currentSale.customerId)?.last_name : 
          'Walk-in Customer',
        staff_id: currentSale.staffId,
        staff_name: staff.find(s => s.id === currentSale.staffId)?.first_name + ' ' + 
                   staff.find(s => s.id === currentSale.staffId)?.last_name || '',
        subtotal: currentSale.subtotal,
        discount: currentSale.discount,
        tax: currentSale.tax,
        total: currentSale.total,
        payment_method: currentSale.paymentMethod,
        status: 'completed',
        sale_date: new Date().toISOString(),
        notes: currentSale.notes,
        items: currentSale.items,
      };

      setSales(prev => [newSale, ...prev]);
      
      // Update product stock
      setProducts(prev => prev.map(product => {
        const saleItem = currentSale.items.find(item => item.product_id === product.id);
        if (saleItem) {
          return {
            ...product,
            quantity_in_stock: product.quantity_in_stock - saleItem.quantity
          };
        }
        return product;
      }).filter(p => p.quantity_in_stock > 0));

      handleCloseDialog();
      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error saving sale. Please try again.');
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return '#27AE60';
      case 'card': return '#3498DB';
      case 'transfer': return '#9B59B6';
      default: return '#95A5A6';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#27AE60';
      case 'pending': return '#F39C12';
      case 'refunded': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Filter sales based on search and filters
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || sale.payment_method === paymentFilter;
    
    // Advanced filters
    const matchesAmountRange = 
      (!advancedFilters.amountRange.min || sale.total >= parseFloat(advancedFilters.amountRange.min)) &&
      (!advancedFilters.amountRange.max || sale.total <= parseFloat(advancedFilters.amountRange.max));
    
    const matchesDateRange = 
      (!advancedFilters.dateRange.start || !advancedFilters.dateRange.end) ||
      (dayjs(sale.sale_date).isAfter(dayjs(advancedFilters.dateRange.start).subtract(1, 'day')) &&
       dayjs(sale.sale_date).isBefore(dayjs(advancedFilters.dateRange.end).add(1, 'day')));
    
    const matchesStaffFilter = advancedFilters.staffFilter === 'all' || sale.staff_id === advancedFilters.staffFilter;
    const matchesCustomerFilter = advancedFilters.customerFilter === 'all' || sale.customer_id === advancedFilters.customerFilter;
    
    return matchesSearch && matchesStatus && matchesPayment && matchesAmountRange && 
           matchesDateRange && matchesStaffFilter && matchesCustomerFilter;
  });

  // Get sales by tab
  const getSalesByTab = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const thisMonth = dayjs().format('YYYY-MM');
    
    switch (tabValue) {
      case 0: return filteredSales; // All sales
      case 1: return filteredSales.filter(s => dayjs(s.sale_date).format('YYYY-MM-DD') === today); // Today
      case 2: return filteredSales.filter(s => dayjs(s.sale_date).format('YYYY-MM') === thisMonth); // This month
      case 3: return filteredSales.filter(s => s.status === 'completed'); // Completed
      default: return filteredSales;
    }
  };

  const currentSales = getSalesByTab();
  const paginatedSales = currentSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    statusFilter !== 'all' ||
    paymentFilter !== 'all' ||
    advancedFilters.amountRange.min ||
    advancedFilters.amountRange.max ||
    advancedFilters.dateRange.start ||
    advancedFilters.dateRange.end ||
    advancedFilters.staffFilter !== 'all' ||
    advancedFilters.customerFilter !== 'all'
  );

  // Calculate stats
  const todaySales = sales.filter(sale => 
    dayjs(sale.sale_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  );
  const thisMonthSales = sales.filter(sale => 
    dayjs(sale.sale_date).format('YYYY-MM') === dayjs().format('YYYY-MM')
  );

  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const monthlyTotal = thisMonthSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0;
  const completedSales = sales.filter(s => s.status === 'completed').length;

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
                <SalesIcon sx={{ fontSize: 28 }} />
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
                  Sales Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Process sales and track revenue
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
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
              New Sale
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Sales"
            value={todaySales.length}
            icon={<TodayIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="transactions today"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Today's Revenue"
            value={`$${todayTotal.toFixed(2)}`}
            icon={<MoneyIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="total earnings"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Monthly Revenue"
            value={`$${monthlyTotal.toFixed(2)}`}
            icon={<MonthIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="this month"
            progress={65}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Average Sale"
            value={`$${averageSale.toFixed(2)}`}
            icon={<AssessmentIcon sx={{ fontSize: 28 }} />}
            color="#9B59B6"
            subtitle="per transaction"
            trend={12}
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
              placeholder="Search sales..."
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
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentFilter}
                label="Payment Method"
                onChange={(e) => setPaymentFilter(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="transfer">Transfer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
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
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setAdvancedFilters({
                      amountRange: { min: '', max: '' },
                      dateRange: { start: null, end: null },
                      staffFilter: 'all',
                      customerFilter: 'all',
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
                Advanced
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
          <Tab label={`All Sales (${sales.length})`} />
          <Tab label={`Today (${todaySales.length})`} />
          <Tab label={`This Month (${thisMonthSales.length})`} />
          <Tab label={`Completed (${completedSales})`} />
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
                  <TableCell>Sale ID</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSales.map((sale) => (
                  <TableRow 
                    key={sale.id}
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
                      <Chip
                        label={`#${sale.id}`}
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
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {dayjs(sale.sale_date).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(sale.sale_date).format('HH:mm')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: sale.customer_name === 'Walk-in Customer' ? '#95A5A6' : '#8B4513',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {sale.customer_name?.charAt(0) || 'W'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sale.customer_name || 'Walk-in Customer'}
                          </Typography>
                          {sale.customer_name !== 'Walk-in Customer' && (
                            <Typography variant="caption" color="text.secondary">
                              Customer ID: {sale.customer_id}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sale.staff_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CartIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sale.items?.length || 0} items
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#27AE60' }}>
                          ${sale.total.toFixed(2)}
                        </Typography>
                        {sale.discount > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Discount: ${sale.discount.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.payment_method}
                        size="small"
                        sx={{
                          backgroundColor: `${getPaymentMethodColor(sale.payment_method)}15`,
                          color: getPaymentMethodColor(sale.payment_method),
                          fontWeight: 500,
                          border: `1px solid ${getPaymentMethodColor(sale.payment_method)}30`,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(sale.status)}15`,
                          color: getStatusColor(sale.status),
                          fontWeight: 500,
                          border: `1px solid ${getStatusColor(sale.status)}30`,
                          textTransform: 'capitalize'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Print Receipt">
                        <IconButton 
                          size="small"
                          sx={{
                            color: '#8B4513',
                            '&:hover': {
                              backgroundColor: 'rgba(139, 69, 19, 0.1)'
                            }
                          }}
                        >
                          <PrintIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
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
              count={currentSales.length}
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

      {/* New Sale Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 69, 19, 0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            minHeight: '80vh',
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
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                New Sale
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Process a new sale transaction
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
          <Grid container spacing={4}>
            {/* Left Column - Sale Details */}
            <Grid item xs={12} lg={8}>
              {/* Customer and Staff Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                  Sale Information
                </Typography>
                <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Customer (Optional)</InputLabel>
                      <Select
                        value={currentSale.customerId}
                        label="Customer (Optional)"
                        onChange={(e) => setCurrentSale({ ...currentSale, customerId: e.target.value })}
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(139, 69, 19, 0.2)',
                          }
                        }}
                      >
                        <MenuItem value="">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 24, height: 24, backgroundColor: '#95A5A6' }}>
                              W
                            </Avatar>
                            Walk-in Customer
                          </Box>
                        </MenuItem>
                        {customers.map((customer) => (
                          <MenuItem key={customer.id} value={customer.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 24, height: 24, backgroundColor: '#8B4513' }}>
                                {customer.first_name.charAt(0)}
                              </Avatar>
                              {customer.first_name} {customer.last_name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Staff Member</InputLabel>
                      <Select
                        value={currentSale.staffId}
                        label="Staff Member"
                        onChange={(e) => setCurrentSale({ ...currentSale, staffId: e.target.value })}
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
                              <Avatar sx={{ width: 24, height: 24, backgroundColor: '#8B4513' }}>
                                {member.first_name.charAt(0)}
                              </Avatar>
                              {member.first_name} {member.last_name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              {/* Add Items Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                  Add Products
                </Typography>
                <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Product</InputLabel>
                      <Select
                        value={selectedProduct}
                        label="Select Product"
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(139, 69, 19, 0.2)',
                          }
                        }}
                      >
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <ProductIcon sx={{ fontSize: 20, color: '#8B4513' }} />
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Stock: {product.quantity_in_stock}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#27AE60' }}>
                                ${product.selling_price.toFixed(2)}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      fullWidth
                      inputProps={{ min: 1 }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Button 
                      variant="contained" 
                      onClick={addItemToSale}
                      fullWidth
                      disabled={!selectedProduct || quantity <= 0}
                      sx={{
                        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                        },
                      }}
                    >
                      Add Item
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Sale Items List */}
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                  Sale Items ({currentSale.items.length})
                </Typography>
                <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
                
                {currentSale.items.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No items added yet. Select products from the dropdown above to add them to this sale.
                  </Alert>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      border: '1px solid rgba(139, 69, 19, 0.1)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <List disablePadding>
                      {currentSale.items.map((item, index) => (
                        <ListItem 
                          key={item.id} 
                          divider={index < currentSale.items.length - 1}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'rgba(139, 69, 19, 0.02)',
                            }
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {item.product_name}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#27AE60' }}>
                                  ${item.total_price.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                <Chip
                                  label={`Qty: ${item.quantity}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                                    color: '#8B4513',
                                    fontWeight: 500,
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  ${item.unit_price.toFixed(2)} × {item.quantity}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Tooltip title="Remove Item">
                              <IconButton 
                                onClick={() => removeItemFromSale(item.id)}
                                sx={{
                                  color: '#E74C3C',
                                  '&:hover': {
                                    backgroundColor: 'rgba(231, 76, 60, 0.1)'
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Grid>

            {/* Right Column - Sale Summary */}
            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%)',
                  border: '1px solid rgba(139, 69, 19, 0.1)',
                  borderRadius: 3,
                  position: 'sticky',
                  top: 20,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#8B4513' }}>
                    Sale Summary
                  </Typography>
                  
                  {/* Subtotal */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      ${currentSale.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {/* Discount */}
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      label="Discount Amount"
                      type="number"
                      value={currentSale.discount}
                      onChange={(e) => {
                        const discount = parseFloat(e.target.value) || 0;
                        const total = currentSale.subtotal - discount + currentSale.tax;
                        setCurrentSale({ ...currentSale, discount, total });
                      }}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DiscountIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Tax */}
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      label="Tax Amount"
                      type="number"
                      value={currentSale.tax}
                      onChange={(e) => {
                        const tax = parseFloat(e.target.value) || 0;
                        const total = currentSale.subtotal - currentSale.discount + tax;
                        setCurrentSale({ ...currentSale, tax, total });
                      }}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TaxIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2, backgroundColor: 'rgba(139, 69, 19, 0.2)' }} />
                  
                  {/* Total */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Total:
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#27AE60' }}>
                      ${currentSale.total.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {/* Payment Method */}
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={currentSale.paymentMethod}
                      label="Payment Method"
                      onChange={(e) => setCurrentSale({ ...currentSale, paymentMethod: e.target.value as any })}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(139, 69, 19, 0.2)',
                        }
                      }}
                    >
                      <MenuItem value="cash">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#27AE60',
                            }}
                          />
                          Cash
                        </Box>
                      </MenuItem>
                      <MenuItem value="card">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#3498DB',
                            }}
                          />
                          Card
                        </Box>
                      </MenuItem>
                      <MenuItem value="transfer">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: '#9B59B6',
                            }}
                          />
                          Transfer
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Notes */}
                  <TextField
                    label="Sale Notes (Optional)"
                    multiline
                    rows={3}
                    value={currentSale.notes}
                    onChange={(e) => setCurrentSale({ ...currentSale, notes: e.target.value })}
                    fullWidth
                    placeholder="Add any special notes for this sale..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </CardContent>
              </Card>
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
            onClick={handleSaveSale} 
            variant="contained"
            disabled={currentSale.items.length === 0 || !currentSale.staffId}
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
            Complete Sale
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
                Filter sales by specific criteria
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
            {/* Amount Range */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#8B4513' }}>
                Sale Amount Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Amount"
                type="number"
                value={advancedFilters.amountRange.min}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  amountRange: { ...advancedFilters.amountRange, min: e.target.value }
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
                label="Maximum Amount"
                type="number"
                value={advancedFilters.amountRange.max}
                onChange={(e) => setAdvancedFilters({
                  ...advancedFilters,
                  amountRange: { ...advancedFilters.amountRange, max: e.target.value }
                })}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#8B4513' }}>
                Sale Date Range
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Start Date"
                value={advancedFilters.dateRange.start}
                onChange={(newValue) => setAdvancedFilters({
                  ...advancedFilters,
                  dateRange: { ...advancedFilters.dateRange, start: newValue }
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
                value={advancedFilters.dateRange.end}
                onChange={(newValue) => setAdvancedFilters({
                  ...advancedFilters,
                  dateRange: { ...advancedFilters.dateRange, end: newValue }
                })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                  } 
                }}
              />
            </Grid>

            {/* Staff Filter */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2, fontWeight: 600, color: '#8B4513' }}>
                Staff & Customer Filters
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={advancedFilters.staffFilter}
                  label="Staff Member"
                  onChange={(e) => setAdvancedFilters({
                    ...advancedFilters,
                    staffFilter: e.target.value
                  })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="all">All Staff</MenuItem>
                  {staff.map((staffMember) => (
                    <MenuItem key={staffMember.id} value={staffMember.id}>
                      {staffMember.first_name} {staffMember.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Customer Filter */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={advancedFilters.customerFilter}
                  label="Customer"
                  onChange={(e) => setAdvancedFilters({
                    ...advancedFilters,
                    customerFilter: e.target.value
                  })}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="all">All Customers</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
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
                amountRange: { min: '', max: '' },
                dateRange: { start: null, end: null },
                staffFilter: 'all',
                customerFilter: 'all',
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

export default Sales;