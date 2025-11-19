import React, { useRef, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ImageSourcePropType,
  ScrollView,
  Image,
  ImageBackground
} from 'react-native';

// 🖼️ Logo du mini-jeu
const logoFlip = require('../../../assets/logos/flip-coin2_logo.png');

// 🖼️ Fond personnalisé
const flipBG = require('../../../assets/coin/flip_wallpaper.png');

// 👇 Images de la pièce
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

    const duration = 5000 + Math.random() * 5000;

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

      const result = Math.random() < 0.5 ? 'PILE' : 'FACE';
      setFace(result);
      setDisplayImage(result === 'FACE' ? skull : astronaut);

      setIsFlipping(false);
    });
  };

  const rotateY = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '7200deg'],
  });

  return (
    <ImageBackground
      source={flipBG}
      style={styles.pageContainer}
      resizeMode="repeat"
      imageStyle={{ opacity: 0.20 }}   // 🔥 filtre léger Santa Cruz style
    >
      <ScreenWrapper>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* ───── LOGO ───── */}
            <Image source={logoFlip} style={styles.gameLogo} resizeMode="contain" />

            {/* ───── QUOTE ───── */}
            <Text style={styles.quote}>
              “Pile tu perds... Face je gagne.”
            </Text>

            {/* ───── COIN ───── */}
            <Animated.Image
              source={displayImage}
              style={[
                styles.coinImage,
                { transform: [{ rotateY }] }
              ]}
            />

            {/* ───── LANCER ───── */}
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

            {/* ───── BACK ───── */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
            >
              <Text style={styles.backText}>Back to Roots</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </ScreenWrapper>  
    </ImageBackground>
  );
}

/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#111215',
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 80,
  },

  container: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
  },

  gameLogo: {
    width: 400,
    height: 250,
    marginBottom: 10,
  },

  quote: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  coinImage: {
    width: 180,
    height: 180,
    marginBottom: 40,
    borderRadius: 100,
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
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: '#FF355E',
    textShadowRadius: 4,
    textAlign: 'center',
  },

  backBtn: {
    marginTop: 60,
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
