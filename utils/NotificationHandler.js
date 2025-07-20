import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_STORAGE_KEY = '@notifications';

// Notification structure
export const createNotification = (message, type = 'info', data = {}) => ({
  id: Date.now() + Math.random().toString(36).substr(2, 9),
  message,
  type, // 'info', 'success', 'warning', 'error'
  timestamp: new Date().toISOString(),
  read: false,
  data
});

// Storage functions
export const saveNotifications = async (notifications) => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

export const loadNotifications = async () => {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

// Main notification functions
export const addNotification = async (message, type = 'info', data = {}) => {
  try {
    const notifications = await loadNotifications();
    const newNotification = createNotification(message, type, data);
    const updatedNotifications = [newNotification, ...notifications];
    
    await saveNotifications(updatedNotifications);
    
    // Trigger any registered handlers
    if (global.notificationHandlers) {
      global.notificationHandlers.forEach(handler => {
        if (handler && typeof handler === 'function') {
          handler(updatedNotifications);
        }
      });
    }
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification:', error);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const notifications = await loadNotifications();
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    await saveNotifications(updatedNotifications);
    
    // Trigger handlers
    if (global.notificationHandlers) {
      global.notificationHandlers.forEach(handler => {
        if (handler && typeof handler === 'function') {
          handler(updatedNotifications);
        }
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notifications = await loadNotifications();
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    await saveNotifications(updatedNotifications);
    
    // Trigger handlers
    if (global.notificationHandlers) {
      global.notificationHandlers.forEach(handler => {
        if (handler && typeof handler === 'function') {
          handler(updatedNotifications);
        }
      });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

// Handler management
export const registerNotificationHandler = (handler) => {
  if (!global.notificationHandlers) {
    global.notificationHandlers = [];
  }
  global.notificationHandlers.push(handler);
  
  // Return unregister function
  return () => {
    if (global.notificationHandlers) {
      global.notificationHandlers = global.notificationHandlers.filter(h => h !== handler);
    }
  };
};

// Utility functions for easy integration
export const showSuccessNotification = (message, data = {}) => {
  return addNotification(message, 'success', data);
};

export const showErrorNotification = (message, data = {}) => {
  return addNotification(message, 'error', data);
};

export const showWarningNotification = (message, data = {}) => {
  return addNotification(message, 'warning', data);
};

export const showInfoNotification = (message, data = {}) => {
  return addNotification(message, 'info', data);
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const notifications = await loadNotifications();
    return notifications.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};