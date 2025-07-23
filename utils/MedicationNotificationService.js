import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  addNotification,
  showWarningNotification,
  showInfoNotification,
} from "./NotificationHandler";

const MEDICATION_REMINDERS_KEY = "@medication_reminders";
const MEDICATION_SCHEDULE_KEY = "@medication_schedule";
const TAKEN_MEDICATIONS_KEY = "@taken_medications";

// Default times for medication schedules
export const DEFAULT_TIMES = {
  Morning: { hour: 9, minute: 54 }, // 9:53 AM
  Evening: { hour: 18, minute: 0 }, // 6:00 PM
  Night: { hour: 21, minute: 0 }, // 12:25 AM
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

// Taken medications management
export const saveTakenMedications = async (takenMeds) => {
  try {
    await AsyncStorage.setItem(
      TAKEN_MEDICATIONS_KEY,
      JSON.stringify(takenMeds)
    );
  } catch (error) {
    console.error("Error saving taken medications:", error);
  }
};

export const loadTakenMedications = async () => {
  try {
    const stored = await AsyncStorage.getItem(TAKEN_MEDICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading taken medications:", error);
    return [];
  }
};

// Mark medication as taken (prevents notification)
export const markMedicationAsTaken = async (
  medicationName,
  dosage,
  scheduleType,
  takenTime = new Date()
) => {
  try {
    const takenMeds = await loadTakenMedications();

    // Create a unique key for this medication dose
    const dateKey = takenTime.toDateString(); // e.g., "Wed Jul 23 2025"
    const medicationKey = `${medicationName}_${dosage}_${scheduleType}`;

    // Find or create entry for this date
    let dateEntry = takenMeds.find((entry) => entry.date === dateKey);
    if (!dateEntry) {
      dateEntry = { date: dateKey, medications: {} };
      takenMeds.push(dateEntry);
    }

    // Mark this specific medication as taken
    dateEntry.medications[medicationKey] = {
      medicationName,
      dosage,
      scheduleType,
      takenTime: takenTime.toISOString(),
      timestamp: Date.now(),
    };

    await saveTakenMedications(takenMeds);

    // Add notification about successful marking
    await addNotification(
      `✅ Marked as taken: ${medicationName} (${dosage}) - ${scheduleType}`,
      "success",
      {
        type: "medication_taken",
        medicationName,
        dosage,
        scheduleType,
        takenTime: takenTime.toISOString(),
      }
    );

    console.log(`✅ Marked ${medicationName} as taken for ${scheduleType}`);
    return true;
  } catch (error) {
    console.error("Error marking medication as taken:", error);
    return false;
  }
};

// Check if medication is already taken for specific time
export const isMedicationAlreadyTaken = async (
  medicationName,
  dosage,
  scheduleType,
  checkTime = new Date()
) => {
  try {
    const takenMeds = await loadTakenMedications();
    const dateKey = checkTime.toDateString();
    const medicationKey = `${medicationName}_${dosage}_${scheduleType}`;

    const dateEntry = takenMeds.find((entry) => entry.date === dateKey);
    if (!dateEntry) return false;

    return !!dateEntry.medications[medicationKey];
  } catch (error) {
    console.error("Error checking if medication is taken:", error);
    return false;
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

// Get today's taken medications
export const getTodaysTakenMedications = async () => {
  try {
    const takenMeds = await loadTakenMedications();
    const today = new Date().toDateString();

    const todaysEntry = takenMeds.find((entry) => entry.date === today);
    return todaysEntry ? Object.values(todaysEntry.medications) : [];
  } catch (error) {
    console.error("Error getting today's taken medications:", error);
    return [];
  }
};

// Clear old taken medication records (optional - call periodically)
export const clearOldTakenRecords = async (daysToKeep = 7) => {
  try {
    const takenMeds = await loadTakenMedications();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredMeds = takenMeds.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });

    await saveTakenMedications(filteredMeds);
    console.log(
      `🧹 Cleared taken medication records older than ${daysToKeep} days`
    );
  } catch (error) {
    console.error("Error clearing old taken records:", error);
  }
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

    reminders.forEach((reminder) => {
      if (!reminder.isActive) return;

      const reminderTime = new Date(reminder.time);
      const timeDiff = now - reminderTime;

      // Check if reminder is due (within 5 minutes of scheduled time)
      if (timeDiff >= 0 && timeDiff <= 5 * 60 * 1000) {
        dueReminders.push(reminder);
      }
    });

    // Send notifications for due reminders (but only if not already taken)
    for (const reminder of dueReminders) {
      // Check if this medication dose is already taken today
      const isAlreadyTaken = await isMedicationAlreadyTaken(
        reminder.medicationName,
        reminder.dosage,
        reminder.scheduleType,
        now
      );

      if (!isAlreadyTaken) {
        await addNotification(
          `⏰ Time to take your medication: ${reminder.medicationName} (${reminder.dosage}) - ${reminder.scheduleType}`,
          "warning",
          {
            type: "medication_reminder",
            medicationName: reminder.medicationName,
            dosage: reminder.dosage,
            scheduleType: reminder.scheduleType,
            reminderTime: reminder.time,
            canMarkAsTaken: true,
          }
        );

        console.log(
          `🔔 Notification sent for ${reminder.medicationName} - ${reminder.scheduleType}`
        );
      } else {
        console.log(
          `✅ Skipped notification for ${reminder.medicationName} - ${reminder.scheduleType} (already taken)`
        );
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
  // Check every minute for medication reminders
  const medicationInterval = setInterval(checkMedicationReminders, 60000);

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
