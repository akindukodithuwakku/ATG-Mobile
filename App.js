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
import Personalinfo from "./screens/Personalinfo";
import HealthConditions from "./screens/HealthConditions";
import EmergencyContact from "./screens/EmergencyContact";
import CareNeedsPreferences from "./screens/CareNeedsPreferences";
import CareIntakeReview from "./screens/CareIntakeReview";
import SubmissionSuccess from "./screens/SubmissionSuccess";
import AddTaskScreen from "./screens/AddTaskScreen";
import Task from "./screens/Task";
import CarePlan from "./screens/CarePlanMgtCN";
import MarkAppointment from "./screens/MarkAppointment";
import UpdateTaskScreen from "./screens/UpdateTaskScreen";
import AdditionalDetailsScreen from "./screens/AdditionalDetailsScreen";


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CarePlanMgtClient"
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
        <Stack.Screen name="CarePlanMgtClient" component={CarePlanMgtClient} />
        <Stack.Screen name="MedicationC" component={MedicationMgtClient} />
        <Stack.Screen name="CarePlanMgtCN" component={CarePlanMgtCN} />
        <Stack.Screen name="MedicationCN" component={MedicationMgtCN} />
        <Stack.Screen name="NotificationsC" component={NotificationsClient} />
        <Stack.Screen name="NotificationsCN" component={NotificationsCN} />
        <Stack.Screen name="ClientDashboard" component={ClientDashboard} />
        <Stack.Screen name="CNDashboard" component={CNDashboard} />
        <Stack.Screen name="Personalinfo" component={Personalinfo} />
        <Stack.Screen name="HealthConditions" component={HealthConditions} />
        <Stack.Screen name="EmergencyContact" component={EmergencyContact} />
        <Stack.Screen name="CareNeedsPreferences" component={CareNeedsPreferences} />
        <Stack.Screen name="CareIntakeReview" component={CareIntakeReview} />
        <Stack.Screen name="SubmissionSuccess" component={SubmissionSuccess} />  
        <Stack.Screen name="AddTaskScreen" component={AddTaskScreen} />
        <Stack.Screen name="Task" component={Task} />
        <Stack.Screen name="CarePlan" component={CarePlan} />
<Stack.Screen name="MarkAppointment" component={MarkAppointment} />
<Stack.Screen name="UpdateTaskScreen" component={UpdateTaskScreen} />
<Stack.Screen name="AdditionalDetailsScreen" component={AdditionalDetailsScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
