import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types';

import HomeScreen from '../screens/HomeScreen';
import TrickDetailScreen from '../screens/TrickDetailScreen';
import TrickLearnScreen from '../screens/TrickLearnScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthNavigator from './AuthNavigator';
import KillerTimeCoinFlip from '../screens/TimeKiller/CoinFlip';
import { useAuthStore } from '../store/authStore';
import FunFactScreen from '../screens/FunFactScreen';
import Magic8Ball from '@/screens/TimeKiller/Magic8Ball';
import MiniGameUnlockChoice from '@/screens/MiniGameUnlockChoice';
import FortuneCookie from '@/screens/TimeKiller/FortuneCookie';
import CasinoTrickSlot from '@/screens/TimeKiller/CasinoTrickSlot';

const Stack = createNativeStackNavigator<RootStackParamList>();

const BottomTab = createBottomTabNavigator();

/* -------------------------------------------------------------------------- */
/*                    🎨 SANTA CRUZ — BOTTOM TAB NAVBAR                        */
/* -------------------------------------------------------------------------- */

function MainTabs() {
  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) =>
        ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0B1120',
            borderTopWidth: 1,
            borderTopColor: '#1F2937',
            elevation: 6,
          },
          tabBarActiveTintColor: '#0AA5FF',
          tabBarInactiveTintColor: '#FFD600',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: 1,
          },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

            if (route.name === 'Home') iconName = 'flame';
            if (route.name === 'Profile') iconName = 'person';

            return <Ionicons name={iconName} color={color} size={size} />;
          },
        } as BottomTabNavigationOptions)
      }
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Tricks' }}
      />

      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </BottomTab.Navigator>
  );
}

/* -------------------------------------------------------------------------- */
/*                              🧭 ROOT NAVIGATION                              */
/* -------------------------------------------------------------------------- */

export default function AppNavigator() {
  const { token } = useAuthStore();

  if (!token) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="TrickDetail" component={TrickDetailScreen} />
      <Stack.Screen name="TrickLearn" component={TrickLearnScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="FunFact" component={FunFactScreen} />
      <Stack.Screen
        name="MiniGameUnlockChoice"
        component={MiniGameUnlockChoice}
      />
      <Stack.Screen name="KillerTimeCoinFlip" component={KillerTimeCoinFlip} />
      <Stack.Screen name="Magic8Ball" component={Magic8Ball} />
      <Stack.Screen name="FortuneCookie" component={FortuneCookie} />
      <Stack.Screen name="CasinoTrickSlot" component={CasinoTrickSlot} />
    </Stack.Navigator>
  );
}
