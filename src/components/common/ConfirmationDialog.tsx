import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  CircularProgress,
  useTheme,
  Chip,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Close as CloseIcon,
  DeleteForever as DeleteIcon,
  Save as SaveIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info' | 'success' | 'delete' | 'save';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

// Slide transition component
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  maxWidth = 'sm',
  severity = 'medium',
  details,
}) => {
  const theme = useTheme();

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: ErrorIcon,
          color: '#E74C3C',
          bgColor: 'rgba(231, 76, 60, 0.08)',
          borderColor: 'rgba(231, 76, 60, 0.2)',
          buttonColor: '#E74C3C',
          iconBg: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.2) 100%)',
        };
      case 'warning':
        return {
          icon: WarningIcon,
          color: '#F39C12',
          bgColor: 'rgba(243, 156, 18, 0.08)',
          borderColor: 'rgba(243, 156, 18, 0.2)',
          buttonColor: '#F39C12',
          iconBg: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.2) 100%)',
        };
      case 'info':
        return {
          icon: InfoIcon,
          color: '#3498DB',
          bgColor: 'rgba(52, 152, 219, 0.08)',
          borderColor: 'rgba(52, 152, 219, 0.2)',
          buttonColor: '#3498DB',
          iconBg: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.2) 100%)',
        };
      case 'success':
        return {
          icon: SuccessIcon,
          color: '#27AE60',
          bgColor: 'rgba(39, 174, 96, 0.08)',
          borderColor: 'rgba(39, 174, 96, 0.2)',
          buttonColor: '#27AE60',
          iconBg: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.2) 100%)',
        };
      case 'delete':
        return {
          icon: DeleteIcon,
          color: '#E74C3C',
          bgColor: 'rgba(231, 76, 60, 0.08)',
          borderColor: 'rgba(231, 76, 60, 0.2)',
          buttonColor: '#E74C3C',
          iconBg: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.2) 100%)',
        };
      case 'save':
        return {
          icon: SaveIcon,
          color: '#8B4513',
          bgColor: 'rgba(139, 69, 19, 0.08)',
          borderColor: 'rgba(139, 69, 19, 0.2)',
          buttonColor: '#8B4513',
          iconBg: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.2) 100%)',
        };
      default:
        return {
          icon: WarningIcon,
          color: '#F39C12',
          bgColor: 'rgba(243, 156, 18, 0.08)',
          borderColor: 'rgba(243, 156, 18, 0.2)',
          buttonColor: '#F39C12',
          iconBg: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.2) 100%)',
        };
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'low': return '#27AE60';
      case 'medium': return '#F39C12';
      case 'high': return '#E67E22';
      case 'critical': return '#E74C3C';
      default: return '#F39C12';
    }
  };

  const getSeverityLabel = () => {
    switch (severity) {
      case 'low': return 'Low Priority';
      case 'medium': return 'Medium Priority';
      case 'high': return 'High Priority';
      case 'critical': return 'Critical Action';
      default: return 'Medium Priority';
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  return (
    <Dialog
      open={open}
      onClose={!loading ? onCancel : undefined}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,246,240,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${typeConfig.borderColor}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px ${typeConfig.borderColor}`,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, transparent 0%, ${typeConfig.color}60 20%, ${typeConfig.color} 50%, ${typeConfig.color}60 80%, transparent 100%)`,
          }
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 2,
          pt: 3,
          px: 4,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h5" 
            component="div"
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              lineHeight: 1.2
            }}
          >
            {title}
          </Typography>
          {(severity !== 'medium' || type === 'delete' || type === 'error') && (
            <Chip
              label={getSeverityLabel()}
              size="small"
              sx={{
                backgroundColor: getSeverityColor(),
                color: 'white',
                fontWeight: 500,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          )}
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onCancel}
          aria-label="close"
          disabled={loading}
          size="small"
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: 'rgba(139, 69, 19, 0.08)',
              color: theme.palette.text.primary,
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pt: 1, pb: 3, px: 4 }}>
        {/* Icon Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: typeConfig.iconBg,
              border: `2px solid ${typeConfig.color}40`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: -12,
                borderRadius: '50%',
                background: `${typeConfig.bgColor}`,
                zIndex: -1,
              }
            }}
          >
            <IconComponent
              sx={{
                fontSize: 42,
                color: typeConfig.color,
              }}
            />
          </Box>
        </Box>
        
        {/* Message */}
        <Typography 
          variant="body1" 
          sx={{
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
            lineHeight: 1.6,
            mb: details ? 2 : 0,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>

        {/* Additional Details */}
        {details && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: typeConfig.bgColor,
              border: `1px solid ${typeConfig.borderColor}`,
            }}
          >
            <Typography 
              variant="body2" 
              sx={{
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
                lineHeight: 1.5,
              }}
            >
              {details}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          px: 4, 
          pb: 4, 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          fullWidth
          size="large"
          sx={{
            borderColor: theme.palette.text.secondary,
            color: theme.palette.text.secondary,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            borderWidth: 2,
            '&:hover': {
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary,
              backgroundColor: 'rgba(139, 69, 19, 0.04)',
              borderWidth: 2,
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          fullWidth
          size="large"
          autoFocus={!loading}
          startIcon={loading ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : undefined}
          sx={{
            backgroundColor: typeConfig.buttonColor,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            boxShadow: `0 4px 16px ${typeConfig.color}40`,
            '&:hover': {
              backgroundColor: typeConfig.buttonColor,
              filter: 'brightness(0.9)',
              transform: 'translateY(-1px)',
              boxShadow: `0 6px 20px ${typeConfig.color}50`,
            },
            '&:disabled': {
              backgroundColor: typeConfig.buttonColor,
              opacity: 0.7,
            },
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;