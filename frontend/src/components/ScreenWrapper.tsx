// frontend/src/components/ScreenWrapper.tsx
import React from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import BannerAd from './BannerAd';

// ✅ bon chemin vers le logo BoWo
const bowoLogo = require('../../assets/images/bowo2_logo.png');

type Props = {
  children: React.ReactNode;
};

export default function ScreenWrapper({ children }: Props) {
  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>{children}</View>

        {/* 🔥 Footer BoWo commun à toutes les pages */}
        <View style={styles.footer}>
          <Image
            source={bowoLogo}
            style={styles.logo}
            resizeMode="contain"
          />
          <BannerAd />  
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3a1a6b',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  body: {
    flexGrow: 1,
    paddingTop: 20,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 8,
  },
  // ✨ Logo BoWo avec bordure & glow néon
  logo: {
    width: 200,
    height: 200,
    borderRadius: 120,

    // contour jaune "sticker"
    borderWidth: 5,
    borderColor: '#FEE54A',

    // glow néon
    shadowColor: '#FFEA00',
    shadowOpacity: 1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },

    // Android
    elevation: 40,
  },
});
