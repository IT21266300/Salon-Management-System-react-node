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
  Fade,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
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
  Close as CloseIcon,
  Build as BuildIcon,
  CheckCircle as AvailableIcon,
  Schedule as OccupiedIcon,
  Engineering as MaintenanceIcon,
  ErrorOutline as OutOfOrderIcon,
  Groups as GroupsIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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
      id={`workstations-tabpanel-${index}`}
      aria-labelledby={`workstations-tab-${index}`}
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
}> = ({ title, value, icon, color, subtitle }) => {
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

// Enhanced Workstation Card Component
const WorkstationCard: React.FC<{
  workstation: Workstation;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, workstation: Workstation) => void;
}> = ({ workstation, onMenuClick }) => {

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: '#27AE60',
          bg: 'rgba(39, 174, 96, 0.1)',
          icon: <AvailableIcon />,
          label: 'Available'
        };
      case 'occupied':
        return {
          color: '#F39C12',
          bg: 'rgba(243, 156, 18, 0.1)',
          icon: <OccupiedIcon />,
          label: 'Occupied'
        };
      case 'maintenance':
        return {
          color: '#3498DB',
          bg: 'rgba(52, 152, 219, 0.1)',
          icon: <MaintenanceIcon />,
          label: 'Maintenance'
        };
      case 'out-of-order':
        return {
          color: '#E74C3C',
          bg: 'rgba(231, 76, 60, 0.1)',
          icon: <OutOfOrderIcon />,
          label: 'Out of Order'
        };
      default:
        return {
          color: '#95A5A6',
          bg: 'rgba(149, 165, 166, 0.1)',
          icon: <WorkstationIcon />,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(workstation.status);

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,246,240,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 69, 19, 0.08)',
        borderRadius: 3,
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
          height: '4px',
          background: `linear-gradient(90deg, transparent 0%, ${statusConfig.color} 50%, transparent 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${statusConfig.color} 0%, ${statusConfig.color}CC 100%)`,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${statusConfig.color}30`,
              }}
            >
              {workstation.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {workstation.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {workstation.type}
              </Typography>
            </Box>
          </Box>
          <Tooltip title="More Actions">
            <IconButton
              onClick={(e) => onMenuClick(e, workstation)}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(139, 69, 19, 0.08)',
                  color: '#8B4513',
                }
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Status */}
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            sx={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              fontWeight: 600,
              border: `1px solid ${statusConfig.color}30`,
              fontSize: '0.8rem',
              height: 32,
            }}
          />
        </Box>

        {/* Staff Assignment */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {workstation.assigned_staff_name ? (
              <span style={{ color: '#27AE60' }}>{workstation.assigned_staff_name}</span>
            ) : (
              <span style={{ color: '#95A5A6' }}>Unassigned</span>
            )}
          </Typography>
        </Box>

        {/* Appointments */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            <span style={{ color: '#3498DB' }}>{workstation.appointment_count}</span> Active Appointments
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState<WorkstationFormData>({
    name: '',
    type: '',
    status: 'available',
  });
  const [assignError, setAssignError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    setDeleteError(null);
    if (window.confirm('Are you sure you want to delete this workstation? This action cannot be undone.')) {
      try {
        await dispatch(deleteWorkstation(workstationId)).unwrap();
        dispatch(fetchWorkstations());
      } catch (error: unknown) {
        setDeleteError(error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to delete workstation'));
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
    setAssignError(null);
    try {
      const result = await dispatch(assignStaffToWorkstation({
        workstationId: selectedWorkstation.id,
        staffId: selectedStaffId
      })).unwrap();
      if (result && result.success) {
        handleCloseStaffDialog();
        dispatch(fetchWorkstations());
      } else if (result && result.message) {
        setAssignError(result.message);
      }
    } catch (err: unknown) {
      setAssignError(err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to assign staff'));
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
      
      dispatch(fetchWorkstationAppointments(selectedWorkstation.id));
    } catch (error) {
      console.error('Error updating appointment status:', error);
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

  // Filter workstations based on search and status
  const filteredWorkstations = workstations.filter(workstation => {
    const matchesSearch = workstation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workstation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (workstation.assigned_staff_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workstation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get workstations by tab
  const getWorkstationsByTab = () => {
    switch (tabValue) {
      case 0: return filteredWorkstations; // All workstations
      case 1: return filteredWorkstations.filter(w => w.status === 'available'); // Available
      case 2: return filteredWorkstations.filter(w => w.status === 'occupied'); // Occupied
      case 3: return filteredWorkstations.filter(w => w.assigned_staff_id); // Assigned
      default: return filteredWorkstations;
    }
  };

  const currentWorkstations = getWorkstationsByTab();

  // Calculate stats
  const totalWorkstations = workstations.length;
  const availableWorkstations = workstations.filter(w => w.status === 'available').length;
  const occupiedWorkstations = workstations.filter(w => w.status === 'occupied').length;
  const assignedWorkstations = workstations.filter(w => w.assigned_staff_id).length;

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
                <WorkstationIcon sx={{ fontSize: 28 }} />
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
                  Workstation Management
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Manage salon workstations and staff assignments
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
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
              Add Workstation
            </Button>
          </Box>
        </Box>
      </Fade>

      {/* Error Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {deleteError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {deleteError}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Workstations"
            value={totalWorkstations}
            icon={<DashboardIcon sx={{ fontSize: 28 }} />}
            color="#8B4513"
            subtitle="total stations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Available"
            value={availableWorkstations}
            icon={<AvailableIcon sx={{ fontSize: 28 }} />}
            color="#27AE60"
            subtitle="ready for use"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Occupied"
            value={occupiedWorkstations}
            icon={<OccupiedIcon sx={{ fontSize: 28 }} />}
            color="#F39C12"
            subtitle="currently in use"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Staff Assigned"
            value={assignedWorkstations}
            icon={<GroupsIcon sx={{ fontSize: 28 }} />}
            color="#3498DB"
            subtitle="with assigned staff"
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
              placeholder="Search workstations..."
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
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out-of-order">Out of Order</MenuItem>
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
          <Tab label={`All Workstations (${workstations.length})`} />
          <Tab label={`Available (${availableWorkstations})`} />
          <Tab label={`Occupied (${occupiedWorkstations})`} />
          <Tab label={`Assigned (${assignedWorkstations})`} />
        </Tabs>

        {/* Workstation Grid */}
        <TabPanel value={tabValue} index={tabValue}>
          <Box sx={{ p: 3 }}>
            {currentWorkstations.length > 0 ? (
              <Grid container spacing={3}>
                {currentWorkstations.map((workstation) => (
                  <Grid item xs={12} sm={6} md={4} key={workstation.id}>
                    <WorkstationCard
                      workstation={workstation}
                      onMenuClick={handleMenuClick}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  gap: 2,
                }}
              >
                <WorkstationIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  {workstations.length === 0 ? 'No workstations found' : 'No workstations match your filters'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workstations.length === 0 ? 'Create your first workstation to get started' : 'Try adjusting your search or filters'}
                </Typography>
                {workstations.length === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                      mt: 2,
                    }}
                  >
                    Add Workstation
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(139, 69, 19, 0.08)',
          }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedWorkstation) {
            handleOpenDialog(selectedWorkstation);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: '#8B4513' }} />
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
            <PersonAddIcon fontSize="small" sx={{ color: '#27AE60' }} />
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
              <PersonRemoveIcon fontSize="small" sx={{ color: '#F39C12' }} />
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
            <AssignmentIcon fontSize="small" sx={{ color: '#3498DB' }} />
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
      <Dialog 
        open={isDialogOpen} 
        onClose={handleCloseDialog} 
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
              {editingWorkstation ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingWorkstation ? 'Edit Workstation' : 'Add New Workstation'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingWorkstation ? 'Update workstation information' : 'Create a new salon workstation'}
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
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8B4513' }}>
                Workstation Information
              </Typography>
              <Divider sx={{ mb: 3, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Workstation Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Station 1, Nail Booth A"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkstationIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              <FormControl fullWidth required>
                <InputLabel>Workstation Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Workstation Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  {workstationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BuildIcon sx={{ fontSize: 20, color: '#8B4513' }} />
                        {type}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'occupied' | 'maintenance' | 'out-of-order' }))}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(139, 69, 19, 0.2)',
                    }
                  }}
                >
                  <MenuItem value="available">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AvailableIcon sx={{ fontSize: 20, color: '#27AE60' }} />
                      Available
                    </Box>
                  </MenuItem>
                  <MenuItem value="occupied">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <OccupiedIcon sx={{ fontSize: 20, color: '#F39C12' }} />
                      Occupied
                    </Box>
                  </MenuItem>
                  <MenuItem value="maintenance">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <MaintenanceIcon sx={{ fontSize: 20, color: '#3498DB' }} />
                      Maintenance
                    </Box>
                  </MenuItem>
                  <MenuItem value="out-of-order">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <OutOfOrderIcon sx={{ fontSize: 20, color: '#E74C3C' }} />
                      Out of Order
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Preview */}
            {(formData.name || formData.type) && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 2, color: '#8B4513' }}>
                    Workstation Preview
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
                            backgroundColor: '#8B4513',
                          }}
                        >
                          {(formData.name || 'WS').split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formData.name || 'Workstation Name'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formData.type || 'Type'}
                          </Typography>
                        </Box>
                        <Chip
                          label={formData.status.replace('-', ' ').toUpperCase()}
                          sx={{
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            color: '#8B4513',
                            fontWeight: 500,
                          }}
                        />
                      </Box>
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
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim() || !formData.type.trim() || loading}
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
            {editingWorkstation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Assignment Dialog */}
      <Dialog 
        open={isStaffDialogOpen} 
        onClose={handleCloseStaffDialog} 
        maxWidth="sm" 
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
                background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
              }}
            >
              <PersonAddIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Assign Staff
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assign staff to {selectedWorkstation?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseStaffDialog}
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
          <FormControl fullWidth>
            <InputLabel>Select Staff Member</InputLabel>
            <Select
              value={selectedStaffId}
              label="Select Staff Member"
              onChange={(e) => setSelectedStaffId(e.target.value)}
              disabled={availableStaff.length === 0}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(139, 69, 19, 0.2)',
                }
              }}
            >
              {availableStaff.length === 0 ? (
                <MenuItem value="" disabled>
                  No staff available
                </MenuItem>
              ) : (
                availableStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#27AE60',
                          fontSize: '0.8rem',
                        }}
                      >
                        {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {staff.first_name} {staff.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {staff.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          
          {availableStaff.length === 0 && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              No staff available to assign. Please add staff users first.
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          
          {assignError && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {assignError}
            </Alert>
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
            onClick={handleCloseStaffDialog}
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
            onClick={handleAssignStaff}
            variant="contained"
            disabled={!selectedStaffId || loading}
            sx={{
              background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #2ECC71 0%, #27AE60 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(39, 174, 96, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Assign Staff
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointments Dialog */}
      <Dialog 
        open={isAppointmentsDialogOpen} 
        onClose={handleCloseAppointmentsDialog} 
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
                background: 'linear-gradient(135deg, #3498DB 0%, #5DADE2 100%)',
              }}
            >
              <AssignmentIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Appointments for {selectedWorkstation?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseAppointmentsDialog}
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
          {(workstationAppointments && workstationAppointments.length > 0) ? (
            <Grid container spacing={3}>
              {workstationAppointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card
                    sx={{
                      border: '1px solid rgba(139, 69, 19, 0.08)',
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {appointment.customer_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {appointment.service}
                          </Typography>
                          <Typography variant="body2">
                            {appointment.appointment_date} at {appointment.appointment_time}
                          </Typography>
                        </Box>
                        <Chip
                          label={appointment.status}
                          color={getStatusChipColor(appointment.status)}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                          <Button
                            key={status}
                            size="small"
                            variant={appointment.status === status ? 'contained' : 'outlined'}
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, status)}
                            disabled={appointment.status === status || loading}
                            sx={{ 
                              textTransform: 'capitalize',
                              borderRadius: 1,
                            }}
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
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                gap: 2,
              }}
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
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(139, 69, 19, 0.08)',
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, rgba(212, 175, 55, 0.02) 100%)',
          }}
        >
          <Button 
            onClick={handleCloseAppointmentsDialog}
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workstations;