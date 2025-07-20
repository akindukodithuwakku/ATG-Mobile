# Notification System Documentation

## Overview
This notification system provides a comprehensive, easy-to-integrate solution for displaying notifications across your healthcare app. It stores notifications locally using AsyncStorage and provides real-time updates across all screens.

## Features
- ✅ **Local Storage**: All notifications are stored locally using AsyncStorage
- ✅ **Real-time Updates**: Notifications appear instantly across all screens
- ✅ **Multiple Types**: Support for success, error, warning, and info notifications
- ✅ **Timestamp Display**: Automatic timestamp formatting (e.g., "2 minutes ago")
- ✅ **Clear All Functionality**: One-click clear all notifications
- ✅ **Individual Delete**: Delete specific notifications
- ✅ **Read/Unread Status**: Track notification read status
- ✅ **Easy Integration**: Simple one-line function calls
- ✅ **Pull-to-Refresh**: Refresh notifications with pull gesture

## Quick Start

### 1. Basic Usage
```javascript
import { showSuccessNotification, showErrorNotification } from '../utils/NotificationHandler';

// Show a success notification
showSuccessNotification('Operation completed successfully');

// Show an error notification
showErrorNotification('Something went wrong');
```

### 2. Available Functions

#### Basic Notification Functions
```javascript
// Add a custom notification
addNotification(message, type, data)

// Pre-built notification types
showSuccessNotification(message, data)
showErrorNotification(message, data)
showWarningNotification(message, data)
showInfoNotification(message, data)
```

#### Utility Functions
```javascript
// Get unread notification count
const unreadCount = await getUnreadCount();

// Clear all notifications
await clearAllNotifications();

// Mark notification as read
await markNotificationAsRead(notificationId);

// Delete specific notification
await deleteNotification(notificationId);
```

## Integration Examples

### Example 1: Medication Management
```javascript
import { showSuccessNotification, showErrorNotification } from '../utils/NotificationHandler';

const handleAddMedication = async (medicationData) => {
  try {
    // Your API call here
    await addMedicationToAPI(medicationData);
    
    // Show success notification
    showSuccessNotification(
      `Medication "${medicationData.name}" added successfully`,
      { screen: 'MedicationMgtCN', action: 'medication_added' }
    );
  } catch (error) {
    // Show error notification
    showErrorNotification(
      `Failed to add medication: ${error.message}`,
      { screen: 'MedicationMgtCN', action: 'medication_error' }
    );
  }
};
```

### Example 2: Appointment Scheduling
```javascript
import { showInfoNotification, showWarningNotification } from '../utils/NotificationHandler';

const handleAppointmentReminder = (clientName, appointmentTime) => {
  showInfoNotification(
    `Appointment reminder: ${clientName} has an appointment at ${appointmentTime}`,
    { screen: 'AppointmentScheduling', action: 'appointment_reminder' }
  );
};

const handleAppointmentCancellation = (clientName) => {
  showWarningNotification(
    `Appointment cancelled for ${clientName}`,
    { screen: 'AppointmentScheduling', action: 'appointment_cancelled' }
  );
};
```

### Example 3: Care Plan Management
```javascript
import { showSuccessNotification, showWarningNotification } from '../utils/NotificationHandler';

const handleCarePlanUpdate = async (carePlanData) => {
  try {
    await updateCarePlan(carePlanData);
    showSuccessNotification(
      `Care plan updated for ${carePlanData.clientName}`,
      { screen: 'CarePlanMgtCN', action: 'care_plan_updated' }
    );
  } catch (error) {
    showErrorNotification(
      `Failed to update care plan: ${error.message}`,
      { screen: 'CarePlanMgtCN', action: 'update_failed' }
    );
  }
};
```

## Notification Types and Icons

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `success` | ✅ checkmark-circle | Green (#4CAF50) | Successful operations |
| `error` | ❌ close-circle | Red (#F44336) | Errors and failures |
| `warning` | ⚠️ warning | Orange (#FF9800) | Warnings and alerts |
| `info` | ℹ️ information-circle | Blue (#2196F3) | General information |

## Notification Data Structure

Each notification has the following structure:
```javascript
{
  id: "unique_id",
  message: "Notification message",
  type: "success|error|warning|info",
  timestamp: "2024-01-15T10:30:00.000Z",
  read: false,
  data: {
    // Custom data for navigation or actions
    screen: "ScreenName",
    action: "action_type",
    // ... other custom data
  }
}
```

## Screen Integration

### For Notification Screens (NotificationsCN.js, NotificationsClient.js)
The notification screens are already set up to:
- Display all notifications with timestamps
- Show clear all button
- Handle individual notification deletion
- Mark notifications as read when tapped
- Support pull-to-refresh

### For Other Screens
Simply import and use the notification functions:

```javascript
// At the top of your screen file
import { showSuccessNotification, showErrorNotification } from '../utils/NotificationHandler';

// In your component functions
const handleSomeAction = async () => {
  try {
    // Your logic here
    showSuccessNotification('Action completed successfully');
  } catch (error) {
    showErrorNotification('Action failed: ' + error.message);
  }
};
```

## Advanced Usage

### Custom Notification with Data
```javascript
import { addNotification } from '../utils/NotificationHandler';

addNotification(
  'Custom notification message',
  'info',
  {
    screen: 'TargetScreen',
    action: 'navigate',
    params: { id: 123 }
  }
);
```

### Handling Notification Taps
In your notification screens, you can handle notification taps to navigate to specific screens:

```javascript
const handleNotificationPress = async (notification) => {
  // Mark as read
  if (!notification.read) {
    await markNotificationAsRead(notification.id);
  }
  
  // Navigate based on notification data
  if (notification.data?.screen) {
    navigation.navigate(notification.data.screen, notification.data.params);
  }
};
```

### Checking Unread Count
```javascript
import { getUnreadCount } from '../utils/NotificationHandler';

const checkNotifications = async () => {
  const unreadCount = await getUnreadCount();
  if (unreadCount > 0) {
    // Update badge or show indicator
    updateBadge(unreadCount);
  }
};
```

## Best Practices

1. **Use Appropriate Types**: Choose the right notification type for your message
2. **Include Relevant Data**: Add screen and action data for better navigation
3. **Handle Errors**: Always wrap API calls in try-catch and show error notifications
4. **Keep Messages Clear**: Write clear, concise notification messages
5. **Don't Spam**: Avoid showing too many notifications at once

## Troubleshooting

### Notifications Not Appearing
- Check that you've imported the correct functions
- Ensure AsyncStorage is properly installed
- Verify the notification handler is registered

### Notifications Not Clearing
- Make sure you're calling the async functions with `await`
- Check that the notification screens are properly set up

### Performance Issues
- The system is optimized for local storage
- Large numbers of notifications may impact performance
- Consider implementing pagination for very large notification lists

## File Structure

```
utils/
├── NotificationHandler.js          # Main notification system
├── NotificationExamples.js         # Integration examples
└── NotificationSystem_README.md    # This documentation
```

## Support

For questions or issues with the notification system, refer to:
1. The examples in `NotificationExamples.js`
2. The existing notification screens for implementation patterns
3. This documentation for usage guidelines 