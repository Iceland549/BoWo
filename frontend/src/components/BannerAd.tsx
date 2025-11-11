import { AdMobBanner } from 'expo-ads-admob';
import React from 'react';
import { View } from 'react-native';
import { ADMOB_TEST_BANNER_ID } from '../config/env';
import { log } from '../utils/logger';

export default function BannerAd() {
  return (
    <View style={{ alignItems: 'center' }}>
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={ADMOB_TEST_BANNER_ID}
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={(err) => log('BannerAd error', err)}
      />
    </View>
  );
}
