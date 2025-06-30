import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

const ActivityLogs: React.FC = () => {
  const [logs] = useState<ActivityLog[]>([
    {
      id: '1',
      user: 'Admin User',
      action: 'User Login',
      module: 'Authentication',
      details: 'Successful login',
      timestamp: '2024-01-15 09:30:15',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'Create Appointment',
      module: 'Appointments',
      details: 'Created appointment for John Doe',
      timestamp: '2024-01-15 10:15:30',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '3',
      user: 'Admin User',
      action: 'Update Product',
      module: 'Inventory',
      details: 'Updated stock for Shampoo XYZ',
      timestamp: '2024-01-15 11:45:22',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
  ]);

  const [filter, setFilter] = useState({
    user: '',
    module: '',
    status: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const filteredLogs = logs.filter(log => {
    return (
      (filter.user === '' || log.user.toLowerCase().includes(filter.user.toLowerCase())) &&
      (filter.module === '' || log.module === filter.module) &&
      (filter.status === '' || log.status === filter.status)
    );
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Activity Logs
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search User"
          value={filter.user}
          onChange={(e) => setFilter({ ...filter, user: e.target.value })}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Module</InputLabel>
          <Select
            value={filter.module}
            onChange={(e) => setFilter({ ...filter, module: e.target.value })}
          >
            <MenuItem value="">All Modules</MenuItem>
            <MenuItem value="Authentication">Authentication</MenuItem>
            <MenuItem value="Appointments">Appointments</MenuItem>
            <MenuItem value="Customers">Customers</MenuItem>
            <MenuItem value="Inventory">Inventory</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={getStatusColor(log.status) as any}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityLogs;