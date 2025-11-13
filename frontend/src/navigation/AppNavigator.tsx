import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TrickDetailScreen from '../screens/TrickDetailScreen';
import TrickLearnScreen from '../screens/TrickLearnScreen';
import QuizScreen from '../screens/QuizScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '../store/authStore';

// Force TS à ignorer les erreurs de typage "id" (React Navigation 7 bug)
const Tab: any = createBottomTabNavigator();
const Stack: any = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Tricks' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuthStore();

  if (!token) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="TrickDetail" component={TrickDetailScreen} />
      <Stack.Screen name="TrickLearn" component={TrickLearnScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}
