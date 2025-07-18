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

// Task Management Screens
import AddTaskScreen from "./screens/AddTaskScreen";
import UpdateTaskScreen from "./screens/UpdateTaskScreen";
import Task from "./screens/Task";

// Document Management Screens
import Documents from "./screens/Documents";
import DocumentsCN from "./screens/DocumentsCN";

// Communication Screens
import Messaging from "./screens/Messaging";

// Notification Screens
import NotificationsClient from "./screens/NotificationsClient";
import NotificationsCN from "./screens/NotificationsCN";

// Utility Screens
import { AutomaticLogoutScreen, LogoutProvider } from "./screens/AutoLogout";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <LogoutProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          {/* Welcome and Authentication Screens */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen
            name="VerificationSent"
            component={VerificationSentScreen}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ForgotPWDCode" component={ResetCodeSentScreen} />
          <Stack.Screen name="ForgotPWDReset" component={ResetPasswordScreen} />
          <Stack.Screen name="ResetCodeSent" component={ResetCodeSentScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ForgotPWD" component={ForgotPasswordScreen} />

          {/* Profile Screens */}
          <Stack.Screen name="ProfileC" component={ProfileScreenC} />
          <Stack.Screen name="ProfileCN" component={ProfileScreenCN} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="UserProfile" component={UserProfile} />
          <Stack.Screen name="PasswordReset" component={PasswordReset} />
          <Stack.Screen name="PWDReset" component={PasswordReset} />
          <Stack.Screen name="ContactUs" component={ContactUs} />
          <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacy} />

          {/* Care Intake Flow Screens */}
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
            name="AdditionalDetailsScreen"
            component={AdditionalDetailsScreen}
          />
          <Stack.Screen
            name="SubmissionSuccess"
            component={SubmissionSuccess}
          />

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
          <Stack.Screen
            name="AppointmentHandling"
            component={HandleAppointmentsCN}
          />
          <Stack.Screen name="MarkAppointment" component={MarkAppointment} />

          {/* Dashboard Screens */}
          <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
          <Stack.Screen name="CNDashboard" component={CNDashboard} />

          {/* Care Plan Management Screens */}
          <Stack.Screen name="CarePlanC" component={CarePlanMgtClient} />
          <Stack.Screen name="CarePlanCN" component={CarePlanMgtCN} />

          {/* Medication Management Screens */}
          <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
          <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />

          {/* Task Management Screens */}
          <Stack.Screen name="AddTaskScreen" component={AddTaskScreen} />
          <Stack.Screen name="UpdateTaskScreen" component={UpdateTaskScreen} />
          <Stack.Screen name="Task" component={Task} />

          {/* Document Management Screens */}
          <Stack.Screen name="DocumentC" component={Documents} />
          <Stack.Screen name="DocumentCN" component={DocumentsCN} />

          {/* Communication Screens */}
          <Stack.Screen name="Chat" component={Messaging} />

          {/* Notification Screens */}
          <Stack.Screen name="NotificationsC" component={NotificationsClient} />
          <Stack.Screen name="NotificationsCN" component={NotificationsCN} />

          {/* Utility Screens */}
          <Stack.Screen
            name="AutomaticLogout"
            component={AutomaticLogoutScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LogoutProvider>
  );
};

export default AppNavigator;
