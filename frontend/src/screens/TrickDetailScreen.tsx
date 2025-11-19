import React from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import useAds from '../hooks/useAds';
import { log } from '../utils/logger';

export default function TrickDetailScreen({ route, navigation }) {
  const trick = route.params.trick;
  const { showRewardedAndUnlock } = useAds();
  const userId = localStorage.getItem('userId');

  const onWatchAd = async () => {
    log('TrickDetailScreen.onWatchAd', trick.id || trick._id);
    try {
      const resp = await showRewardedAndUnlock({
        trickId: trick._id || trick.id,
        userId,
      });
      log('ad reward resp', resp);
      if (resp.success) {
        alert('Unlocked!');
        navigation.goBack();
      } else {
        alert(resp.message || 'No reward');
      }
    } catch (e) {
      console.warn('Ad failed or was not watched', e);
      alert('Ad failed or was not watched');
    }
  };

  if (!trick)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FFD600" />
      </View>
    );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* TITLE */}
        <Text style={styles.title}>{trick.name}</Text>

        {/* DESCRIPTION */}
        {trick.description && (
          <Text style={styles.description}>{trick.description}</Text>
        )}

        {/* IMAGES */}
        {(trick.images || []).map((src, i) => (
          <Image key={i} style={styles.image} source={{ uri: src }} />
        ))}

        {/* BUTTONS */}
        <View style={styles.buttonsWrap}>
          <TouchableOpacity style={styles.adBtn} onPress={onWatchAd}>
            <Text style={styles.adBtnText}>Pay Only 0.49e to Unlock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quizBtn}
            onPress={() =>
              navigation.navigate('Quiz', { trickId: trick._id || trick.id })
            }
          >
            <Text style={styles.quizBtnText}>Open Quiz</Text>
          </TouchableOpacity>
        </View>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.backBtnText}>← Back to Park</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

/* 🎨 SANTA CRUZ POP PUNK STYLES */
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111215',
    padding: 20,
    paddingBottom: 80,
  },

  loadingScreen: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* TITLE */
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0AA5FF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: '#FF355E',
    textShadowRadius: 6,
  },

  /* DESCRIPTION */
  description: {
    color: '#EDEDF5',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },

  /* IMAGE */
  image: {
    width: '100%',
    height: 200,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD600',
  },

  /* BUTTON AREA */
  buttonsWrap: {
    marginTop: 20,
    marginBottom: 20,
  },

  /* WATCH AD BUTTON */
  adBtn: {
    backgroundColor: '#FF355E',
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD600',
  },
  adBtnText: {
    fontWeight: '900',
    color: '#111215',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* OPEN QUIZ BUTTON */
  quizBtn: {
    backgroundColor: '#0AA5FF',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FF355E',
  },
  quizBtnText: {
    fontWeight: '900',
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* BACK BUTTON */
  backBtn: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: '#0AA5FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
  },
  backBtnText: {
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
