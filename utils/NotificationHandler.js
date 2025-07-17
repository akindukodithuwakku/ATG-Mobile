let addNotificationHandler = null;

export const registerNotificationHandler = (handler) => {
  addNotificationHandler = handler;
};

export const addNotification = (message) => {
  if (addNotificationHandler) {
    addNotificationHandler(message);
  } else {
    console.warn("Notification handler not registered.");
  }
};