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

type TrickLearn = {
  id: string;
  name: string;
  description?: string;
  steps: string[];
  images: string[];
  amateurVideoUrl?: string | null;
  proVideoUrl?: string | null;
  proTip?: string;
  commonMistake?: string;
};

export default function TrickLearnScreen({ route, navigation }: any) {
  const { trickId } = route.params;
  const [trick, setTrick] = useState<TrickLearn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        log('TrickLearnScreen.fetch', trickId);
        const { data } = await api.get(`/content/tricks/${trickId}/learn`);
        setTrick(data);
      } catch (err) {
        log('TrickLearnScreen.error', err);
        alert('Impossible de charger ce trick.');
      } finally {
        setLoading(false);
      }
    })();
  }, [trickId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!trick) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Aucun contenu trouvé.</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mainImage =
    trick.images?.[0] ?? 'https://via.placeholder.com/600x400';

  const hasAnyVideo = trick.proVideoUrl || trick.amateurVideoUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* HERO */}
      <View style={styles.heroWrapper}>
        <Image source={{ uri: mainImage }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />

        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTag}>TRICK UNLOCKED</Text>
          <Text style={styles.heroTitle}>{trick.name}</Text>
        </View>
      </View>

      {/* DESCRIPTION */}
      {trick.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi ce trick déchire 💥</Text>
          <Text style={styles.description}>{trick.description}</Text>
        </View>
      )}

      {/* VIDEOS */}
      {hasAnyVideo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clips 🎬</Text>

          {trick.proVideoUrl && (
            <View style={[styles.videoCard, styles.videoBlue]}>
              <Text style={styles.videoLabel}>Pro Clip</Text>
              <Video
                source={{ uri: trick.proVideoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
              />
            </View>
          )}

          {trick.amateurVideoUrl && (
            <View style={[styles.videoCard, styles.videoYellow]}>
              <Text style={styles.videoLabel}>Real Life Clip</Text>
              <Video
                source={{ uri: trick.amateurVideoUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
              />
            </View>
          )}
        </View>
      )}

      {/* IMAGES */}
      {!!trick.images?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Steps 🌀</Text>
          <FlatList
            data={trick.images}
            horizontal
            keyExtractor={(u, i) => u + i}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesList}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.stepImage} />
            )}
          />
        </View>
      )}

      {/* STEPS */}
      {!!trick.steps?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step-by-step 🔥</Text>

          {trick.steps.map((s, i) => {
            const colors = ['#0AA5FF', '#FFD600', '#FF355E']; // bleu / jaune / rouge Santa Cruz
            const bg = colors[i % 3];

            return (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepIndex, { backgroundColor: bg }]}>
                  <Text style={styles.stepIndexText}>{i + 1}</Text>
                </View>

                <Text style={styles.stepText}>{s}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* PRO TIP */}
      {trick.proTip && (
        <View style={[styles.section, styles.proTip]}>
          <Text style={styles.sectionTitle}>💡 Pro Tip</Text>
          <Text style={styles.proTipText}>{trick.proTip}</Text>
        </View>
      )}

      {/* COMMON MISTAKE */}
      {trick.commonMistake && (
        <View style={[styles.section, styles.mistake]}>
          <Text style={styles.sectionTitle}>⚠️ Erreurs fréquentes</Text>
          <Text style={styles.mistakeText}>{trick.commonMistake}</Text>
        </View>
      )}

      {/* RETURN */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      >
        <Text style={styles.backBtnText}>← Back to Park</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* 🎨 STYLES SANTA CRUZ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215', // fond dark neutre pour laisser les couleurs pop
  },
  content: { paddingBottom: 80 },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFD600',
    fontSize: 14,
  },

  /* HERO */
  heroWrapper: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,165,255,0.25)', // overlay bleu électrique
  },
  heroTextWrap: {
    position: 'absolute',
    bottom: 22,
    left: 18,
  },
  heroTag: {
    backgroundColor: '#FFD600',
    color: '#111215',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 28,
    letterSpacing: 1.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    textShadowColor: '#0AA5FF',
    textShadowRadius: 6,
  },

  /* SECTION */
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#1A1B20',
    padding: 16,
    borderRadius: 18,
    borderColor: '#27282E',
    borderWidth: 1,
  },
  sectionTitle: {
    color: '#0AA5FF',
    fontWeight: '900',
    fontSize: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  description: {
    color: '#EDEDF5',
    fontSize: 14,
    lineHeight: 20,
  },

  /* IMAGES */
  imagesList: { paddingVertical: 8 },
  stepImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginRight: 10,
  },

  /* STEPS */
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepIndex: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepIndexText: {
    fontWeight: '900',
    color: '#111215',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: '#EDEDF5',
    fontSize: 14,
  },

  /* VIDEOS */
  videoCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 14,
  },
  videoBlue: { borderColor: '#0AA5FF', borderWidth: 2 },
  videoYellow: { borderColor: '#FFD600', borderWidth: 2 },
  videoLabel: {
    color: '#FFD600',
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  video: {
    width: '100%',
    height: 210,
    borderRadius: 10,
  },

  /* PRO TIP */
  proTip: { borderColor: '#0AA5FF' },
  proTipText: { color: '#B5E8FF', fontSize: 14 },

  /* MISTAKE */
  mistake: { borderColor: '#FF355E' },
  mistakeText: { color: '#FFB8C6', fontSize: 14 },

  /* BACK BTN */
  backBtn: {
    marginTop: 30,
    alignSelf: 'center',
    borderColor: '#FFD600',
    borderWidth: 2,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backBtnText: {
    color: '#FFD600',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
