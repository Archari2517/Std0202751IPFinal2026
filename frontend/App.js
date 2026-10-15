import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArcKhe_LoginScreen from './screens/LoginScreen';
import ArcKhe_DashboardScreen from './screens/DashboardScreen';
import ArcKhe_AddEmployeeScreen from './screens/AddEmployeeScreen';

const ArcKhe_Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ArcKhe_Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#cfe9fb' } }}
      >
        <ArcKhe_Stack.Screen name="Login" component={ArcKhe_LoginScreen} />
        <ArcKhe_Stack.Screen name="Dashboard" component={ArcKhe_DashboardScreen} />
        <ArcKhe_Stack.Screen name="AddEmployee" component={ArcKhe_AddEmployeeScreen} />
      </ArcKhe_Stack.Navigator>
    </NavigationContainer>
  );
}
