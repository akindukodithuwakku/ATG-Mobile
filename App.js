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
import ProfileScreenC from "./screens/ProfileScreens/ProfileScreenC";
import ProfileScreenCN from "./screens/ProfileScreens/ProfileScreenCN";
import EditProfile from "./screens/ProfileScreens/EditProfile";
import UserProfile from "./screens/ProfileScreens/UserProfile";
import PasswordReset from "./screens/ProfileScreens/PasswordReset";
import ContactUs from "./screens/ProfileScreens/ContactUs";
import TermsAndPrivacy from "./screens/ProfileScreens/TermsAndPrivacy";
import ReadinessQuestionnaire from "./screens/ReadinessQuestionnaire";
import AppointmentScheduling from "./screens/AppointmentScheduling";
import CalendarCN from "./screens/CalendarCN";
import HandleAppointmentsCN from "./screens/HandleAppointmentsCN";
import CarePlanMgtClient from "./screens/CarePlanMgtClient";
import MedicationMgtClient from "./screens/MedicationMgtClient";
import CarePlanMgtCN from "./screens/CarePlanMgtCN";
import MedicationMgtCN from "./screens/MedicationMgtCN";
import NotificationsClient from "./screens/NotificationsClient";
import NotificationsCN from "./screens/NotificationsCN";
import ClientDashboard from "./screens/ClientDashboard";
import CNDashboard from "./screens/CNDashboard";
import Documents from "./screens/Documents";
import DocumentsCN from "./screens/DocumentsCN";
import { LogoutProvider, AutomaticLogoutScreen } from "./screens/AutoLogout";
import Messaging from "./screens/Messaging";
import MessagingCN from "./screens/MessagingCN";
import MarkMedicationTakenScreen from "./screens/MedicationMarkAsTaken";
import MedicationLogScreen from "./screens/MedicationLogScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
      <Stack.Screen name="VerificationSent" component={VerificationSentScreen} />
      <Stack.Screen name="ForgotPWD" component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPWDCode" component={ResetCodeSentScreen} />
      <Stack.Screen name="ForgotPWDReset" component={ResetPasswordScreen} />
      <Stack.Screen name="ProfileC" component={ProfileScreenC} />
      <Stack.Screen name="ProfileCN" component={ProfileScreenCN} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
      <Stack.Screen name="PWDReset" component={PasswordReset} />
      <Stack.Screen name="ContactUs" component={ContactUs} />
      <Stack.Screen name="TermsPrivacy" component={TermsAndPrivacy} />
      <Stack.Screen name="Readiness" component={ReadinessQuestionnaire} />
      <Stack.Screen name="AppointmentScheduling" component={AppointmentScheduling} />
      <Stack.Screen name="CalendarCN" component={CalendarCN} />
      <Stack.Screen name="AppointmentHandling" component={HandleAppointmentsCN} />
      <Stack.Screen name="CarePlanC" component={CarePlanMgtClient} />
      <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
      <Stack.Screen name="CarePlanCN" component={CarePlanMgtCN} />
      <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />
      <Stack.Screen name="NotificationsC" component={NotificationsClient} />
      <Stack.Screen name="NotificationsCN" component={NotificationsCN} />
      <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
      <Stack.Screen name="CNDashboard" component={CNDashboard} />
      <Stack.Screen name="AutomaticLogout" component={AutomaticLogoutScreen} />
      <Stack.Screen name="Documents" component={Documents} />
      <Stack.Screen name="DocumentsCN" component={DocumentsCN} />
      <Stack.Screen name="Messaging" component={Messaging} />
      <Stack.Screen name="MessagingCN" component={MessagingCN} />
      
      {/* ✅ Renamed to "MarkMedication" to match your navigation call */}
      <Stack.Screen name="MarkMedication" component={MarkMedicationTakenScreen} />
      
      <Stack.Screen name="MedicationLog" component={MedicationLogScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <LogoutProvider>
        <AppNavigator />
      </LogoutProvider>
    </NavigationContainer>
  );
}
