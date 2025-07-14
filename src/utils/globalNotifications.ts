import type { NotificationType } from '../contexts/NotificationContext';

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

// Global notification instance for use outside of React components (like API service)
let globalNotificationInstance: NotificationContextType | null = null;

export function setGlobalNotificationInstance(instance: NotificationContextType) {
  globalNotificationInstance = instance;
}

export function getGlobalNotificationInstance(): NotificationContextType | null {
  return globalNotificationInstance;
}

export function showGlobalSuccess(message: string, title?: string) {
  const instance = getGlobalNotificationInstance();
  if (instance) {
    instance.showSuccess(message, title);
  } else {
    console.log('Success:', title ? `${title}: ${message}` : message);
  }
}

export function showGlobalError(message: string, title?: string) {
  const instance = getGlobalNotificationInstance();
  if (instance) {
    instance.showError(message, title);
  } else {
    console.error('Error:', title ? `${title}: ${message}` : message);
  }
}

export function showGlobalWarning(message: string, title?: string) {
  const instance = getGlobalNotificationInstance();
  if (instance) {
    instance.showWarning(message, title);
  } else {
    console.warn('Warning:', title ? `${title}: ${message}` : message);
  }
}

export function showGlobalInfo(message: string, title?: string) {
  const instance = getGlobalNotificationInstance();
  if (instance) {
    instance.showInfo(message, title);
  } else {
    console.info('Info:', title ? `${title}: ${message}` : message);
  }
}
