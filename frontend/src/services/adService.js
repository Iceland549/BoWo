// // frontend/src/services/adService.js
// import { info, log, warn } from '../utils/logger';

// const AdService = {
//   init: async () => {
//     info('AdService.init (noop on platforms where not available)');
//   },

//   setTestIds: async () => {
//     try {
//       const { AdMobRewarded, AdMobInterstitial } = await import('expo-ads-admob');
//       AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
//       AdMobInterstitial.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
//     } catch (e) {
//       warn('AdService.setTestIds: expo-ads-admob not available', e);
//     }
//   },

//   showRewarded: async ({ onEarn = () => {}, onFail = () => {} } = {}) => {
//     try {
//       const { AdMobRewarded } = await import('expo-ads-admob');
//       log('AdService.showRewarded request');
//       await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917');
//       await AdMobRewarded.requestAdAsync();
//       await AdMobRewarded.showAdAsync();

//       const earnedHandler = () => {
//         log('AdService: user earned reward');
//         onEarn();
//       };
//       const failHandler = () => {
//         warn('AdService: failed to load/show rewarded');
//         onFail();
//       };

//       AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', earnedHandler);
//       AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', failHandler);
//     } catch (err) {
//       warn('AdService.showRewarded error (module missing or runtime)', err);
//       onFail(err);
//     }
//   }
// };

// export { AdService };
import { info, log, warn } from '../utils/logger';
import {
  InterstitialAd,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';

export const TEST_AD_UNITS = {
  banner: TestIds.BANNER,
  interstitial: TestIds.INTERSTITIAL,
  rewarded: TestIds.REWARDED,
};

const AdService = {
  init: async () => {
    info('AdService.init');
  },

  showInterstitial: async ({ onClose = () => {}, onFail = () => {} }) => {
    try {
      const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : TEST_AD_UNITS.interstitial;

      const interstitial = InterstitialAd.createForAdRequest(adUnitId);
      log('AdService: loading interstitial…');

      const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        log('AdService: interstitial loaded');
        interstitial.show();
      });

      const unsubscribeClosed = interstitial.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          log('AdService: interstitial closed');
          unsubscribe();
          unsubscribeClosed();
          onClose();
        }
      );

      const unsubscribeFail = interstitial.addAdEventListener(
        AdEventType.ERROR,
        (err) => {
          warn('AdService: interstitial failed', err);
          unsubscribe();
          unsubscribeClosed();
          unsubscribeFail();
          onFail(err);
        }
      );

      interstitial.load();
    } catch (err) {
      warn('AdService.showInterstitial error', err);
      onFail(err);
    }
  },
};

export { AdService };
