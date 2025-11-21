import { AdService } from '../services/adService';
import { log, warn } from '../utils/logger';

export default function useInterstitialNavigation() {
  return async function navigateWithAd(next) {
    try {
      await AdService.showInterstitial({
        onClose: () => {
          log('Interstitial closed → continue navigation');
          next();
        },
        onFail: () => {
          warn('Interstitial failed → fallback navigation');
          next();
        },
      });
    } catch (err) {
      warn('navigateWithAd error (fallback)', err);
      next();
    }
  };
}
