import { createContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  SlideProps,
  Box,
  IconButton,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { setGlobalNotificationInstance } from '../utils/globalNotifications';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (message: string, title?: string, options?: Partial<Notification>) => void;
  showError: (message: string, title?: string, options?: Partial<Notification>) => void;
  showWarning: (message: string, title?: string, options?: Partial<Notification>) => void;
  showInfo: (message: string, title?: string, options?: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export { NotificationContext };

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5,
  defaultDuration = 6000 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      id,
      duration: defaultDuration,
      ...notification,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limit the number of notifications displayed
      return updated.slice(0, maxNotifications);
    });

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [generateId, defaultDuration, maxNotifications, removeNotification]);

  const showSuccess = useCallback((message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      ...options,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string, options?: Partial<Notification>) => {
    showNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = useMemo<NotificationContextType>(() => ({
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAll,
  }), [notifications, showNotification, showSuccess, showError, showWarning, showInfo, removeNotification, clearAll]);

  // Set global instance for API service
  useEffect(() => {
    setGlobalNotificationInstance(contextValue);
  }, [contextValue]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
      }}
    >
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          TransitionComponent={SlideTransition}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ 
            position: 'relative',
            transform: 'none !important',
            top: 'auto !important',
            right: 'auto !important',
            left: 'auto !important',
            bottom: 'auto !important',
          }}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            onClose={() => onRemove(notification.id)}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {notification.action && (
                  <Typography
                    component="button"
                    variant="button"
                    sx={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      '&:hover': {
                        textDecoration: 'none',
                      },
                    }}
                    onClick={notification.action.onClick}
                  >
                    {notification.action.label}
                  </Typography>
                )}
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => onRemove(notification.id)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            sx={{
              width: '100%',
              '& .MuiAlert-message': {
                flex: 1,
              },
            }}
          >
            {notification.title && (
              <AlertTitle>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
}
