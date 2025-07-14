import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';

interface ActivityLog {
  id: string;
  username: string;
  action: string;
  module: string;
  details: string;
  created_at: string;
  ip_address: string;
  status: 'success' | 'warning' | 'error';
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [filter, setFilter] = useState({
    user: '',
    module: '',
    status: '',
  });

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter.user && { user: filter.user }),
        ...(filter.module && filter.module !== '' && { module: filter.module }),
        ...(filter.status && filter.status !== '' && { status: filter.status }),
      });

      const response = await fetch(`http://localhost:3001/api/activity-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
        setError(null);
      } else {
        setError('Failed to fetch activity logs');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch activity logs error:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Activity Logs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search User"
          value={filter.user}
          onChange={(e) => handleFilterChange({ user: e.target.value })}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Module</InputLabel>
          <Select
            value={filter.module}
            onChange={(e) => handleFilterChange({ module: e.target.value })}
          >
            <MenuItem value="">All Modules</MenuItem>
            <MenuItem value="Authentication">Authentication</MenuItem>
            <MenuItem value="Appointments">Appointments</MenuItem>
            <MenuItem value="Customers">Customers</MenuItem>
            <MenuItem value="Inventory">Inventory</MenuItem>
            <MenuItem value="Services">Services</MenuItem>
            <MenuItem value="Sales">Sales</MenuItem>
            <MenuItem value="Users">Users</MenuItem>
            <MenuItem value="Reports">Reports</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filter.status}
            onChange={(e) => handleFilterChange({ status: e.target.value })}
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
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                <TableCell>{log.username}</TableCell>
                <TableCell>{log.module}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>{log.ip_address}</TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={getStatusColor(log.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={pagination.pages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ActivityLogs;
