import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
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

  if (loading) return <Text>Loading tricks...</Text>;

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 22 }}>Tricks</Text>
      <FlatList
        data={tricks}
        keyExtractor={(i) => i.id || i._id || i.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('TrickDetail', { trick: item })}>
            <TrickCard trick={item} />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}
        style={{ padding:8, backgroundColor:'#eee', borderRadius:8 }}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout}
        style={{ padding:8, backgroundColor:'#fee', borderRadius:8 }}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
