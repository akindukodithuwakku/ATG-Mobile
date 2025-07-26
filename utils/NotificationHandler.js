import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../firebaseConfig.js';
import { ref, push, set, onValue, off } from 'firebase/database';

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

// Save notification to Firebase for cross-device sync
export const saveNotificationToFirebase = async (notification, recipientId) => {
  try {
    const notificationsRef = ref(database, `notifications/${recipientId}`);
    await push(notificationsRef, {
      ...notification,
      createdAt: Date.now(),
      firebaseId: notification.id
    });
  } catch (error) {
    console.error('Error saving notification to Firebase:', error);
  }
};

// Send notification to a specific user (for care navigator to client notifications)
export const sendNotificationToUser = async (recipientId, message, type = 'info', data = {}) => {
  try {
    const notification = createNotification(message, type, data);
    
    // Save to Firebase for the recipient
    await saveNotificationToFirebase(notification, recipientId);
    
    return notification;
  } catch (error) {
    console.error('Error sending notification to user:', error);
  }
};

// Global function to send appointment cancellation notification
// This can be called from HandleAppointmentsCN.js
export const sendAppointmentCancellationNotification = async (clientUsername) => {
  try {
    await sendNotificationToUser(
      clientUsername.trim().toLowerCase(),
      `Your appointment has been cancelled by your care navigator.`,
      'warning',
      {
        type: 'appointment_cancelled',
        cancelledBy: 'care_navigator',
        timestamp: new Date().toISOString()
      }
    );
    console.log("Appointment cancellation notification sent to client:", clientUsername);
    return true;
  } catch (error) {
    console.error("Error sending appointment cancellation notification:", error);
    return false;
  }
};

// Listen for Firebase notifications and sync to local storage
export const startFirebaseNotificationListener = (userId) => {
  if (!userId) return null;
  
  const notificationsRef = ref(database, `notifications/${userId}`);
  
  const unsubscribe = onValue(notificationsRef, async (snapshot) => {
    try {
      const firebaseNotifications = snapshot.val();
      if (!firebaseNotifications) return;
      
      // Get existing local notifications
      const localNotifications = await loadNotifications();
      
      // Convert Firebase data to array and filter out already processed notifications
      const firebaseNotificationsArray = Object.values(firebaseNotifications);
      const newNotifications = firebaseNotificationsArray.filter(firebaseNotif => {
        // Check if this notification already exists locally
        return !localNotifications.some(localNotif => 
          localNotif.id === firebaseNotif.id || localNotif.firebaseId === firebaseNotif.firebaseId
        );
      });
      
      if (newNotifications.length > 0) {
        // Add new notifications to local storage
        const updatedNotifications = [...newNotifications, ...localNotifications];
        await saveNotifications(updatedNotifications);
        
        // Trigger handlers
        if (global.notificationHandlers) {
          global.notificationHandlers.forEach(handler => {
            if (handler && typeof handler === 'function') {
              handler(updatedNotifications);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error syncing Firebase notifications:', error);
    }
  });
  
  return unsubscribe;
};

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