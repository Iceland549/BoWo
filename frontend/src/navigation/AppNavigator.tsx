import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import TrickDetailScreen from '../screens/TrickDetailScreen';
import TrickLearnScreen from '../screens/TrickLearnScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthNavigator from './AuthNavigator';
import KillerTimeCoinFlip from '../screens/CoinFlip';
import { useAuthStore } from '../store/authStore';

// Stack = navigation interne
const Stack: any = createNativeStackNavigator();

// Top Tabs = navigation principale haute
const TopTab: any = createMaterialTopTabNavigator();


/* -------------------------------------------------------------------------- */
/*                    🎨 SANTA CRUZ — TOP TABS NAVBAR                         */
/* -------------------------------------------------------------------------- */

function MainTabs() {
  return (
    <TopTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0B1120',
          shadowColor: '#FF355E',
          elevation: 6,
          borderBottomWidth: 1,
          borderBottomColor: '#1F2937',
        },
        tabBarActiveTintColor: '#0AA5FF',
        tabBarInactiveTintColor: '#FFD600',
        tabBarIndicatorStyle: {
          backgroundColor: '#FF355E',
          height: 4,
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        tabBarShowIcon: true,
      }}
    >

      {/* -------------------------- TRICKS TAB --------------------------- */}
      <TopTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Tricks',
          tabBarIcon: ({ color }) => (
            <Ionicons name="flame" color={color} size={20} />
          ),
        }}
      />

      {/* -------------------------- PROFILE TAB -------------------------- */}
      <TopTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={20} />
          ),
        }}
      />

    </TopTab.Navigator>
  );
}


/* -------------------------------------------------------------------------- */
/*                        🧭 APP NAVIGATION ROOT                              */
/* -------------------------------------------------------------------------- */

export default function AppNavigator() {
  const { token } = useAuthStore();

  // Pas connecté → Auth screens
  if (!token) {
    return <AuthNavigator />;
  }

  // Connecté → App principale
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="TrickDetail" component={TrickDetailScreen} />
      <Stack.Screen name="TrickLearn" component={TrickLearnScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="KillerTimeCoinFlip" component={KillerTimeCoinFlip} />
    </Stack.Navigator>
  );
}
