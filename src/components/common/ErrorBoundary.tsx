import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle,
  Stack,
  Divider,
  Chip,
  Collapse,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  BugReport as BugReportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Home as HomeIcon,
  Support as SupportIcon,
  ErrorOutline as ErrorIcon,
  Spa as SpaIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  errorId: string;
}

// Error details component with theme support
const ErrorDetails: React.FC<{ 
  error: Error | null, 
  errorInfo: ErrorInfo | null,
  showDetails: boolean,
  onToggle: () => void,
  errorId: string
}> = ({ error, errorInfo, showDetails, onToggle, errorId }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Button
        onClick={onToggle}
        startIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ 
          mb: 2,
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(139, 69, 19, 0.04)',
          }
        }}
      >
        {showDetails ? 'Hide' : 'Show'} Technical Details
      </Button>
      
      <Collapse in={showDetails}>
        <Alert 
          severity="error" 
          sx={{ 
            textAlign: 'left',
            borderRadius: 2,
            border: '1px solid rgba(231, 76, 60, 0.2)',
            backgroundColor: 'rgba(231, 76, 60, 0.05)',
          }}
        >
          <AlertTitle sx={{ fontWeight: 600 }}>Error Information</AlertTitle>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Error ID: <Chip label={errorId} size="small" sx={{ ml: 1, fontSize: '0.7rem' }} />
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Message: <span style={{ fontWeight: 400 }}>{error?.message || 'Unknown error'}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Type: <span style={{ fontWeight: 400 }}>{error?.name || 'Error'}</span>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Time: <span style={{ fontWeight: 400 }}>{new Date().toLocaleString()}</span>
            </Typography>
          </Box>

          {import.meta.env.DEV && error?.stack && (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Stack Trace:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                {error.stack}
              </Typography>
            </Box>
          )}

          {import.meta.env.DEV && errorInfo?.componentStack && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                Component Stack:
              </Typography>
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto',
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              >
                {errorInfo.componentStack}
              </Typography>
            </Box>
          )}
        </Alert>
      </Collapse>
    </Box>
  );
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', this.state.errorId);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo, this.state.errorId);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: '',
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleToggleDetails = () => {
    this.setState({ showDetails: !this.state.showDetails });
  };

  handleContactSupport = () => {
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${this.state.errorId}\n` +
      `Error Message: ${this.state.error?.message || 'Unknown error'}\n` +
      `Time: ${new Date().toLocaleString()}\n` +
      `Page: ${window.location.href}\n\n` +
      `Please describe what you were doing when this error occurred:\n\n`
    );
    window.open(`mailto:support@brilliancesalon.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            background: 'linear-gradient(135deg, #F8F6F0 0%, #FAFAFA 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              maxWidth: 700,
              width: '100%',
              textAlign: 'center',
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 69, 19, 0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.6) 20%, rgba(212, 175, 55, 1) 50%, rgba(212, 175, 55, 0.6) 80%, transparent 100%)',
              }
            }}
          >
            {/* Logo and Brand */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.2) 100%)',
                  border: '2px solid rgba(231, 76, 60, 0.2)',
                  mb: 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -8,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(231, 76, 60, 0.1) 100%)',
                    zIndex: -1,
                  }
                }}
              >
                <ErrorIcon
                  sx={{
                    fontSize: 48,
                    color: '#E74C3C',
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <SpaIcon sx={{ color: '#8B4513', fontSize: 24 }} />
                <Typography variant="h6" sx={{ color: '#8B4513', fontWeight: 600 }}>
                  Brilliance Salon
                </Typography>
              </Box>
            </Box>
            
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Oops! Something went wrong
            </Typography>
            
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{ 
                mb: 3,
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              We're sorry for the inconvenience. Our system encountered an unexpected error, 
              but don't worry - we're here to help you get back on track.
            </Typography>

            {/* Quick Actions */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshIcon />}
                onClick={this.handleRefresh}
                sx={{
                  background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                  px: 3,
                  py: 1.5,
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
                Refresh Page
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                sx={{
                  borderColor: '#8B4513',
                  color: '#8B4513',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.04)',
                    borderWidth: 2,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Go to Dashboard
              </Button>
              
              <Button
                variant="text"
                size="large"
                onClick={this.handleReset}
                sx={{
                  color: 'text.secondary',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(139, 69, 19, 0.04)',
                  },
                }}
              >
                Try Again
              </Button>
            </Stack>

            {/* Error Details Section */}
            <ErrorDetails
              error={this.state.error}
              errorInfo={this.state.errorInfo}
              showDetails={this.state.showDetails}
              onToggle={this.handleToggleDetails}
              errorId={this.state.errorId}
            />

            <Divider sx={{ my: 4, backgroundColor: 'rgba(139, 69, 19, 0.1)' }} />

            {/* Support Section */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                Need help? Our support team is here for you.
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<SupportIcon />}
                onClick={this.handleContactSupport}
                sx={{
                  borderColor: '#D4AF37',
                  color: '#D4AF37',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.08)',
                  },
                }}
              >
                Contact Support
              </Button>
              
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
                Error ID: {this.state.errorId} • {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;