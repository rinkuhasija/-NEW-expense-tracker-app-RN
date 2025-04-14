// App.js
import 'react-native-get-random-values'; // Keep this first!
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Import Tab Navigator
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icons

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import MonthlyChartScreen from './src/screens/MonthlyChartScreen'; // Import the new screen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // Create Tab Navigator instance

// --- Define the Tab Navigator ---
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'ExpenseList') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted-type';
          } else if (route.name === 'MonthlyChart') {
            iconName = focused ? 'chart-pie' : 'chart-pie';
          }

          // You can return any component that you like here!
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee', // Color for active tab
        tabBarInactiveTintColor: 'gray', // Color for inactive tabs
        headerShown: false, // Hide header here, Stack navigator will handle it
      })}
    >
      <Tab.Screen
        name="ExpenseList"
        component={HomeScreen}
        options={{ title: 'Expenses' }} // Tab title
      />
      <Tab.Screen
        name="MonthlyChart"
        component={MonthlyChartScreen}
        options={{ title: 'Monthly Chart' }} // Tab title
      />
    </Tab.Navigator>
  );
}

// --- Define the Main App Structure (Stack Navigator) ---
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* Stack Navigator holds Tabs and the AddExpense screen */}
        <Stack.Navigator initialRouteName="MainTabs">
          <Stack.Screen
            name="MainTabs" // This screen IS the Tab Navigator
            component={MainTabs}
            options={{
              title: 'Expense Tracker', // Header title for the Tabs section
              headerStyle: { backgroundColor: '#6200ee' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          />
          <Stack.Screen
            name="AddExpense" // Screen for adding expenses remains in the Stack
            component={AddExpenseScreen}
            options={{
              title: 'Add New Expense',
              presentation: 'modal', // Optional: Present as a modal
              headerStyle: { backgroundColor: '#03dac6' },
              headerTintColor: '#000',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}