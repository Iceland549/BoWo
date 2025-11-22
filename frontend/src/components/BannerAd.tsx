// import { AdMobBanner } from 'expo-ads-admob';
// import React from 'react';
// import { View } from 'react-native';
// import { ADMOB_TEST_BANNER_ID } from '../config/env';
// import { log } from '../utils/logger';

// export default function BannerAd() {
//   return (
//     <View style={{ alignItems: 'center' }}>
//       <AdMobBanner
//         bannerSize="fullBanner"
//         adUnitID={ADMOB_TEST_BANNER_ID}
//         servePersonalizedAds // true or false
//         onDidFailToReceiveAdWithError={(err) => log('BannerAd error', err)}
//       />
//     </View>
//   );
// }
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { TEST_AD_UNITS } from '../services/adService';
import { warn } from '../utils/logger';

export default function BannerAdComponent() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : TEST_AD_UNITS.banner}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={(e) => warn('BannerAd error', e)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    backgroundColor: '#111215',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
