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
} from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 280;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FAFAFA 0%, #F8F6F0 100%)',
        position: 'relative',
      }}
    >
      {/* Enhanced AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: isScrolled 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,246,240,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(139, 69, 19, 0.12)' : 'rgba(139, 69, 19, 0.08)'}`,
          boxShadow: isScrolled 
            ? '0 4px 20px rgba(0,0,0,0.08)' 
            : '0 2px 8px rgba(0,0,0,0.04)',
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              borderRadius: 2,
              p: 1.5,
              color: theme.palette.text.primary,
              background: 'rgba(139, 69, 19, 0.05)',
              border: '1px solid rgba(139, 69, 19, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(139, 69, 19, 0.08)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Header Component */}
          <Header />
        </Toolbar>
      </AppBar>

      {/* Enhanced Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
          zIndex: theme.zIndex.drawer,
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
            BackdropComponent: Backdrop,
            BackdropProps: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
              }
            }
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              background: 'linear-gradient(180deg, #1A1A1A 0%, #2C3E50 100%)',
              boxShadow: '8px 0 32px rgba(0,0,0,0.3)',
            },
          }}
        >
          {/* Mobile Close Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              p: 1,
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <IconButton
              onClick={handleDrawerClose}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Sidebar />
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              background: 'linear-gradient(180deg, #1A1A1A 0%, #2C3E50 100%)',
              boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
              borderRight: '1px solid rgba(212, 175, 55, 0.2)',
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Enhanced Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Content Container */}
        <Box
          sx={{
            pt: { xs: '84px', sm: '94px', md: '90px' }, // Responsive padding accounting for Header height
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 3, sm: 4 },
            minHeight: 'calc(100vh - 84px)', // Adjusted accordingly
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(212, 175, 55, 0.02) 0%, transparent 50%)
              `,
              pointerEvents: 'none',
              zIndex: 0,
            }
          }}
        >
          {/* Content Wrapper with Animation */}
          <Fade in timeout={300}>
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                maxWidth: '1400px',
                mx: 'auto',
                '& > *': {
                  animation: 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '@keyframes slideInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              {children}
            </Box>
          </Fade>
        </Box>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: { md: drawerWidth },
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(139, 69, 19, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(-50%, 50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </Box>

      {/* Mobile Overlay for Drawer */}
      {isMobile && mobileOpen && (
        <Box
          onClick={handleDrawerClose}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: theme.zIndex.drawer - 1,
          }}
        />
      )}
    </Box>
  );
};

export default Layout;