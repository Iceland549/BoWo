import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/RootNavigation';
// ✅ TypeScript-safe mock pour éviter l'erreur "localStorage doesn't exist"
declare const globalThis: any; // Permet d'accéder à l'objet global (standard JS)

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}


LogBox.ignoreAllLogs(true);

export default function App() {
  console.log('✅ App.tsx running with navigation');
  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}
