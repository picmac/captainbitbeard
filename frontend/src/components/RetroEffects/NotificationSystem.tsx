import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import './NotificationSystem.css';
import { Sounds } from '../../utils/soundSystem';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// ============================================
// NOTIFICATION CONTEXT
// ============================================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// ============================================
// NOTIFICATION PROVIDER
// ============================================

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({ children, maxNotifications = 5 }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };

      setNotifications((prev) => {
        const updated = [...prev, newNotification];

        // Keep only maxNotifications
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }

        return updated;
      });

      // Play sound based on type
      switch (notification.type) {
        case 'success':
          Sounds.ACHIEVEMENT();
          break;
        case 'error':
          Sounds.ERROR();
          break;
        case 'warning':
          Sounds.MENU_NAVIGATE();
          break;
        case 'info':
          Sounds.MENU_SELECT();
          break;
      }

      return id;
    },
    [maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// ============================================
// NOTIFICATION CONTAINER
// ============================================

function NotificationContainer() {
  const { notifications } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

// ============================================
// NOTIFICATION CARD
// ============================================

interface NotificationCardProps {
  notification: Notification;
}

function NotificationCard({ notification }: NotificationCardProps) {
  const { removeNotification } = useNotifications();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
      notification.onClose?.();
    }, 300);
  };

  const handleAction = () => {
    notification.action?.onClick();
    handleClose();
  };

  const icons = {
    success: notification.icon || '✓',
    error: notification.icon || '✖',
    warning: notification.icon || '⚠',
    info: notification.icon || 'ℹ',
  };

  return (
    <div
      className={`notification-card notification-card--${notification.type} ${isExiting ? 'notification-card--exiting' : ''}`}
    >
      <div className="notification-card__icon">{icons[notification.type]}</div>

      <div className="notification-card__content">
        <div className="notification-card__title">{notification.title}</div>
        {notification.message && (
          <div className="notification-card__message">{notification.message}</div>
        )}
        {notification.action && (
          <button onClick={handleAction} className="notification-card__action">
            {notification.action.label}
          </button>
        )}
      </div>

      <button onClick={handleClose} className="notification-card__close">
        ✖
      </button>

      {notification.duration && notification.duration > 0 && (
        <div
          className="notification-card__progress"
          style={{ animationDuration: `${notification.duration}ms` }}
        />
      )}
    </div>
  );
}

// ============================================
// NOTIFICATION HOOKS
// ============================================

export function useToast() {
  const { addNotification } = useNotifications();

  const success = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'success',
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'error',
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'warning',
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string, options?: Partial<Notification>) => {
      return addNotification({
        type: 'info',
        title,
        message,
        ...options,
      });
    },
    [addNotification]
  );

  return {
    success,
    error,
    warning,
    info,
    custom: addNotification,
  };
}

// ============================================
// STANDALONE TOAST FUNCTIONS (NO PROVIDER NEEDED)
// ============================================

// Global toast state
let toastListeners: ((notifications: Notification[]) => void)[] = [];
let globalNotifications: Notification[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...globalNotifications]));
}

export const toast = {
  success: (title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type: 'success',
      title,
      message,
      duration: 5000,
    };

    globalNotifications.push(notification);
    notifyListeners();
    Sounds.ACHIEVEMENT();

    setTimeout(() => {
      globalNotifications = globalNotifications.filter((n) => n.id !== id);
      notifyListeners();
    }, notification.duration);

    return id;
  },

  error: (title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type: 'error',
      title,
      message,
      duration: 5000,
    };

    globalNotifications.push(notification);
    notifyListeners();
    Sounds.ERROR();

    setTimeout(() => {
      globalNotifications = globalNotifications.filter((n) => n.id !== id);
      notifyListeners();
    }, notification.duration);

    return id;
  },

  warning: (title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type: 'warning',
      title,
      message,
      duration: 5000,
    };

    globalNotifications.push(notification);
    notifyListeners();
    Sounds.MENU_NAVIGATE();

    setTimeout(() => {
      globalNotifications = globalNotifications.filter((n) => n.id !== id);
      notifyListeners();
    }, notification.duration);

    return id;
  },

  info: (title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const notification: Notification = {
      id,
      type: 'info',
      title,
      message,
      duration: 5000,
    };

    globalNotifications.push(notification);
    notifyListeners();
    Sounds.MENU_SELECT();

    setTimeout(() => {
      globalNotifications = globalNotifications.filter((n) => n.id !== id);
      notifyListeners();
    }, notification.duration);

    return id;
  },

  dismiss: (id: string) => {
    globalNotifications = globalNotifications.filter((n) => n.id !== id);
    notifyListeners();
  },

  clearAll: () => {
    globalNotifications = [];
    notifyListeners();
  },

  subscribe: (listener: (notifications: Notification[]) => void) => {
    toastListeners.push(listener);
    listener([...globalNotifications]);

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  },
};

// ============================================
// STANDALONE TOAST CONTAINER
// ============================================

export function ToastContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return toast.subscribe(setNotifications);
  }, []);

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <StandaloneNotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function StandaloneNotificationCard({ notification }: { notification: Notification }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      toast.dismiss(notification.id);
      notification.onClose?.();
    }, 300);
  };

  const icons = {
    success: notification.icon || '✓',
    error: notification.icon || '✖',
    warning: notification.icon || '⚠',
    info: notification.icon || 'ℹ',
  };

  return (
    <div
      className={`notification-card notification-card--${notification.type} ${isExiting ? 'notification-card--exiting' : ''}`}
    >
      <div className="notification-card__icon">{icons[notification.type]}</div>

      <div className="notification-card__content">
        <div className="notification-card__title">{notification.title}</div>
        {notification.message && (
          <div className="notification-card__message">{notification.message}</div>
        )}
        {notification.action && (
          <button
            onClick={() => {
              notification.action?.onClick();
              handleClose();
            }}
            className="notification-card__action"
          >
            {notification.action.label}
          </button>
        )}
      </div>

      <button onClick={handleClose} className="notification-card__close">
        ✖
      </button>

      {notification.duration && notification.duration > 0 && (
        <div
          className="notification-card__progress"
          style={{ animationDuration: `${notification.duration}ms` }}
        />
      )}
    </div>
  );
}
