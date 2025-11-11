import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreAllLogs(true);

export default function App() {
  console.log('✅ App.tsx running with navigation');
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
