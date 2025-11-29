import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { LogBox } from 'react-native';
import { navigationRef } from './src/navigation/RootNavigation';
import { ModalProvider } from '@/context/ModalContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { GlobalProgressProvider } from '@/context/GlobalProgressContext';
import AppShell from './src/navigation/AppShell';
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
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        console.log('✅ App.tsx running with navigation');
      }}
    >
      <ModalProvider>
        <GlobalProgressProvider>
          <ProgressProvider>
            <AppShell />
          </ProgressProvider>  
        </GlobalProgressProvider> {/* 👈 AJOUT */}
      </ModalProvider>
    </NavigationContainer>
  );
}
