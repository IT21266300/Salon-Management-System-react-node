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
} from '@mui/material';
import {
  Add as AddIcon,
  PointOfSale as SalesIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Delete as DeleteIcon,
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

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    fetchSales();
    fetchProducts();
    fetchCustomers();
    fetchStaff();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sales');
      const data = await response.json();
      if (data.success) {
        setSales(data.sales);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/inventory');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products.filter((p: Product) => p.quantity_in_stock > 0));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/users');
      const data = await response.json();
      if (data.success) {
        setStaff(data.users);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
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
  };

  const addItemToSale = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingItemIndex = currentSale.items.findIndex(item => item.product_id === selectedProduct);
    
    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...currentSale.items];
      newItems[existingItemIndex].quantity += quantity;
      newItems[existingItemIndex].total_price = newItems[existingItemIndex].quantity * product.selling_price;
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
      // Validation
      if (!currentSale.staffId) {
        alert('Please select a staff member');
        return;
      }

      if (currentSale.items.length === 0) {
        alert('Please add at least one item to the sale');
        return;
      }

      const saleData = {
        customerId: currentSale.customerId || null,
        staffId: currentSale.staffId,
        items: currentSale.items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unit_price
        })),
        subtotal: currentSale.subtotal,
        discount: currentSale.discount,
        tax: currentSale.tax,
        total: currentSale.total,
        paymentMethod: currentSale.paymentMethod,
        notes: currentSale.notes,
      };

      const response = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        fetchSales();
        fetchProducts(); // Refresh to update stock levels
        handleCloseDialog();
      } else {
        const errorData = await response.json();
        console.error('Error saving sale:', errorData);
        alert('Error saving sale. Please try again.');
      }
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error saving sale. Please check your connection.');
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'transfer': return 'info';
      default: return 'default';
    }
  };

  const todaySales = sales.filter(sale => 
    dayjs(sale.sale_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  );

  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  if (loading) {
    return <Typography>Loading sales...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 500 }}>
          Sales Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Sale
        </Button>
      </Box>

      {/* Sales Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SalesIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {todaySales.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Today's Sales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    ${todayTotal.toFixed(2)}
                  </Typography>
                  <Typography color="text.secondary">
                    Today's Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {sales.length}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Sales
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {dayjs(sale.sale_date).format('MMM DD, YYYY HH:mm')}
                </TableCell>
                <TableCell>
                  {sale.customer_name || 'Walk-in Customer'}
                </TableCell>
                <TableCell>{sale.staff_name}</TableCell>
                <TableCell>{sale.items?.length || 0} items</TableCell>
                <TableCell>${sale.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.payment_method}
                    color={getPaymentMethodColor(sale.payment_method) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={sale.status}
                    color={sale.status === 'completed' ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Sale Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>New Sale</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Customer and Staff Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer (Optional)</InputLabel>
                <Select
                  value={currentSale.customerId}
                  onChange={(e) => setCurrentSale({ ...currentSale, customerId: e.target.value })}
                >
                  <MenuItem value="">Walk-in Customer</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.first_name} {customer.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Staff</InputLabel>
                <Select
                  value={currentSale.staffId}
                  onChange={(e) => setCurrentSale({ ...currentSale, staffId: e.target.value })}
                >
                  {staff.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Add Items */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Add Items</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - ${product.selling_price} (Stock: {product.quantity_in_stock})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <Button variant="contained" onClick={addItemToSale}>
                  Add Item
                </Button>
              </Box>
            </Grid>

            {/* Sale Items */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Sale Items</Typography>
              <List>
                {currentSale.items.map((item) => (
                  <ListItem key={item.id} divider>
                    <ListItemText
                      primary={item.product_name}
                      secondary={`Qty: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${item.total_price.toFixed(2)}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeItemFromSale(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Sale Summary */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Sale Summary</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>${currentSale.subtotal.toFixed(2)}</Typography>
                  </Box>
                  <TextField
                    label="Discount"
                    type="number"
                    value={currentSale.discount}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const total = currentSale.subtotal - discount + currentSale.tax;
                      setCurrentSale({ ...currentSale, discount, total });
                    }}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <TextField
                    label="Tax"
                    type="number"
                    value={currentSale.tax}
                    onChange={(e) => {
                      const tax = parseFloat(e.target.value) || 0;
                      const total = currentSale.subtotal - currentSale.discount + tax;
                      setCurrentSale({ ...currentSale, tax, total });
                    }}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    InputProps={{ startAdornment: '$' }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">${currentSale.total.toFixed(2)}</Typography>
                  </Box>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={currentSale.paymentMethod}
                      onChange={(e) => setCurrentSale({ ...currentSale, paymentMethod: e.target.value as any })}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="transfer">Transfer</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Notes"
                    multiline
                    rows={2}
                    value={currentSale.notes}
                    onChange={(e) => setCurrentSale({ ...currentSale, notes: e.target.value })}
                    fullWidth
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveSale} 
            variant="contained"
            disabled={currentSale.items.length === 0 || !currentSale.staffId}
          >
            Complete Sale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;
