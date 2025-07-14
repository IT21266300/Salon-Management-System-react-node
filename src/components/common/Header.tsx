import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Chip,
  Divider,
  ListItemIcon,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  NotificationsActive as NotificationsActiveIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { lowStockAlerts } = useSelector((state: RootState) => state.inventory);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#E74C3C';
      case 'manager': return '#F39C12';
      case 'employee': return '#27AE60';
      default: return theme.palette.secondary.main;
    }
  };

  const getOnlineStatus = () => {
    // This could be connected to actual online status logic
    return true;
  };

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        py: 2,
        px: 3,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139, 69, 19, 0.08)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 20%, rgba(212, 175, 55, 0.8) 50%, rgba(212, 175, 55, 0.3) 80%, transparent 100%)',
        }
      }}
    >
      {/* Welcome Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 0.5,
            background: 'linear-gradient(135deg, #2C3E50 0%, #8B4513 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {getCurrentGreeting()}, {user?.firstName}!
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
          <CircleIcon sx={{ fontSize: 4, color: theme.palette.text.secondary }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CircleIcon sx={{ fontSize: 8, color: '#27AE60' }} />
            System Online
          </Box>
        </Typography>
      </Box>

      {/* Actions Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Notifications */}
        <Tooltip title={lowStockAlerts.length > 0 ? `${lowStockAlerts.length} low stock alerts` : 'No notifications'}>
          <IconButton 
            onClick={handleNotificationMenu}
            sx={{
              position: 'relative',
              borderRadius: 2,
              padding: 1.5,
              background: lowStockAlerts.length > 0 
                ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.2) 100%)'
                : 'rgba(139, 69, 19, 0.05)',
              border: `1px solid ${lowStockAlerts.length > 0 ? 'rgba(231, 76, 60, 0.2)' : 'rgba(139, 69, 19, 0.1)'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: lowStockAlerts.length > 0 
                  ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(231, 76, 60, 0.25) 100%)'
                  : 'rgba(139, 69, 19, 0.08)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }
            }}
          >
            <Badge 
              badgeContent={lowStockAlerts.length} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  minWidth: 18,
                  height: 18,
                }
              }}
            >
              {lowStockAlerts.length > 0 ? (
                <NotificationsActiveIcon sx={{ color: '#E74C3C', fontSize: 20 }} />
              ) : (
                <NotificationsIcon sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
              )}
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            padding: '8px 16px',
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(212, 175, 55, 0.08) 100%)',
            border: '1px solid rgba(139, 69, 19, 0.12)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.12) 0%, rgba(212, 175, 55, 0.12) 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            }
          }}
          onClick={handleMenu}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                lineHeight: 1.2
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Chip
                label={
                  user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : ''
                }
                size="small"
                sx={{
                  backgroundColor: getRoleColor(user?.role || ''),
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.65rem',
                  height: 18,
                  '& .MuiChip-label': {
                    px: 0.8,
                  }
                }}
              />
              {getOnlineStatus() && (
                <Tooltip title="Online">
                  <CircleIcon sx={{ fontSize: 8, color: '#27AE60' }} />
                </Tooltip>
              )}
            </Box>
          </Box>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              background: `linear-gradient(135deg, ${getRoleColor(user?.role || '')} 0%, ${getRoleColor(user?.role || '')}CC 100%)`,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: `0 3px 10px ${getRoleColor(user?.role || '')}30`,
              border: '2px solid rgba(255,255,255,0.9)'
            }}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
        </Box>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 280,
              maxWidth: 320,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.08)',
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {lowStockAlerts.length > 0 ? `${lowStockAlerts.length} alerts` : 'No new notifications'}
            </Typography>
          </Box>
          {lowStockAlerts.length > 0 ? (
            lowStockAlerts.slice(0, 5).map((alert, index) => (
              <MenuItem key={index} sx={{ py: 1.5, borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                <ListItemIcon>
                  <CircleIcon sx={{ fontSize: 8, color: '#E74C3C' }} />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Low Stock Alert
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {alert.name || `Product ID: ${alert.id}`} - {alert.stock} remaining
                  </Typography>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', width: '100%' }}>
                No notifications at this time
              </Typography>
            </MenuItem>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.08)',
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {user?.email}
            </Typography>
          </Box>
          <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: theme.palette.text.secondary }} />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: theme.palette.text.secondary }} />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#E74C3C' }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#E74C3C' }} />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;