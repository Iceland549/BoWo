import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import ScreenWrapper from '../components/ScreenWrapper';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../api/api';
import TrickCard from '../components/TrickCard';
import { log } from '../utils/logger';

export default function HomeScreen({ navigation }) {
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, clearCredentials } = useAuthStore();

  useEffect(() => {
    (async () => {
      try {
        log('HomeScreen.fetch tricks');
        const { data } = await api.get('/content/tricks');
        setTricks(data);
        log('HomeScreen.tricks loaded', data.length);
      } catch (err) {
        log('HomeScreen.fetch error', err);
        alert('Failed to load tricks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Loading tricks…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenWrapper>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔥 TRICKS</Text>
          <Text style={styles.headerSubtitle}>Choose your next move</Text>
        </View>

        <View style={styles.topButtons}>
          {!token ? (
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.topBtnText}>Login</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                clearCredentials();
                navigation.replace("Login");
              }}
            >
              <Text style={styles.topBtnText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LIST */}
        <FlatList
          data={tricks}
          keyExtractor={(i) => i.id || i._id || i.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TrickDetail', { trick: item })}
            >
              <TrickCard trick={item} />
            </TouchableOpacity>
          )}
        />
      </ScreenWrapper>
    </SafeAreaView>
  );
}

/* 🎨 SANTA CRUZ STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215', // même fond que TrickLearn Santa Cruz
    paddingHorizontal: 12,
  },

  topButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
    zIndex: 99,
  },
  topBtnText: {
    color: '#FFD600',
    fontWeight: '900',
    fontSize: 14,
    backgroundColor: '#1A1B20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF355E',
  },

  /* LOADING */
  loadingScreen: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFD600',
    fontWeight: '700',
  },

  /* HEADER */
  header: {
    marginTop: 12,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#0AA5FF', // bleu Santa Cruz
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },
  headerSubtitle: {
    color: '#FFD600',
    fontSize: 14,
    marginTop: -6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

});
