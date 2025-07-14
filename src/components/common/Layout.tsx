import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop,
  Paper,
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 280;
const collapsedDrawerWidth = 80;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerCollapse = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const currentDrawerWidth = isMobile ? drawerWidth : (isCollapsed ? collapsedDrawerWidth : drawerWidth);

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {/* Enhanced AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          bgcolor: 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          background: isScrolled 
            ? 'rgba(255, 255, 255, 0.9)' 
            : 'linear-gradient(135deg, #FFFFFF 0%, #F8F6F0 100%)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
          boxShadow: isScrolled 
            ? '0 4px 20px rgba(0, 0, 0, 0.08)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar 
          sx={{ 
            minHeight: { xs: 64, sm: 70 },
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              bgcolor: 'rgba(139, 69, 19, 0.08)',
              border: '1px solid rgba(139, 69, 19, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(139, 69, 19, 0.15)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          {/* Desktop Collapse Button */}
          <IconButton
            color="inherit"
            aria-label="collapse drawer"
            edge="start"
            onClick={handleDrawerCollapse}
            sx={{ 
              mr: 2, 
              display: { xs: 'none', md: 'flex' },
              bgcolor: 'rgba(139, 69, 19, 0.08)',
              border: '1px solid rgba(139, 69, 19, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(139, 69, 19, 0.15)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <ChevronLeftIcon 
              sx={{
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-in-out',
              }}
            />
          </IconButton>

          <Header />
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: currentDrawerWidth }, 
          flexShrink: { md: 0 },
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              border: 'none',
              boxShadow: '2px 0 12px rgba(0, 0, 0, 0.08)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflowX: 'hidden',
            },
          }}
          open
        >
          <Sidebar collapsed={isCollapsed} />
        </Drawer>
      </Box>

      {/* Mobile Backdrop */}
      <Backdrop
        open={mobileOpen && isMobile}
        onClick={handleDrawerToggle}
        sx={{
          display: { md: 'none' },
          zIndex: theme.zIndex.drawer - 1,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            pt: { xs: 10, sm: 11 },
            pb: 3,
            px: { xs: 2, sm: 3, lg: 4 },
            minHeight: 'calc(100vh - 88px)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(135deg, rgba(248, 246, 240, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
              zIndex: -1,
              borderRadius: '0 0 20px 20px',
            }
          }}
        >
          {/* Content Wrapper with Animation */}
          <Fade in timeout={300}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'transparent',
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {children}
            </Paper>
          </Fade>
        </Box>

        {/* Floating Action Area - Optional */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: theme.zIndex.speedDial,
            display: { xs: 'none', lg: 'block' },
          }}
        >
          {/* Add floating action buttons here if needed */}
        </Box>
      </Box>

      {/* Background Pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
          background: `
            radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(44, 62, 80, 0.02) 0%, transparent 50%)
          `,
        }}
      />
    </Box>
  );
};

export default Layout;