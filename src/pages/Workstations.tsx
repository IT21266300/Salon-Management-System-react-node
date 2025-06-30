import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchWorkstations,
  createWorkstation,
  updateWorkstation,
  deleteWorkstation,
  removeStaffFromWorkstation,
  assignStaffToWorkstation,
  fetchAvailableStaff,
  fetchWorkstationAppointments,
  updateAppointmentStatus,
  clearError,
  clearWorkstationAppointments,
} from '../store/workstationSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WorkOutline as WorkstationIcon,
  Person as PersonIcon,
  Event as EventIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface WorkstationFormData {
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out-of-order';
}

interface Workstation {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'out-of-order';
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  appointment_count: number;
  created_at: string;
}

const workstationTypes = [
  'Hair Styling',
  'Hair Cutting',
  'Hair Washing',
  'Nail Care',
  'Manicure',
  'Pedicure',
  'Facial Treatment',
  'Massage',
  'Makeup',
  'Waxing',
  'Other'
];

const statusColors = {
  available: 'success',
  occupied: 'warning',
  maintenance: 'info',
  'out-of-order': 'error'
} as const;

const statusIcons = {
  available: '✅',
  occupied: '🔄',
  maintenance: '🔧',
  'out-of-order': '❌'
};

const Workstations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workstations, loading, error, availableStaff, workstationAppointments } = useSelector((state: RootState) => state.workstations);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [isAppointmentsDialogOpen, setIsAppointmentsDialogOpen] = useState(false);
  const [editingWorkstation, setEditingWorkstation] = useState<Workstation | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [formData, setFormData] = useState<WorkstationFormData>({
    name: '',
    type: '',
    status: 'available',
  });

  useEffect(() => {
    dispatch(fetchWorkstations());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenDialog = (workstation?: Workstation) => {
    if (workstation) {
      setEditingWorkstation(workstation);
      setFormData({
        name: workstation.name,
        type: workstation.type,
        status: workstation.status,
      });
    } else {
      setEditingWorkstation(null);
      setFormData({
        name: '',
        type: '',
        status: 'available',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkstation(null);
    setFormData({
      name: '',
      type: '',
      status: 'available',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.type.trim()) return;

    try {
      if (editingWorkstation) {
        await dispatch(updateWorkstation({ id: editingWorkstation.id, ...formData })).unwrap();
      } else {
        await dispatch(createWorkstation(formData)).unwrap();
      }
      handleCloseDialog();
      dispatch(fetchWorkstations());
    } catch (error) {
      console.error('Error saving workstation:', error);
    }
  };

  const handleDelete = async (workstationId: string) => {
    if (window.confirm('Are you sure you want to delete this workstation? This action cannot be undone.')) {
      try {
        await dispatch(deleteWorkstation(workstationId)).unwrap();
        dispatch(fetchWorkstations());
      } catch (error) {
        console.error('Error deleting workstation:', error);
      }
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, workstation: Workstation) => {
    setAnchorEl(event.currentTarget);
    setSelectedWorkstation(workstation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedWorkstation(null);
  };

  const handleInputChange = (field: keyof WorkstationFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const getWorkstationInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const handleOpenStaffDialog = (workstation: Workstation) => {
    setSelectedWorkstation(workstation);
    setSelectedStaffId('');
    dispatch(fetchAvailableStaff());
    setIsStaffDialogOpen(true);
  };

  const handleCloseStaffDialog = () => {
    setIsStaffDialogOpen(false);
    setSelectedWorkstation(null);
    setSelectedStaffId('');
  };

  const handleAssignStaff = async () => {
    if (!selectedWorkstation || !selectedStaffId) return;

    try {
      await dispatch(assignStaffToWorkstation({
        workstationId: selectedWorkstation.id,
        staffId: selectedStaffId
      })).unwrap();
      handleCloseStaffDialog();
      dispatch(fetchWorkstations());
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const handleOpenAppointmentsDialog = (workstation: Workstation) => {
    setSelectedWorkstation(workstation);
    dispatch(fetchWorkstationAppointments(workstation.id));
    setIsAppointmentsDialogOpen(true);
  };

  const handleCloseAppointmentsDialog = () => {
    setIsAppointmentsDialogOpen(false);
    setSelectedWorkstation(null);
    dispatch(clearWorkstationAppointments());
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    if (!selectedWorkstation) return;

    try {
      await dispatch(updateAppointmentStatus({
        workstationId: selectedWorkstation.id,
        appointmentId,
        status: newStatus
      })).unwrap();
      
      // Refresh appointments after status update
      dispatch(fetchWorkstationAppointments(selectedWorkstation.id));
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return '#4CAF50';
      case 'occupied': return '#FF9800';
      case 'maintenance': return '#2196F3';
      case 'out-of-order': return '#F44336';
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800'; 
      case 'in-progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'no-show': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning'; 
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Workstation Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
        >
          Add Workstation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {workstations.map((workstation) => (
          <Grid item xs={12} sm={6} md={4} key={workstation.id}>
            <Card 
              sx={{ 
                height: '100%',
                position: 'relative',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <Box
                sx={{
                  height: 4,
                  backgroundColor: getStatusColor(workstation.status),
                  borderRadius: '4px 4px 0 0',
                }}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        backgroundColor: getStatusColor(workstation.status),
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getWorkstationInitials(workstation.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {workstation.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workstation.type}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Tooltip title="More Actions">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, workstation)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    label={`${statusIcons[workstation.status]} ${workstation.status.replace('-', ' ').toUpperCase()}`}
                    size="small"
                    color={statusColors[workstation.status]}
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>

                <Box display="flex" gap={2} mb={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {workstation.assigned_staff_name || 'Unassigned'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {workstation.appointment_count} Active Appointments
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {workstations.length === 0 && !loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
          gap={2}
        >
          <WorkstationIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            No workstations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first workstation to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Workstation
          </Button>
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedWorkstation) {
            handleOpenDialog(selectedWorkstation);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Workstation</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedWorkstation) {
            handleOpenStaffDialog(selectedWorkstation);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Assign Staff</ListItemText>
        </MenuItem>

        {selectedWorkstation?.assigned_staff_id && (
          <MenuItem onClick={() => {
            if (selectedWorkstation) {
              dispatch(removeStaffFromWorkstation(selectedWorkstation.id))
                .then(() => dispatch(fetchWorkstations()));
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <PersonRemoveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove Staff</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          if (selectedWorkstation) {
            handleOpenAppointmentsDialog(selectedWorkstation);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Appointments</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={() => {
            if (selectedWorkstation) {
              handleDelete(selectedWorkstation.id);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Workstation</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorkstation ? 'Edit Workstation' : 'Add New Workstation'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Workstation Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              required
              placeholder="e.g., Station 1, Nail Booth A"
            />
            
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Workstation Type</InputLabel>
              <Select
                value={formData.type}
                label="Workstation Type"
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                {workstationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'occupied' | 'maintenance' | 'out-of-order' }))}
              >
                <MenuItem value="available">
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>✅</span> Available
                  </Box>
                </MenuItem>
                <MenuItem value="occupied">
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>🔄</span> Occupied
                  </Box>
                </MenuItem>
                <MenuItem value="maintenance">
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>🔧</span> Maintenance
                  </Box>
                </MenuItem>
                <MenuItem value="out-of-order">
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>❌</span> Out of Order
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim() || !formData.type.trim() || loading}
          >
            {editingWorkstation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Assignment Dialog */}
      <Dialog open={isStaffDialogOpen} onClose={handleCloseStaffDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Staff to {selectedWorkstation?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Staff Member</InputLabel>
              <Select
                value={selectedStaffId}
                label="Select Staff Member"
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {availableStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name} ({staff.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStaffDialog}>Cancel</Button>
          <Button
            onClick={handleAssignStaff}
            variant="contained"
            disabled={!selectedStaffId || loading}
          >
            Assign Staff
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointments Dialog */}
      <Dialog open={isAppointmentsDialogOpen} onClose={handleCloseAppointmentsDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Appointments for {selectedWorkstation?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {workstationAppointments.length > 0 ? (
              <Grid container spacing={2}>
                {workstationAppointments.map((appointment) => (
                  <Grid item xs={12} key={appointment.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box flex={1}>
                            <Typography variant="h6">
                              {appointment.customer_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.service}
                            </Typography>
                            <Typography variant="body2">
                              {appointment.appointment_date} at {appointment.appointment_time}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={appointment.status}
                              color={getStatusChipColor(appointment.status)}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {['confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                            <Button
                              key={status}
                              size="small"
                              variant={appointment.status === status ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateAppointmentStatus(appointment.id, status)}
                              disabled={appointment.status === status || loading}
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {status.replace('-', ' ')}
                            </Button>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="200px"
                gap={2}
              >
                <EventIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This workstation has no active appointments
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAppointmentsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workstations;
