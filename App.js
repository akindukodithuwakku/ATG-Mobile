import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { Amplify } from "aws-amplify";
import awsConfig from "./aws-config";

// Initialize AWS Amplify
Amplify.configure(awsConfig);

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import { SignUpScreen, VerificationSentScreen } from "./screens/SignupScreen";
import {
  ForgotPasswordScreen,
  ResetCodeSentScreen,
  ResetPasswordScreen,
} from "./screens/ForgotPWordScreen";

// Profile Screens
import ProfileScreenC from "./screens/ProfileScreens/ProfileScreenC";
import ProfileScreenCN from "./screens/ProfileScreens/ProfileScreenCN";
import EditProfile from "./screens/ProfileScreens/EditProfile";
import UserProfile from "./screens/ProfileScreens/UserProfile";
import PasswordReset from "./screens/ProfileScreens/PasswordReset";
import ContactUs from "./screens/ProfileScreens/ContactUs";
import TermsAndPrivacy from "./screens/ProfileScreens/TermsAndPrivacy";

// Care Intake Flow Screens (for both user types)
import ReadinessQuestionnaire from "./screens/ReadinessQuestionnaire";
import Personalinfo from "./screens/Personalinfo";
import HealthConditions from "./screens/HealthConditions";
import CareNeedsPreferences from "./screens/CareNeedsPreferences";
import EmergencyContact from "./screens/EmergencyContact";
import CareIntakeReview from "./screens/CareIntakeReview";
import AdditionalDetailsScreen from "./screens/AdditionalDetailsScreen";
import SubmissionSuccess from "./screens/SubmissionSuccess";

// Appointment Screens
import AppointmentScheduling from "./screens/AppointmentScheduling";
import CalendarCN from "./screens/CalendarCN";
import HandleAppointmentsCN from "./screens/HandleAppointmentsCN";
import MarkAppointment from "./screens/MarkAppointment";

// Dashboard Screens
import ClientDashboard from "./screens/ClientDashboard";
import CNDashboard from "./screens/CNDashboard";

// Care Plan Management Screens
import CarePlanMgtClient from "./screens/CarePlanMgtClient";
import CarePlanMgtCN from "./screens/CarePlanMgtCN";

// Medication Management Screens
import MedicationMgtClient from "./screens/MedicationMgtClient";
import MedicationMgtCN from "./screens/MedicationMgtCN";
import MedicationLogScreen from "./screens/MedicationLogScreen";
import MarkMedicationTakenScreen from "./screens/MedicationMarkAsTaken";

// Task Management Screens
import AddTaskScreen from "./screens/AddTaskScreen";
import UpdateTaskScreen from "./screens/UpdateTaskScreen";
import Task from "./screens/Task";

// Document Management Screens
import Documents from "./screens/Documents";
import DocumentsCN from "./screens/DocumentsCN";

// Messaging Screen
import ChatScreen from "./screens/Messaging";

// Notification Screens
import NotificationsClient from "./screens/NotificationsClient";
import NotificationsCN from "./screens/NotificationsCN";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ProfileC" component={ProfileScreenC} />
        <Stack.Screen name="ProfileCN" component={ProfileScreenCN} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="PasswordReset" component={PasswordReset} />
        <Stack.Screen name="ContactUs" component={ContactUs} />
        <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacy} />

        {/* Care Intake Flow */}
        <Stack.Screen
          name="ReadinessQuestionnaire"
          component={ReadinessQuestionnaire}
        />
        <Stack.Screen name="Personalinfo" component={Personalinfo} />
        <Stack.Screen name="HealthConditions" component={HealthConditions} />
        <Stack.Screen
          name="CareNeedsPreferences"
          component={CareNeedsPreferences}
        />
        <Stack.Screen name="EmergencyContact" component={EmergencyContact} />
        <Stack.Screen name="CareIntakeReview" component={CareIntakeReview} />
        <Stack.Screen
          name="AdditionalDetails"
          component={AdditionalDetailsScreen}
        />
        <Stack.Screen name="SubmissionSuccess" component={SubmissionSuccess} />

        {/* Appointment Screens */}
        <Stack.Screen
          name="AppointmentScheduling"
          component={AppointmentScheduling}
        />
        <Stack.Screen name="CalendarCN" component={CalendarCN} />
        <Stack.Screen
          name="HandleAppointmentsCN"
          component={HandleAppointmentsCN}
        />
        <Stack.Screen name="MarkAppointment" component={MarkAppointment} />

        {/* Dashboard Screens */}
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="CNDashboard" component={CNDashboard} />

        {/* Care Plan Management */}
        <Stack.Screen name="CarePlanC" component={CarePlanMgtClient} />
        <Stack.Screen name="CarePlanCN" component={CarePlanMgtCN} />

        {/* Medication Management */}
        <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
        <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />
        <Stack.Screen name="MedicationLog" component={MedicationLogScreen} />
        <Stack.Screen
          name="MarkMedication"
          component={MarkMedicationTakenScreen}
        />

        {/* Task Management */}
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="UpdateTask" component={UpdateTaskScreen} />
        <Stack.Screen name="Task" component={Task} />

        {/* Notifications */}
        <Stack.Screen name="NotificationsC" component={NotificationsClient} />
        <Stack.Screen name="NotificationsCN" component={NotificationsCN} />

        {/* Messaging */}
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Documents */}
        <Stack.Screen name="Documents" component={Documents} />
        <Stack.Screen name="DocumentsCN" component={DocumentsCN} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
