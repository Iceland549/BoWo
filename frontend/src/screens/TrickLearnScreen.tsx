import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import api from '../api/api';
import { log } from '../utils/logger';

export default function TrickLearnScreen({ route, navigation }) {
  const { trickId } = route.params;
  const [trick, setTrick] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        log('TrickLearnScreen.fetch', trickId);
        const { data } = await api.get(`/content/tricks/${trickId}/learn`);
        setTrick(data);
        log('TrickLearnScreen.loaded', data);
      } catch (err) {
        log('TrickLearnScreen.error', err);
        alert('Failed to load learning content');
      } finally {
        setLoading(false);
      }
    })();
  }, [trickId]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, marginTop: 50 }}
      />
    );
  }

  if (!trick) {
    return (
      <Text style={{ textAlign: 'center', marginTop: 20 }}>
        No content found.
      </Text>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>{trick.name}</Text>
      {trick.description && (
        <Text style={styles.description}>{trick.description}</Text>
      )}

      {/* Images */}
      {Array.isArray(trick.images) && trick.images.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Visual Steps</Text>
          <FlatList
            data={trick.images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri: string, idx: number) => `${uri}-${idx}`}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          />
        </>
      )}

      {/* Videos */}
      {trick.proVideoUrl && (
        <>
          <Text style={styles.sectionTitle}>Pro Demonstration</Text>
          <Video
            source={{ uri: trick.proVideoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        </>
      )}

      {trick.amateurVideoUrl && (
        <>
          <Text style={styles.sectionTitle}>Amateur Example</Text>
          <Video
            source={{ uri: trick.amateurVideoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        </>
      )}

      {/* Steps */}
      {Array.isArray(trick.steps) && trick.steps.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Step-by-Step Guide</Text>
          {trick.steps.map((s: string, i: number) => (
            <View key={i} style={styles.step}>
              {/* On met tout dans un seul <Text> pour éviter tout texte "perdu" */}
              <Text style={styles.stepText}>{`${i + 1}. ${s}`}</Text>
            </View>
          ))}
        </>
      )}

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#000',
  },
  image: {
    width: 240,
    height: 160,
    borderRadius: 10,
    marginRight: 10,
  },
  video: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  stepText: {
    flex: 1,
    color: '#111',
    fontSize: 15,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#111',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
