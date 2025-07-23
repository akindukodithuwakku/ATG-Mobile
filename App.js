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
import ViewReadinessDetailsCN from "./screens/ViewReadinessDetailsCN";
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
import { LogoutProvider, AutomaticLogoutScreen } from "./screens/AutoLogout";

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
      <Stack.Screen
        name="VerificationSent"
        component={VerificationSentScreen}
      />
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
      <Stack.Screen name="ViewReadiness" component={ViewReadinessDetailsCN} />
      <Stack.Screen
        name="AppointmentScheduling"
        component={AppointmentScheduling}
      />
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
