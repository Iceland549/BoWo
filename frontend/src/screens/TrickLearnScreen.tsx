import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
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
import { MEDIA_BASE_URL } from '../config/env';

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

// helper pour rendre les URLs robustes
const resolveMediaUrl = (raw?: string | null): string | null => {
  if (!raw) return null;

  // si c'est déjà une URL complète (http/https) → on touche à rien
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // si ça commence par "/" → on préfixe avec MEDIA_BASE_URL
  if (raw.startsWith('/')) {
    return `${MEDIA_BASE_URL}${raw}`;
  }

  // sinon → on met un "/" entre les deux
  return `${MEDIA_BASE_URL}/${raw}`;
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
    resolveMediaUrl(trick.images?.[0]) ??
    'https://images.pexels.com/photos/1762825/pexels-photo-1762825.jpeg';

  const proVideo = resolveMediaUrl(trick.proVideoUrl || undefined);
  const amateurVideo = resolveMediaUrl(trick.amateurVideoUrl || undefined);

  const hasAnyVideo = !!proVideo || !!amateurVideo;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenWrapper>
        {/* HERO */}
        <View style={styles.heroWrapper}>
          {mainImage && (
            <Image source={{ uri: mainImage }} style={styles.heroImage} />
          )}
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

            {proVideo && (
              <View style={[styles.videoCard, styles.videoBlue]}>
                <Text style={styles.videoLabel}>Pro Clip</Text>
                <Video
                  source={{ uri: proVideo }}
                  style={styles.video}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                />
              </View>
            )}

            {amateurVideo && (
              <View style={[styles.videoCard, styles.videoYellow]}>
                <Text style={styles.videoLabel}>Real Life Clip</Text>
                <Video
                  source={{ uri: amateurVideo }}
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
              keyExtractor={(u, i) => `${u}-${i}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagesList}
              renderItem={({ item }) => {
                const url = resolveMediaUrl(item);
                if (!url) return null;
                return <Image source={{ uri: url }} style={styles.stepImage} />;
              }}
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
      </ScreenWrapper>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // fond "bleu nuit" plus marqué, esprit Santa Cruz nocturne
    backgroundColor: '#050816',
  },
  content: {
    paddingBottom: 32,
  },

  // HERO
  heroWrapper: {
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050816CC',
  },
  heroTextWrap: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  heroTag: {
    color: '#FFD600',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  heroTitle: {
    color: '#F9FAFB',
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // SECTIONS
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  sectionTitle: {
    color: '#0AA5FF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  description: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
  },

  // VIDEOS
  videoCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 16,
  },
  videoBlue: {
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#0AA5FF',
  },
  videoYellow: {
    backgroundColor: '#451A03',
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  videoLabel: {
    color: '#F9FAFB',
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
  },

  // IMAGES
  imagesList: {
    paddingVertical: 4,
  },
  stepImage: {
    width: 220,
    height: 140,
    borderRadius: 16,
    marginRight: 10,
  },

  // STEPS
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  stepIndex: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepIndexText: {
    color: '#050816',
    fontWeight: '900',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
  },

  // PRO TIP & MISTAKE
  proTip: {
    backgroundColor: '#022C22',
    borderColor: '#22C55E',
  },
  proTipText: {
    color: '#BBF7D0',
  },
  mistake: {
    backgroundColor: '#450A0A',
    borderColor: '#F97373',
  },
  mistakeText: {
    color: '#FECACA',
  },

  // LOADING / ERROR
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050816',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#E5E7EB',
    fontSize: 14,
  },

  // BACK BUTTON
  backBtn: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: '#020617',
  },
  backBtnText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
});
