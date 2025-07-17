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
        <Stack.Screen name="Signup" component={SignupScreen} />
        {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* <Stack.Screen name="ReadinessQuestionnaire" component={ReadinessQuestionnaireScreen} />
        <Stack.Screen name="AppointmentScheduling" component={AppointmentSchedulingScreen} /> */}
        <Stack.Screen name="Appointments" component={Appointments} />
        <Stack.Screen name="CarePlanC" component={CarePlanMgtClient} />
        <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
        <Stack.Screen name="CarePlanCN" component={CarePlanMgtCN} />
        <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />
        <Stack.Screen name="NotificationsC" component={NotificationsClient} />
        <Stack.Screen name="NotificationsCN" component={NotificationsCN} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="CNDashboard" component={CNDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
