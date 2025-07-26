import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addNotification,
  showWarningNotification,
  showInfoNotification,
} from "./NotificationHandler";

const MEDICATION_REMINDERS_KEY = "@medication_reminders";
const MEDICATION_SCHEDULE_KEY = "@medication_schedule";

// Default times for medication schedules
export const DEFAULT_TIMES = {
  Morning: { hour: 8, minute: 0 }, // 8:00 AM
  Evening: { hour: 19, minute: 20 }, // 6:00 PM
  Night: { hour: 0, minute: 25 }, // 12:25 AM
};

// Medication reminder structure
const createMedicationReminder = (
  medicationName,
  dosage,
  scheduleType,
  time,
  refillDate
) => ({
  id: Date.now() + Math.random().toString(36).substr(2, 9),
  medicationName,
  dosage,
  scheduleType,
  time,
  refillDate: new Date(refillDate),
  isActive: true,
  createdAt: new Date().toISOString(),
});

// Storage functions
export const saveMedicationReminders = async (reminders) => {
  try {
    await AsyncStorage.setItem(
      MEDICATION_REMINDERS_KEY,
      JSON.stringify(reminders)
    );
  } catch (error) {
    console.error("Error saving medication reminders:", error);
  }
};

export const loadMedicationReminders = async () => {
  try {
    const stored = await AsyncStorage.getItem(MEDICATION_REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading medication reminders:", error);
    return [];
  }
};

// Parse custom frequency text and return interval in minutes
export const parseCustomFrequency = (frequencyText) => {
  if (!frequencyText) return null;

  const text = frequencyText.toLowerCase().trim();

  // Parse common frequency patterns
  if (text.includes("every")) {
    // "Every 4 hours", "Every 6 hours", "Every 30 minutes"
    const numberMatch = text.match(
      /every\s+(\d+)\s*(hour|hours|minute|minutes|hr|hrs|min|mins)/
    );
    if (numberMatch) {
      const value = parseInt(numberMatch[1]);
      const unit = numberMatch[2];

      if (unit.includes("hour") || unit.includes("hr")) {
        return value * 60; // Convert hours to minutes
      } else if (unit.includes("minute") || unit.includes("min")) {
        return value;
      }
    }
  }

  // "Twice a day", "3 times a day"
  if (text.includes("day")) {
    const numberMatch = text.match(
      /(\d+)\s*times?\s*a?\s*day|twice\s*a?\s*day|three\s*times?\s*a?\s*day/
    );
    if (numberMatch) {
      let timesPerDay = 1;
      if (text.includes("twice")) {
        timesPerDay = 2;
      } else if (text.includes("three")) {
        timesPerDay = 3;
      } else {
        timesPerDay = parseInt(numberMatch[1]) || 1;
      }
      return Math.floor((24 * 60) / timesPerDay); // Distribute evenly throughout day
    }
  }

  // "Once daily", "Daily"
  if (text.includes("daily") || text.includes("once")) {
    return 24 * 60; // Once every 24 hours
  }

  // Default to 8 hours if can't parse
  return 8 * 60;
};

// Create multiple reminders for custom frequency
export const createCustomFrequencyReminders = (
  medicationName,
  dosage,
  frequencyText,
  refillDate
) => {
  const intervalMinutes = parseCustomFrequency(frequencyText);
  if (!intervalMinutes) return [];

  const now = new Date();
  const reminders = [];

  // Create first reminder starting from next hour
  const firstReminderTime = new Date(now);
  firstReminderTime.setHours(firstReminderTime.getHours() + 1, 0, 0, 0);

  // Create reminders for the next 7 days
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  let currentTime = new Date(firstReminderTime);
  let reminderCount = 0;

  while (currentTime <= endDate && reminderCount < 50) {
    // Limit to 50 reminders
    const reminder = createMedicationReminder(
      medicationName,
      dosage,
      `Custom (${frequencyText})`,
      currentTime.toISOString(),
      refillDate
    );

    reminders.push(reminder);

    // Add interval for next reminder
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
    reminderCount++;
  }

  return reminders;
};

// Get default time for schedule type
export const getDefaultTimeForSchedule = (scheduleType) => {
  return DEFAULT_TIMES[scheduleType] || { hour: 12, minute: 0 };
};

// Create time from default or custom
export const createScheduleTime = (scheduleType, customTime = null) => {
  if (customTime) {
    return new Date(customTime);
  }

  const defaultTime = getDefaultTimeForSchedule(scheduleType);
  const now = new Date();
  const scheduleTime = new Date(now);
  scheduleTime.setHours(defaultTime.hour, defaultTime.minute, 0, 0);

  // If the time has passed today, set it for tomorrow
  if (scheduleTime <= now) {
    scheduleTime.setDate(scheduleTime.getDate() + 1);
  }

  return scheduleTime;
};

// Schedule medication reminder
export const scheduleMedicationReminder = async (
  medicationName,
  dosage,
  scheduleTypes,
  customFrequency,
  refillDate
) => {
  try {
    const reminders = await loadMedicationReminders();
    const newReminders = [];

    // Create reminders for each schedule type
    scheduleTypes.forEach((scheduleType) => {
      if (scheduleType === "Other" && customFrequency) {
        // For custom schedule, parse frequency and create multiple reminders
        const customReminders = createCustomFrequencyReminders(
          medicationName,
          dosage,
          customFrequency,
          refillDate
        );
        newReminders.push(...customReminders);

        // Add immediate notification about custom schedule
        addNotification(
          `Custom medication schedule set: ${medicationName} - ${customFrequency}`,
          "info",
          {
            type: "custom_schedule_set",
            medicationName,
            frequency: customFrequency,
            reminderCount: customReminders.length,
          }
        );
      } else if (DEFAULT_TIMES[scheduleType]) {
        // For standard schedules, use default times
        const scheduleTime = createScheduleTime(scheduleType);
        const reminder = createMedicationReminder(
          medicationName,
          dosage,
          scheduleType,
          scheduleTime.toISOString(),
          refillDate
        );
        newReminders.push(reminder);
      }
    });

    const updatedReminders = [...reminders, ...newReminders];
    await saveMedicationReminders(updatedReminders);

    // Create confirmation notification
    const scheduleInfo =
      scheduleTypes.includes("Other") && customFrequency
        ? `custom schedule (${customFrequency})`
        : scheduleTypes.join(", ");

    await addNotification(
      `Medication reminders set for ${medicationName} - ${scheduleInfo}`,
      "success",
      {
        type: "medication_scheduled",
        medicationName,
        scheduleTypes,
        customFrequency: customFrequency || null,
        reminderCount: newReminders.length,
      }
    );

    return newReminders;
  } catch (error) {
    console.error("Error scheduling medication reminder:", error);
    throw error;
  }
};

// Check for due medication reminders
export const checkMedicationReminders = async () => {
  try {
    const reminders = await loadMedicationReminders();
    const now = new Date();
    const dueReminders = [];

    for (const reminder of reminders) {
      if (!reminder.isActive) continue;

      const reminderTime = new Date(reminder.time);
      const timeDiff = now - reminderTime;

      // Check if reminder is due (within 10 minutes of scheduled time)
      if (timeDiff >= 0 && timeDiff <= 10 * 60 * 1000) {
        // Check if medication was already taken for this schedule today
        const alreadyTaken = await isMedicationAlreadyTaken(
          reminder.medicationName,
          reminder.scheduleType
        );

        if (!alreadyTaken) {
          dueReminders.push(reminder);

          // Send notification for due reminder
          await addNotification(
            `Time to take your medication: ${reminder.medicationName} (${reminder.dosage})`,
            "warning",
            {
              type: "medication_reminder",
              medicationName: reminder.medicationName,
              dosage: reminder.dosage,
              scheduleType: reminder.scheduleType,
            }
          );
        }
      }
    }

    return dueReminders;
  } catch (error) {
    console.error("Error checking medication reminders:", error);
    return [];
  }
};

// Check for refill date reminders
export const checkRefillReminders = async () => {
  try {
    const reminders = await loadMedicationReminders();
    const now = new Date();
    const refillDueReminders = [];

    reminders.forEach((reminder) => {
      if (!reminder.isActive) return;

      const refillDate = new Date(reminder.refillDate);
      const daysUntilRefill = Math.ceil(
        (refillDate - now) / (1000 * 60 * 60 * 24)
      );

      // Check if refill is due in 3 days or less
      if (daysUntilRefill <= 3 && daysUntilRefill >= 0) {
        refillDueReminders.push({
          ...reminder,
          daysUntilRefill,
        });
      }

      // Check if refill date has passed
      if (daysUntilRefill < 0) {
        refillDueReminders.push({
          ...reminder,
          daysUntilRefill,
          overdue: true,
        });
      }
    });

    // Send notifications for refill reminders
    for (const reminder of refillDueReminders) {
      const message = reminder.overdue
        ? `Your ${reminder.medicationName} refill is overdue!`
        : `Your ${reminder.medicationName} needs to be refilled in ${reminder.daysUntilRefill} day(s)`;

      await addNotification(message, reminder.overdue ? "error" : "warning", {
        type: "refill_reminder",
        medicationName: reminder.medicationName,
        refillDate: reminder.refillDate,
        daysUntilRefill: reminder.daysUntilRefill,
        overdue: reminder.overdue,
      });
    }

    return refillDueReminders;
  } catch (error) {
    console.error("Error checking refill reminders:", error);
    return [];
  }
};

// Start medication monitoring service
export const startMedicationMonitoring = () => {
  // Check every 10 minutes for medication reminders (600000ms = 10 minutes)
  const medicationInterval = setInterval(checkMedicationReminders, 600000);

  // Check every hour for refill reminders
  const refillInterval = setInterval(checkRefillReminders, 3600000);

  // Return cleanup function
  return () => {
    clearInterval(medicationInterval);
    clearInterval(refillInterval);
  };
};

// Get active medication reminders
export const getActiveMedicationReminders = async () => {
  try {
    const reminders = await loadMedicationReminders();
    return reminders.filter((reminder) => reminder.isActive);
  } catch (error) {
    console.error("Error getting active medication reminders:", error);
    return [];
  }
};

// Disable medication reminder
export const disableMedicationReminder = async (reminderId) => {
  try {
    const reminders = await loadMedicationReminders();
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === reminderId ? { ...reminder, isActive: false } : reminder
    );

    await saveMedicationReminders(updatedReminders);

    await addNotification("Medication reminder disabled", "info", {
      type: "reminder_disabled",
      reminderId,
    });
  } catch (error) {
    console.error("Error disabling medication reminder:", error);
    throw error;
  }
};

// Format time display
export const formatTimeDisplay = (scheduleType) => {
  const defaultTime = getDefaultTimeForSchedule(scheduleType);
  const hour12 =
    defaultTime.hour > 12 ? defaultTime.hour - 12 : defaultTime.hour;
  const period = defaultTime.hour >= 12 ? "PM" : "AM";
  const displayHour = hour12 === 0 ? 12 : hour12;
  const displayMinute = defaultTime.minute.toString().padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
};

// Get custom frequency examples for user guidance
export const getCustomFrequencyExamples = () => {
  return [
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 30 minutes",
    "Twice a day",
    "3 times a day",
    "Once daily",
    "Every 12 hours",
  ];
};

// Validate custom frequency input
export const validateCustomFrequency = (frequencyText) => {
  if (!frequencyText || frequencyText.trim().length === 0) {
    return { isValid: false, error: "Frequency is required" };
  }

  const intervalMinutes = parseCustomFrequency(frequencyText);

  if (!intervalMinutes) {
    return {
      isValid: false,
      error: "Please use format like 'Every 4 hours' or 'Twice a day'",
    };
  }

  if (intervalMinutes < 15) {
    return {
      isValid: false,
      error: "Minimum interval is 15 minutes",
    };
  }

  if (intervalMinutes > 24 * 60) {
    return {
      isValid: false,
      error: "Maximum interval is 24 hours",
    };
  }

  return {
    isValid: true,
    intervalMinutes,
    description: `This will create reminders every ${Math.floor(
      intervalMinutes / 60
    )} hours and ${intervalMinutes % 60} minutes`,
  };
};

// Storage key for medication taken records
const MEDICATION_TAKEN_KEY = "@medication_taken";

// Mark medication as taken
export const markMedicationAsTaken = async (
  medicationName,
  dosage,
  scheduleType
) => {
  try {
    // Get current taken records
    const storedTaken = await AsyncStorage.getItem(MEDICATION_TAKEN_KEY);
    const takenRecords = storedTaken ? JSON.parse(storedTaken) : [];

    // Create new taken record
    const takenRecord = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      medicationName,
      dosage,
      scheduleType,
      takenAt: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    // Add to records
    takenRecords.push(takenRecord);

    // Save updated records
    await AsyncStorage.setItem(
      MEDICATION_TAKEN_KEY,
      JSON.stringify(takenRecords)
    );

    // Add success notification
    await addNotification(`✓ ${medicationName} marked as taken`, "success", {
      type: "medication_taken",
      medicationName,
      dosage,
      scheduleType,
      takenAt: takenRecord.takenAt,
    });

    return takenRecord;
  } catch (error) {
    console.error("Error marking medication as taken:", error);
    throw error;
  }
};

// Check if medication is already taken today for specific schedule
export const isMedicationAlreadyTaken = async (
  medicationName,
  scheduleType
) => {
  try {
    const storedTaken = await AsyncStorage.getItem(MEDICATION_TAKEN_KEY);
    const takenRecords = storedTaken ? JSON.parse(storedTaken) : [];

    const today = new Date().toDateString();

    // Check if this medication and schedule was already taken today
    const takenToday = takenRecords.find(
      (record) =>
        record.medicationName === medicationName &&
        record.scheduleType === scheduleType &&
        record.date === today
    );

    return !!takenToday;
  } catch (error) {
    console.error("Error checking if medication taken:", error);
    return false;
  }
};

// Get medication taken records
export const getMedicationTakenRecords = async () => {
  try {
    const storedTaken = await AsyncStorage.getItem(MEDICATION_TAKEN_KEY);
    return storedTaken ? JSON.parse(storedTaken) : [];
  } catch (error) {
    console.error("Error getting medication taken records:", error);
    return [];
  }
};

// Test function to manually trigger reminder check (useful for testing)
export const testMedicationReminderCheck = async () => {
  try {
    console.log("Testing medication reminder check...");
    const dueReminders = await checkMedicationReminders();
    console.log(`Found ${dueReminders.length} due reminders`);
    return dueReminders;
  } catch (error) {
    console.error("Error in test reminder check:", error);
    return [];
  }
};

// Clear all medication taken records (useful for testing)
export const clearMedicationTakenRecords = async () => {
  try {
    await AsyncStorage.removeItem(MEDICATION_TAKEN_KEY);
    await addNotification("Medication taken records cleared", "info");
    return true;
  } catch (error) {
    console.error("Error clearing medication taken records:", error);
    return false;
  }
};
