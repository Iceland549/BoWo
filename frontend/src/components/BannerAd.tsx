// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
// import { TEST_AD_UNITS } from '../services/adService';
// import { warn } from '../utils/logger';

// export default function BannerAdComponent() {
//   return (
//     <View style={styles.container}>
//       <BannerAd
//         unitId={__DEV__ ? TestIds.BANNER : TEST_AD_UNITS.banner}
//         size={BannerAdSize.BANNER}
//         onAdFailedToLoad={(e) => warn('BannerAd error', e)}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingVertical: 4,
//     backgroundColor: '#111215',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// AdMob disabled for Expo Go

import React from 'react';
import { View } from 'react-native';

export default function BannerAdComponent() {
  // Return nothing so Expo Go stays stable
  return <View />;
}
