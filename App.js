import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ProfileScreenC from "./screens/ProfileScreens/ProfileScreenC";
import ProfileScreenCN from "./screens/ProfileScreens/ProfileScreenCN";
import ReadinessQuestionnaire from "./screens/ReadinessQuestionnaire";
import AppointmentScheduling from "./screens/AppointmentScheduling";
import Appointments from "./screens/Appointments";
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
      initialRouteName="CNDashboard"
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ProfileC" component={ProfileScreenC} />
      <Stack.Screen name="ProfileCN" component={ProfileScreenCN} />
      <Stack.Screen name="Readiness" component={ReadinessQuestionnaire} />
      <Stack.Screen
        name="AppointmentScheduling"
        component={AppointmentScheduling}
      />
      <Stack.Screen name="Appointments" component={Appointments} />
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
