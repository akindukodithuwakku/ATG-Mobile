import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
// import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ProfileScreen from './screens/ProfileScreen';
// import ReadinessQuestionnaireScreen from './screens/ReadinessQuestionnaireScreen';
// import AppointmentSchedulingScreen from './screens/AppointmentSchedulingScreen';
import CarePlanMgt from './screens/CarePlanMgt';
import MedicationMgt from './screens/MedicationMgt';
import ClientDashboard from './screens/ClientDashboard';
import CNDashboard from './screens/CNDashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
        <Stack.Screen name="Profile" component={ProfileScreen} />
        {/* <Stack.Screen name="ReadinessQuestionnaire" component={ReadinessQuestionnaireScreen} />
        <Stack.Screen name="AppointmentScheduling" component={AppointmentSchedulingScreen} /> */}
        <Stack.Screen name="CarePlan" component={CarePlanMgt} />
        <Stack.Screen name="Medication" component={MedicationMgt} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="CNDashboard" component={CNDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
