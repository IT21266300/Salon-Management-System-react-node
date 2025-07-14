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
  ListItemText,
  Paper,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Brightness4 as ThemeIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { lowStockAlerts } = useSelector((state: RootState) => state.inventory);
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#D4AF37';
      case 'manager': return '#8B4513';
      case 'employee': return '#2C3E50';
      default: return '#666';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F0 100%)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, rgba(212, 175, 55, 0.02) 100%)',
          zIndex: 0,
        }
      }}
    >
      {/* Left Section - Greeting */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
        <Box>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2C3E50 0%, #8B4513 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            {getGreeting()}, {user?.firstName}! 👋
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Today is a great day to shine ✨
            </Typography>
            <Chip
              label={getCurrentTime()}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 500,
                bgcolor: 'rgba(139, 69, 19, 0.1)',
                color: '#8B4513',
                border: '1px solid rgba(139, 69, 19, 0.2)',
                '& .MuiChip-label': {
                  px: 1,
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Right Section - Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', zIndex: 1 }}>
        {/* Search Button */}
        <Tooltip title="Search" arrow>
          <IconButton 
            sx={{ 
              color: 'text.secondary',
              bgcolor: 'rgba(139, 69, 19, 0.05)',
              border: '1px solid rgba(139, 69, 19, 0.1)',
              '&:hover': { 
                bgcolor: 'rgba(139, 69, 19, 0.1)',
                color: '#8B4513',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Performance Indicator */}
        <Tooltip title="Today's Performance" arrow>
          <IconButton 
            sx={{ 
              color: 'text.secondary',
              bgcolor: 'rgba(39, 174, 96, 0.05)',
              border: '1px solid rgba(39, 174, 96, 0.1)',
              '&:hover': { 
                bgcolor: 'rgba(39, 174, 96, 0.1)',
                color: '#27AE60',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <TrendingIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <Tooltip title={`${lowStockAlerts.length} notifications`} arrow>
          <IconButton 
            onClick={handleNotificationMenu}
            sx={{ 
              color: 'text.secondary',
              bgcolor: lowStockAlerts.length > 0 ? 'rgba(231, 76, 60, 0.05)' : 'rgba(139, 69, 19, 0.05)',
              border: `1px solid ${lowStockAlerts.length > 0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(139, 69, 19, 0.1)'}`,
              '&:hover': { 
                bgcolor: lowStockAlerts.length > 0 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(139, 69, 19, 0.1)',
                color: lowStockAlerts.length > 0 ? '#E74C3C' : '#8B4513',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
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
                  borderRadius: '50%',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)',
                }
              }}
            >
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Profile Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            ml: 2,
            p: 1,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
            }
          }}
          onClick={handleMenu}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              background: `linear-gradient(135deg, ${getRoleColor(user?.role || 'employee')} 0%, ${getRoleColor(user?.role || 'employee')}CC 100%)`,
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
                lineHeight: 1.2,
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: getRoleColor(user?.role || 'employee'),
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {user?.role}
            </Typography>
          </Box>
          
          <MoreIcon 
            sx={{ 
              fontSize: 16, 
              color: 'text.secondary',
              transition: 'transform 0.2s ease-in-out',
            }} 
          />
        </Box>

        {/* Notification Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 320,
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              '& .MuiMenuItem-root': {
                borderRadius: 2,
                mx: 1,
                my: 0.5,
              }
            }
          }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {lowStockAlerts.length} new alerts
            </Typography>
          </Box>
          <Divider />
          
          {lowStockAlerts.length > 0 ? (
            lowStockAlerts.slice(0, 5).map((alert, index) => (
              <MenuItem key={index} onClick={handleNotificationClose}>
                <ListItemIcon>
                  <WarningIcon sx={{ color: '#E74C3C', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={`Low stock: ${alert.name}`}
                  secondary={`Only ${alert.stock} left`}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <ListItemText
                primary="No new notifications"
                primaryTypographyProps={{ fontSize: '0.875rem', textAlign: 'center' }}
              />
            </MenuItem>
          )}
          
          {lowStockAlerts.length > 5 && (
            <>
              <Divider />
              <MenuItem onClick={handleNotificationClose}>
                <ListItemText
                  primary={`View all ${lowStockAlerts.length} notifications`}
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem', 
                    fontWeight: 600,
                    color: 'primary.main',
                    textAlign: 'center' 
                  }}
                />
              </MenuItem>
            </>
          )}
        </Menu>

        {/* User Menu */}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              '& .MuiMenuItem-root': {
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: 'rgba(139, 69, 19, 0.08)',
                },
              }
            }
          }}
        >
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon sx={{ color: '#8B4513', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </MenuItem>
          
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: '#8B4513', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </MenuItem>
          
          <MenuItem>
            <ListItemIcon>
              <ThemeIcon sx={{ color: '#8B4513', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Dark Mode" 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={handleLogout}
            sx={{
              '&:hover': {
                bgcolor: 'rgba(231, 76, 60, 0.08)',
                '& .MuiListItemIcon-root': {
                  color: '#E74C3C',
                },
                '& .MuiListItemText-primary': {
                  color: '#E74C3C',
                }
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#E74C3C', fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;