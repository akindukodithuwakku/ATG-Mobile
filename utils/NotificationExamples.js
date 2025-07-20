// Notification System Integration Examples
// This file shows how to easily integrate notifications into any screen

import {
  addNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  getUnreadCount,
} from './NotificationHandler';

// ============================================================================
// EXAMPLE 1: Basic Notification Usage
// ============================================================================

// Simple success notification
export const showMedicationAddedNotification = (medicationName) => {
  showSuccessNotification(
    `Medication "${medicationName}" has been added successfully`,
    { screen: 'MedicationMgtCN', action: 'medication_added' }
  );
};

// Error notification
export const showMedicationErrorNotification = (error) => {
  showErrorNotification(
    `Failed to add medication: ${error}`,
    { screen: 'MedicationMgtCN', action: 'medication_error' }
  );
};

// Warning notification
export const showRefillReminderNotification = (medicationName, daysLeft) => {
  showWarningNotification(
    `Refill reminder: ${medicationName} needs refill in ${daysLeft} days`,
    { screen: 'MedicationMgtCN', action: 'refill_reminder', medicationName }
  );
};

// Info notification
export const showAppointmentReminderNotification = (clientName, appointmentTime) => {
  showInfoNotification(
    `Appointment reminder: ${clientName} has an appointment at ${appointmentTime}`,
    { screen: 'AppointmentScheduling', action: 'appointment_reminder', clientName }
  );
};

// ============================================================================
// EXAMPLE 2: Integration in Medication Management Screen
// ============================================================================

export const handleMedicationAction = async (action, medicationData) => {
  try {
    switch (action) {
      case 'add':
        // Simulate API call
        await addMedicationToDatabase(medicationData);
        showSuccessNotification(
          `Medication "${medicationData.name}" added successfully`,
          { screen: 'MedicationMgtCN', action: 'medication_added', medicationId: medicationData.id }
        );
        break;
        
      case 'update':
        await updateMedicationInDatabase(medicationData);
        showSuccessNotification(
          `Medication "${medicationData.name}" updated successfully`,
          { screen: 'MedicationMgtCN', action: 'medication_updated', medicationId: medicationData.id }
        );
        break;
        
      case 'delete':
        await deleteMedicationFromDatabase(medicationData.id);
        showSuccessNotification(
          `Medication "${medicationData.name}" deleted successfully`,
          { screen: 'MedicationMgtCN', action: 'medication_deleted', medicationId: medicationData.id }
        );
        break;
        
      case 'refill_needed':
        showWarningNotification(
          `Refill needed for ${medicationData.name}. Please contact the pharmacy.`,
          { screen: 'MedicationMgtCN', action: 'refill_needed', medicationId: medicationData.id }
        );
        break;
    }
  } catch (error) {
    showErrorNotification(
      `Operation failed: ${error.message}`,
      { screen: 'MedicationMgtCN', action: 'operation_failed', error: error.message }
    );
  }
};

// ============================================================================
// EXAMPLE 3: Integration in Appointment Scheduling Screen
// ============================================================================

export const handleAppointmentAction = async (action, appointmentData) => {
  try {
    switch (action) {
      case 'schedule':
        await scheduleAppointment(appointmentData);
        showSuccessNotification(
          `Appointment scheduled for ${appointmentData.clientName} on ${appointmentData.date}`,
          { screen: 'AppointmentScheduling', action: 'appointment_scheduled', appointmentId: appointmentData.id }
        );
        break;
        
      case 'reschedule':
        await rescheduleAppointment(appointmentData);
        showSuccessNotification(
          `Appointment rescheduled for ${appointmentData.clientName}`,
          { screen: 'AppointmentScheduling', action: 'appointment_rescheduled', appointmentId: appointmentData.id }
        );
        break;
        
      case 'cancel':
        await cancelAppointment(appointmentData.id);
        showWarningNotification(
          `Appointment cancelled for ${appointmentData.clientName}`,
          { screen: 'AppointmentScheduling', action: 'appointment_cancelled', appointmentId: appointmentData.id }
        );
        break;
    }
  } catch (error) {
    showErrorNotification(
      `Appointment operation failed: ${error.message}`,
      { screen: 'AppointmentScheduling', action: 'operation_failed', error: error.message }
    );
  }
};

// ============================================================================
// EXAMPLE 4: Integration in Care Plan Management Screen
// ============================================================================

export const handleCarePlanAction = async (action, carePlanData) => {
  try {
    switch (action) {
      case 'create':
        await createCarePlan(carePlanData);
        showSuccessNotification(
          `Care plan created for ${carePlanData.clientName}`,
          { screen: 'CarePlanMgtCN', action: 'care_plan_created', carePlanId: carePlanData.id }
        );
        break;
        
      case 'update':
        await updateCarePlan(carePlanData);
        showSuccessNotification(
          `Care plan updated for ${carePlanData.clientName}`,
          { screen: 'CarePlanMgtCN', action: 'care_plan_updated', carePlanId: carePlanData.id }
        );
        break;
        
      case 'review_due':
        showWarningNotification(
          `Care plan review due for ${carePlanData.clientName}`,
          { screen: 'CarePlanMgtCN', action: 'review_due', carePlanId: carePlanData.id }
        );
        break;
    }
  } catch (error) {
    showErrorNotification(
      `Care plan operation failed: ${error.message}`,
      { screen: 'CarePlanMgtCN', action: 'operation_failed', error: error.message }
    );
  }
};

// ============================================================================
// EXAMPLE 5: Integration in Messaging Screen
// ============================================================================

export const handleMessageAction = async (action, messageData) => {
  try {
    switch (action) {
      case 'send':
        await sendMessage(messageData);
        showSuccessNotification(
          `Message sent to ${messageData.recipientName}`,
          { screen: 'Messaging', action: 'message_sent', messageId: messageData.id }
        );
        break;
        
      case 'receive':
        showInfoNotification(
          `New message from ${messageData.senderName}`,
          { screen: 'Messaging', action: 'message_received', messageId: messageData.id }
        );
        break;
        
      case 'urgent':
        showWarningNotification(
          `Urgent message from ${messageData.senderName}`,
          { screen: 'Messaging', action: 'urgent_message', messageId: messageData.id }
        );
        break;
    }
  } catch (error) {
    showErrorNotification(
      `Message operation failed: ${error.message}`,
      { screen: 'Messaging', action: 'operation_failed', error: error.message }
    );
  }
};

// ============================================================================
// EXAMPLE 6: Integration in Profile/Account Management
// ============================================================================

export const handleProfileAction = async (action, profileData) => {
  try {
    switch (action) {
      case 'update':
        await updateProfile(profileData);
        showSuccessNotification(
          'Profile updated successfully',
          { screen: 'ProfileScreenCN', action: 'profile_updated' }
        );
        break;
        
      case 'password_change':
        await changePassword(profileData);
        showSuccessNotification(
          'Password changed successfully',
          { screen: 'PasswordReset', action: 'password_changed' }
        );
        break;
        
      case 'login_failed':
        showErrorNotification(
          'Login failed. Please check your credentials.',
          { screen: 'LoginScreen', action: 'login_failed' }
        );
        break;
    }
  } catch (error) {
    showErrorNotification(
      `Profile operation failed: ${error.message}`,
      { screen: 'ProfileScreenCN', action: 'operation_failed', error: error.message }
    );
  }
};

// ============================================================================
// EXAMPLE 7: Utility Functions for Common Scenarios
// ============================================================================

// Check for unread notifications and show badge
export const checkUnreadNotifications = async () => {
  const unreadCount = await getUnreadCount();
  if (unreadCount > 0) {
    showInfoNotification(
      `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`,
      { screen: 'NotificationsCN', action: 'unread_count', count: unreadCount }
    );
  }
  return unreadCount;
};

// Show system maintenance notification
export const showMaintenanceNotification = (maintenanceTime) => {
  showWarningNotification(
    `System maintenance scheduled for ${maintenanceTime}. Some features may be temporarily unavailable.`,
    { screen: 'global', action: 'maintenance_scheduled', maintenanceTime }
  );
};

// Show network error notification
export const showNetworkErrorNotification = () => {
  showErrorNotification(
    'Network connection lost. Please check your internet connection.',
    { screen: 'global', action: 'network_error' }
  );
};

// Show sync notification
export const showSyncNotification = (status) => {
  if (status === 'success') {
    showSuccessNotification(
      'Data synchronized successfully',
      { screen: 'global', action: 'sync_success' }
    );
  } else {
    showErrorNotification(
      'Data synchronization failed',
      { screen: 'global', action: 'sync_failed' }
    );
  }
};

// ============================================================================
// MOCK FUNCTIONS (Replace with actual API calls)
// ============================================================================

const addMedicationToDatabase = async (data) => {
  // Simulate API call
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const updateMedicationInDatabase = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const deleteMedicationFromDatabase = async (id) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const scheduleAppointment = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const rescheduleAppointment = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const cancelAppointment = async (id) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const createCarePlan = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const updateCarePlan = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const sendMessage = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const updateProfile = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const changePassword = async (data) => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}; 