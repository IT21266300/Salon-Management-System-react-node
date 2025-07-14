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
  Badge,
  Chip,
  IconButton,
  Tooltip,
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
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, badge: null },
  { path: '/appointments', label: 'Appointments', icon: <EventIcon />, badge: '12' },
  { path: '/customers', label: 'Customers', icon: <PersonIcon />, badge: null },
  { path: '/services', label: 'Services', icon: <ServicesIcon />, badge: null },
  { path: '/workstations', label: 'Workstations', icon: <WorkstationsIcon />, badge: null },
  { path: '/suppliers', label: 'Suppliers', icon: <SupplierIcon />, badge: null },
  { path: '/inventory', label: 'Inventory', icon: <InventoryIcon />, badge: '3' },
  { path: '/sales', label: 'Sales', icon: <SalesIcon />, badge: null },
  { path: '/reports', label: 'Reports', icon: <ReportsIcon />, badge: null },
];

const adminItems = [
  { path: '/administration', label: 'Administration', icon: <AdminIcon />, badge: null },
];

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'manager';

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#D4AF37';
      case 'manager': return '#8B4513';
      case 'employee': return '#2C3E50';
      default: return '#666';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'manager': return '⭐';
      case 'employee': return '💼';
      default: return '👤';
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #1A1A1A 0%, #2C3E50 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(139, 69, 19, 0.1) 100%)',
          zIndex: 0,
        }
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: collapsed ? 1 : 3, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={{ position: 'relative', mb: collapsed ? 1 : 2 }}>
          <Avatar 
            sx={{ 
              width: collapsed ? 50 : 70, 
              height: collapsed ? 50 : 70, 
              mx: 'auto', 
              mb: collapsed ? 1 : 2, 
              background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
              boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
              border: '3px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease',
            }}
          >
            <SpaIcon sx={{ fontSize: collapsed ? 24 : 36, color: '#1A1A1A', transition: 'all 0.3s ease' }} />
          </Avatar>
          {!collapsed && (
            <Box
              sx={{
                position: 'absolute',
                top: -5,
                right: 'calc(50% - 45px)',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
                border: '2px solid #1A1A1A',
                boxShadow: '0 0 10px rgba(46, 204, 113, 0.5)',
              }}
            />
          )}
        </Box>
        
        {!collapsed && (
          <>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Brilliance Salon
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Management System
            </Typography>
          </>
        )}
      </Box>

      {/* Stylized Divider */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box
          sx={{
            position: 'absolute',
            top: -1,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
          }}
        />
      </Box>

      {/* User Info Card */}
      {user && (
        <Box sx={{ p: collapsed ? 1 : 2, position: 'relative', zIndex: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              p: collapsed ? 1 : 2,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              position: 'relative',
              overflow: 'hidden',
              flexDirection: collapsed ? 'column' : 'row',
              gap: collapsed ? 1 : 0,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%)',
                zIndex: 0,
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: collapsed ? 32 : 40, 
                height: collapsed ? 32 : 40, 
                mr: collapsed ? 0 : 2, 
                background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}CC 100%)`,
                fontSize: collapsed ? '0.8rem' : '1rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </Avatar>
            
            {!collapsed && (
              <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    lineHeight: 1.2,
                  }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={`${getRoleIcon(user.role)} ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 500,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: getRoleColor(user.role),
                      border: `1px solid ${getRoleColor(user.role)}40`,
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                </Box>
              </Box>
            )}

            {!collapsed && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="Settings">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      '&:hover': { 
                        color: '#D4AF37',
                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                      }
                    }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Notifications">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.6)',
                      '&:hover': { 
                        color: '#D4AF37',
                        bgcolor: 'rgba(212, 175, 55, 0.1)',
                      }
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #D4AF37 0%, #B8860B 100%)',
            borderRadius: '10px',
            '&:hover': {
              background: 'linear-gradient(180deg, #F4D03F 0%, #D4AF37 100%)',
            },
          },
          '&::-webkit-scrollbar-thumb:active': {
            background: 'linear-gradient(180deg, #B8860B 0%, #8B6914 100%)',
          },
        }}
      >
        <List sx={{ pt: 2, px: collapsed ? 1 : 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <Tooltip title={collapsed ? item.label : ''} placement="right">
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: collapsed ? 1 : 2,
                    py: 1.5,
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: isSelected ? 'linear-gradient(180deg, #D4AF37 0%, #F4D03F 100%)' : 'transparent',
                      borderRadius: '0 4px 4px 0',
                      transition: 'all 0.3s ease',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(212, 175, 55, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      boxShadow: '0 4px 20px rgba(212, 175, 55, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(212, 175, 55, 0.2)',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                      '& .MuiListItemIcon-root': {
                        color: '#D4AF37',
                      },
                      '& .arrow-icon': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
                      minWidth: collapsed ? 'auto' : 40,
                      justifyContent: 'center',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {!collapsed && (
                    <>
                      <ListItemText 
                        primary={item.label}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.9)',
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                          }
                        }}
                      />
                      
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: '#E74C3C',
                            color: 'white',
                            mr: 1,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }}
                        />
                      )}
                      
                      <ArrowIcon 
                        className="arrow-icon"
                        sx={{
                          fontSize: 16,
                          color: 'rgba(255, 255, 255, 0.4)',
                          opacity: isSelected ? 1 : 0,
                          transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </>
                  )}
                  
                  {collapsed && item.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#E74C3C',
                        border: '1px solid #1A1A1A',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}

        {canAccessAdmin && (
          <>
            {!collapsed && (
              <>
                <Box sx={{ my: 3, position: 'relative' }}>
                  <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -1,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 40,
                      height: 2,
                      background: 'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
                    }}
                  />
                </Box>
                
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    px: 2,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Administration
                </Typography>
              </>
            )}
            
            {adminItems.map((item) => {
              const isSelected = location.pathname === item.path;
              
              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                  <Tooltip title={collapsed ? item.label : ''} placement="right">
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        px: collapsed ? 1 : 2,
                        py: 1.5,
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 4,
                          background: isSelected ? 'linear-gradient(180deg, #D4AF37 0%, #F4D03F 100%)' : 'transparent',
                          borderRadius: '0 4px 4px 0',
                          transition: 'all 0.3s ease',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(212, 175, 55, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(212, 175, 55, 0.2)',
                          boxShadow: '0 4px 20px rgba(212, 175, 55, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(212, 175, 55, 0.2)',
                          },
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          transform: collapsed ? 'scale(1.05)' : 'translateX(4px)',
                          '& .MuiListItemIcon-root': {
                            color: '#D4AF37',
                          },
                          '& .arrow-icon': {
                            opacity: 1,
                            transform: 'translateX(4px)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon 
                        sx={{ 
                          color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.7)',
                          minWidth: collapsed ? 'auto' : 40,
                          justifyContent: 'center',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      
                      {!collapsed && (
                        <>
                          <ListItemText 
                            primary={item.label}
                            sx={{
                              '& .MuiListItemText-primary': {
                                color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.9)',
                                fontWeight: isSelected ? 600 : 500,
                                fontSize: '0.875rem',
                                transition: 'all 0.3s ease',
                              }
                            }}
                          />
                          
                          <ArrowIcon 
                            className="arrow-icon"
                            sx={{
                              fontSize: 16,
                              color: 'rgba(255, 255, 255, 0.4)',
                              opacity: isSelected ? 1 : 0,
                              transform: isSelected ? 'translateX(4px)' : 'translateX(0)',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        </>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </>
        )}
      </List>
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            © 2024 Brilliance Salon
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;