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
const skull: ImageSourcePropType = require('../../../assets/coin/skull.jpg');
const astronaut: ImageSourcePropType = require('../../../assets/coin/astronaut.jpg');

export default function KillerTimeCoinFlip({ navigation }) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  const [face, setFace] = useState<'PILE' | 'FACE' | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayImage, setDisplayImage] = useState<ImageSourcePropType>(astronaut);

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setFace(null);

    spinAnim.setValue(0);

    // ⏱ durée random : 5 à 10 secondes
    const duration = 5000 + Math.random() * 5000;

    // 🔄 alternance des faces pendant la rotation (toutes les 80ms)
    const interval = setInterval(() => {
      setDisplayImage(prev => (prev === astronaut ? skull : astronaut));
    }, 80);

    Animated.timing(spinAnim, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      clearInterval(interval);

      // 🎲 résultat final
      const result = Math.random() < 0.5 ? 'PILE' : 'FACE';
      setFace(result);
      setDisplayImage(result === 'FACE' ? skull : astronaut);

      setIsFlipping(false);
    });
  };

  // 🔁 rotation 3D infiniment plus naturelle
  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '7200deg'], // multi-tours
  });

  return (
    <View style={styles.container}>
      
      {/* ───── QUOTE ───── */}
      <Text style={styles.quote}>
        “Pile tu perds... Face je gagne.”
      </Text>

      {/* ───── COIN ANIMÉ ───── */}
      <Animated.Image
        source={displayImage}
        style={[
          styles.coinImage,
          { transform: [{ rotateY }] }
        ]}
      />

      {/* ───── BOUTON LANCER ───── */}
      <TouchableOpacity
        style={[styles.flipBtn, isFlipping && { opacity: 0.5 }]}
        onPress={flipCoin}
        disabled={isFlipping}
      >
        <Text style={styles.flipText}>
          {isFlipping ? '...' : 'Lancer la pièce'}
        </Text>
      </TouchableOpacity>

      {/* ───── RÉSULTAT ───── */}
      {face && (
        <Text style={styles.result}>
          👉 {face === 'FACE' ? 'FACE 🎉' : 'PILE 😈'}
        </Text>
      )}

      {/* ───── BACK TO PARK ───── */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
      >
        <Text style={styles.backText}>Back to Profile</Text>
      </TouchableOpacity>
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

  coinImage: {
    width: 160,
    height: 160,
    marginBottom: 40,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFD600',
    backfaceVisibility: 'hidden',
  },

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

  result: {
    marginTop: 40,
    color: '#0AA5FF',
    fontSize: 30,
    fontWeight: '900',
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
  },

  /* ---- BUTTON RETOUR ---- */
  backBtn: {
    marginTop: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD600',
    backgroundColor: '#0AA5FF',
  },
  backText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
