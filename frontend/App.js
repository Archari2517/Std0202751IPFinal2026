import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArcKhe_LoginScreen from './screens/LoginScreen';
import ArcKhe_DashboardScreen from './screens/DashboardScreen';

const ArcKhe_Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ArcKhe_Stack.Navigator initialRouteName="Login">
        <ArcKhe_Stack.Screen name="Login" component={ArcKhe_LoginScreen} options={{ title: 'HR Manager Login' }} />
        <ArcKhe_Stack.Screen
          name="Dashboard"
          component={ArcKhe_DashboardScreen}
          options={{ title: 'Dashboard', headerBackVisible: false }}
        />
      </ArcKhe_Stack.Navigator>
    </NavigationContainer>
  );
}
