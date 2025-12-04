import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { LogBox } from 'react-native';
import { useFonts } from "expo-font";   // 👈 AJOUT ICI
import { navigationRef } from './src/navigation/RootNavigation';
import { ModalProvider } from '@/context/ModalContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { GlobalProgressProvider } from '@/context/GlobalProgressContext';
import AppShell from './src/navigation/AppShell';

// Mock localStorage pour éviter les erreurs
declare const globalThis: any;
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

LogBox.ignoreAllLogs(true);

export default function App() {

  // 1️⃣ CHARGEMENT DE LA POLICE
  const [loaded] = useFonts({
    Bangers: require("./assets/fonts/Bangers-Regular.ttf"),
    Anton: require("./assets/fonts/Anton-Regular.ttf"),
    FugazOne: require("./assets/fonts/FugazOne-Regular.ttf"),
    OldEast: require("./assets/fonts/OldEast.ttf"),
    Ninja: require("./assets/fonts/Ninja.otf"),
  });

  // 2️⃣ ON NE REND PAS L'APP TANT QUE LA POLICE N'EST PAS CHARGÉE
  if (!loaded) return null;

  // 3️⃣ TON APP NORMALE
  console.log('✅ App.tsx running with navigation');

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        console.log('✅ Navigation ready');
      }}
    >
      <ModalProvider>
        <GlobalProgressProvider>
          <ProgressProvider>
            <AppShell />
          </ProgressProvider>  
        </GlobalProgressProvider>
      </ModalProvider>
    </NavigationContainer>
  );
}
