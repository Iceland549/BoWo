import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import useInterstitialNavigation from '@/hooks/useInterstitialNavigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TrickCard({ trick }) {
  const navigation = useNavigation<Nav>();
  const navigateWithAd = useInterstitialNavigation();

  const fallbackImage = require('../../assets/images/home.jpg');
  const finalImage = trick?.images?.[0]
    ? { uri: trick.images[0] }
    : fallbackImage;

  const isUnlocked = trick?.isUnlocked;
  const locked = !isUnlocked;

  const handlePress = () => {
    if (isUnlocked) {
      navigateWithAd(() =>
        navigation.navigate('TrickLearn', { trickId: trick.id || trick._id })
      );
    } else {
      navigation.navigate('TrickDetail', { trick });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={[styles.card, locked && styles.cardLocked]}>
        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <Image source={finalImage} style={styles.image} />

          {/* 🔒 Overlay verrou */}
          {locked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={46} color="#FFD600" />
            </View>
          )}
        </View>

        {/* NAME */}
        <View style={styles.info}>
          <Text style={[styles.title, locked && styles.titleLocked]}>
            {trick.name}
          </Text>

          {trick?.difficulty && (
            <Text style={styles.difficulty}>Difficulty: {trick.difficulty}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1B20',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#0AA5FF',
  },

  cardLocked: {
    opacity: 0.45,
  },

  imageWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  lockOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  info: {
    padding: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: '#0AA5FF',
    letterSpacing: 1,
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },

  titleLocked: {
    color: '#FFD600',
  },

  difficulty: {
    marginTop: 4,
    fontSize: 12,
    color: '#FFD600',
    fontWeight: '700',
  },
});
