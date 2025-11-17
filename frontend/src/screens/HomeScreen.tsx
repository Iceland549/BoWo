import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import api from '../api/api';
import TrickCard from '../components/TrickCard';
import { log } from '../utils/logger';
import useAuth from '@/hooks/useAuth';

export default function HomeScreen({ navigation }) {
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

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
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 TRICKS</Text>
        <Text style={styles.headerSubtitle}>Choose your next move</Text>
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

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.btn} onPress={logout}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDanger} onPress={logout}>
          <Text style={styles.btnDangerText}>Logout</Text>
        </TouchableOpacity>
      </View>
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

  /* BOTTOM BUTTONS */
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    backgroundColor: '#0AA5FF',
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: '800',
    textAlign: 'center',
  },

  btnDanger: {
    flex: 1,
    backgroundColor: '#FF355E',
    paddingVertical: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  btnDangerText: {
    color: '#111215',
    fontWeight: '900',
    textAlign: 'center',
  },
});
