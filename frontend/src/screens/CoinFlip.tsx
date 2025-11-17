import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ImageSourcePropType
} from 'react-native';

// 👇 TES IMAGES
const skull: ImageSourcePropType = require('../../assets/coin/skull.jpg');
const astronaut: ImageSourcePropType = require('../../assets/coin/astronaut.jpg');

export default function KillerTimeCoinFlip() {
  const spinAnim = useRef(new Animated.Value(0)).current;

  const [face, setFace] = useState<'PILE' | 'FACE' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setFace(null);

    // reset
    spinAnim.setValue(0);

    // rotation rapide → lente
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const result = Math.random() < 0.5 ? 'PILE' : 'FACE';
      setFace(result);
      setIsFlipping(false);
    });
  };

  // 3D rotation
  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'], // 2 tours complets
  });

  // Face visible
  const currentImage =
    face === 'FACE'
      ? skull
      : face === 'PILE'
      ? astronaut
      : astronaut; // image pendant animation

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>
        “Pile tu perds... Face je gagne.”
      </Text>

      {/* -------- COIN ANIMÉ -------- */}
      <Animated.Image
        source={currentImage}
        style={[
          styles.coinImage,
          { transform: [{ rotateY }] }
        ]}
      />

      {/* -------- BUTTON -------- */}
      <TouchableOpacity
        style={[styles.flipBtn, isFlipping && { opacity: 0.5 }]}
        onPress={flipCoin}
        disabled={isFlipping}
      >
        <Text style={styles.flipText}>
          {isFlipping ? '...' : 'Lancer la pièce'}
        </Text>
      </TouchableOpacity>

      {/* -------- RESULT -------- */}
      {face && (
        <Text style={styles.result}>
          👉 {face === 'FACE' ? 'FACE 🎉' : 'PILE 😈'}
        </Text>
      )}
    </View>
  );
}

/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111215',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  quote: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
  },

  // COIN
  coinImage: {
    width: 160,
    height: 160,
    marginBottom: 40,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFD600',
    backfaceVisibility: 'hidden',
  },

  // BUTTON
  flipBtn: {
    backgroundColor: '#FF355E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD600',
  },
  flipText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // RESULT
  result: {
    marginTop: 40,
    color: '#0AA5FF',
    fontSize: 30,
    fontWeight: '900',
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },
});
