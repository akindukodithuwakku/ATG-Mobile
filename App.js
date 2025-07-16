import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
// import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileScreen from "./screens/ProfileScreen";
// import ReadinessQuestionnaireScreen from './screens/ReadinessQuestionnaireScreen';
// import AppointmentSchedulingScreen from './screens/AppointmentSchedulingScreen';
import Appointments from "./screens/Appointments";
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
import MarkMedicationTakenScreen from "./screens/MedicationMarkAsTaken";
import MedicationLogScreen from "./screens/MedicationLogScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MedicationC"
        screenOptions={{ headerShown: false }}eas login

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
      
        <Stack.Screen name="CarePlanCN" component={CarePlanMgtCN} />
        <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />
        <Stack.Screen name="NotificationsC" component={NotificationsClient} />
        <Stack.Screen name="NotificationsCN" component={NotificationsCN} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="CNDashboard" component={CNDashboard} />
        <Stack.Screen name="Documents" component={Documents} />
        <Stack.Screen name="DocumentsCN" component={DocumentsCN} />
        <Stack.Screen name="MarkMedication" component={MarkMedicationTakenScreen} />
        <Stack.Screen name="MedicationLog" component={MedicationLogScreen} />
        <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
