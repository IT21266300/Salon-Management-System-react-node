import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Person as PersonIcon,
  LocalShipping as SupplierIcon,
  Inventory as InventoryIcon,
  PointOfSale as SalesIcon,
  Assessment as ReportsIcon,
  AdminPanelSettings as AdminIcon,
  Spa as SpaIcon,
  WorkspacePremium as WorkstationsIcon,
  RoomService as ServicesIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useNotifications } from '../../hooks/useNotifications';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, category: 'main' },
  { path: '/appointments', label: 'Appointments', icon: <EventIcon />, category: 'main' },
  { path: '/customers', label: 'Customers', icon: <PersonIcon />, category: 'main' },
  { path: '/services', label: 'Services', icon: <ServicesIcon />, category: 'operations' },
  { path: '/workstations', label: 'Workstations', icon: <WorkstationsIcon />, category: 'operations' },
  { path: '/suppliers', label: 'Suppliers', icon: <SupplierIcon />, category: 'operations' },
  { path: '/inventory', label: 'Inventory', icon: <InventoryIcon />, category: 'business' },
  { path: '/sales', label: 'Sales', icon: <SalesIcon />, category: 'business' },
  { path: '/reports', label: 'Reports', icon: <ReportsIcon />, category: 'business' },
];

const adminItems = [
  { path: '/administration', label: 'Administration', icon: <AdminIcon />, category: 'admin' },
];

const CategoryHeader: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ px: 3, py: 1, mt: 2 }}>
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'rgba(255,255,255,0.6)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontSize: '0.7rem'
      }}
    >
      {title}
    </Typography>
  </Box>
);

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showError } = useNotifications();

  const handleAdminClick = (path: string) => {
    if (user?.role !== 'admin') {
      showError('You have not access', 'Access Denied');
      return;
    }
    navigate(path);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#E74C3C';
      case 'manager': return '#F39C12';
      case 'employee': return '#27AE60';
      default: return theme.palette.secondary.main;
    }
  };

  const mainItems = menuItems.filter(item => item.category === 'main');
  const operationsItems = menuItems.filter(item => item.category === 'operations');
  const businessItems = menuItems.filter(item => item.category === 'business');

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1A1A1A 0%, #2C3E50 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '1px',
          height: '100%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%)',
        }
      }}
    >
      {/* Logo and Brand */}
      <Box sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'inline-block',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(139, 69, 19, 0.2) 100%)',
              zIndex: 0,
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 72, 
              height: 72, 
              mx: 'auto', 
              mb: 3,
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <SpaIcon sx={{ fontSize: 42, color: '#1A1A1A' }} />
          </Avatar>
        </Box>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'white', 
            fontWeight: 700,
            mb: 0.5,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Brilliance Salon
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}
        >
          Management System
        </Typography>
      </Box>

      {/* User Profile */}
      {user && (
        <>
          <Box sx={{ px: 3, pb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.12)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 44, 
                  height: 44, 
                  mr: 2,
                  background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}CC 100%)`,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: `0 4px 12px ${getRoleColor(user.role)}30`,
                }}
              >
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Chip
                  label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  size="small"
                  sx={{
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                    }
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 3 }} />
        </>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        {/* Main Section */}
        <CategoryHeader title="Main" />
        <List dense sx={{ px: 1 }}>
          {mainItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 24,
                      bgcolor: '#D4AF37',
                      borderRadius: '0 2px 2px 0',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#D4AF37',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.3)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  minWidth: 40,
                  transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
                {location.pathname === item.path && (
                  <CircleIcon sx={{ fontSize: 6, color: '#D4AF37', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Operations Section */}
        <CategoryHeader title="Operations" />
        <List dense sx={{ px: 1 }}>
          {operationsItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 24,
                      bgcolor: '#D4AF37',
                      borderRadius: '0 2px 2px 0',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#D4AF37',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.3)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  minWidth: 40,
                  transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
                {location.pathname === item.path && (
                  <CircleIcon sx={{ fontSize: 6, color: '#D4AF37', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Business Section */}
        <CategoryHeader title="Business" />
        <List dense sx={{ px: 1 }}>
          {businessItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                    color: '#D4AF37',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: 24,
                      bgcolor: '#D4AF37',
                      borderRadius: '0 2px 2px 0',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#D4AF37',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(212, 175, 55, 0.3)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  minWidth: 40,
                  transition: 'all 0.3s ease',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                />
                {location.pathname === item.path && (
                  <CircleIcon sx={{ fontSize: 6, color: '#D4AF37', ml: 1 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Admin Section */}
        <>
          <CategoryHeader title="Admin" />
          <List dense sx={{ px: 1, pb: 2 }}>
            {adminItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleAdminClick(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      px: 2,
                      position: 'relative',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(212, 175, 55, 0.2)',
                        color: '#D4AF37',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: 24,
                          bgcolor: '#D4AF37',
                          borderRadius: '0 2px 2px 0',
                        },
                        '& .MuiListItemIcon-root': {
                          color: '#D4AF37',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(212, 175, 55, 0.3)',
                        },
                      },
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.08)',
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      minWidth: 40,
                      transition: 'all 0.3s ease',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                      }}
                    />
                    {location.pathname === item.path && (
                      <CircleIcon sx={{ fontSize: 6, color: '#D4AF37', ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
      </Box>
    </Box>
  );
};

export default Sidebar;