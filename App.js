import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import screens
import WelcomeScreen from "./screens/WelcomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
// import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
// import ProfileScreen from './screens/ProfileScreen';
// import ReadinessQuestionnaireScreen from './screens/ReadinessQuestionnaireScreen';
// import AppointmentSchedulingScreen from './screens/AppointmentSchedulingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ReadinessQuestionnaire" component={ReadinessQuestionnaireScreen} />
        <Stack.Screen name="AppointmentScheduling" component={AppointmentSchedulingScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
